import algoliasearch from 'algoliasearch/lite'
import { ALGOLIA_APP, ALGOLIA_KEY } from '@/config'

const algolia = algoliasearch(
  ALGOLIA_APP,
  ALGOLIA_KEY
)

/* Do not send empty query on init */
export const agoliaWithoutEmpty = {
  ...algolia,
  search (requests) {
    if (requests.every(({ params }) => !params.query && !params.filters && !params.optionalFilters)) {
      return Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          nbHits: 0,
          nbPages: 0,
          page: 0,
          processingTimeMS: 0
        }))
      })
    }
    return algolia.search(requests)
  }
}

export default agoliaWithoutEmpty
