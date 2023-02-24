import { JsonTable } from './JsonTable';

interface UniqueRequest {
  uniqueKey: string
}

export class ProcessedRequestsTracker {
  private readonly jsonTable: JsonTable<UniqueRequest>

  private uniqueRequests: UniqueRequest[] | undefined

  constructor(public readonly alias: string) {
    this.jsonTable = new JsonTable(`processed_requests-${alias}`, { static: true })
  }

  track(uniqueKey: string): void {
    if (!this.uniqueRequests) {
      throw `${ProcessedRequestsTracker.name} is not initialised`
    }

    this.jsonTable.pushData({ uniqueKey })
  }

  async init() {
    this.uniqueRequests = await this.jsonTable.getData()
  }

  isRequestProcessed(uniqueKey: string): boolean {
    if (!this.uniqueRequests) {
      throw `${ProcessedRequestsTracker.name} is not initialised`
    }

    return !!this.uniqueRequests.find((node) => node.uniqueKey === uniqueKey)
  }
}
