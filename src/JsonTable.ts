import { Dictionary } from '@crawlee/types'
import fs from 'fs'

export interface JsonTableOptions {
  static?: boolean
}

export class JsonTable<Node extends Dictionary = Dictionary> {
  private static readonly basePath = 'data'
  private readonly path: string

  constructor(name: string, opts?: JsonTableOptions) {
    const timestampPrefix = opts?.static ? '' : Date.now() + '-'
    this.path = `${JsonTable.basePath}/${timestampPrefix}${name}.jsonl`
    this.setupDataset()
  }

  private setupDataset(): void {
    if (!fs.existsSync(JsonTable.basePath)){
      fs.mkdirSync(JsonTable.basePath)
    }
    
    if (!fs.existsSync(this.path)) {
      fs.openSync(this.path, 'a')
    }
  }

  pushData(item: Node | Node[]): void {
    if (Array.isArray(item)) {
      return item.forEach((el) => this.pushData(el))
    }

    fs.promises.appendFile(this.path, JSON.stringify(item) + '\n', { encoding: 'utf-8' })
  }

  async getDataRaw(): Promise<string> {
    const data = await fs.promises.readFile(this.path, { encoding: 'utf-8' })
    return data.toString()
  }

  async getData(): Promise<Node[]> {
    try {
      const data = await this.getDataRaw()
      return data.trim().split('\n').map((el) => JSON.parse(el) as Node)
    } catch {
      return []
    }
  }
}
