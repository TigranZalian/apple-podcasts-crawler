import { CheerioCrawler } from 'crawlee';
import { PODCASTS_VIEW_GLOB, BASE_URL, LABEL_PODCASTS_VIEW, LABEL_PODCAST, PODCAST_GLOB } from './constants';
import { JsonTable } from './JsonTable';
import { PodcastData, PodcastDataWithInfo } from './PodcastData';
import { extractPodcastData } from './podcastDataExtractor';
import { ProcessedRequestsTracker } from './ProcessedRequestsTracker';

// set to undefined to run in production
const LIMIT = undefined

const processedRequestsTracker = new ProcessedRequestsTracker('podcasts')
const podcastsDataTable = new JsonTable<PodcastDataWithInfo>('podcasts', { static: true })
const brokenPodcastsDataTable = new JsonTable<{ url: string }>('broken-podcasts', { static: true })

const savePodcastData = (podcastData: PodcastData) => podcastsDataTable.pushData({ ...podcastData, ScrapedAt: new Date().toISOString() })

const crawler = new CheerioCrawler({
  maxRequestRetries: 5,
  maxRequestsPerMinute: 1000,

  async requestHandler({ enqueueLinks, log, request, $ }) {
    if (request.skipNavigation) {
      log.debug(`Skipping ${request.url}`)
      return
    }
    
    log.debug(`Processing ${request.url}`);

    if (!request.label || request.label === LABEL_PODCASTS_VIEW) {
      await enqueueLinks({
        globs: [PODCASTS_VIEW_GLOB],
        label: LABEL_PODCASTS_VIEW,
        limit: LIMIT
      })
    }

    if (request.label === LABEL_PODCASTS_VIEW) {
      await enqueueLinks({
        globs: [PODCAST_GLOB],
        label: LABEL_PODCAST,
        limit: LIMIT,
        transformRequestFunction: (req) => {
          req.skipNavigation = processedRequestsTracker.isRequestProcessed(req.uniqueKey || req.url)
          return req
        }
      })
      return
    }

    if (request.label === LABEL_PODCAST) {
      log.info(`Fetching podcast ${request.url}`)

      const podcastData = extractPodcastData($, request)

      if (podcastData) {
        savePodcastData(podcastData)
      } else {
        log.warning(`Broken podcast ${request.url}`)
        brokenPodcastsDataTable.pushData({ url: request.url })
      }

      processedRequestsTracker.track(request.uniqueKey)
    }
  },
});

async function main() {
  await processedRequestsTracker.init()
  await crawler.run([BASE_URL]);
}

main()
