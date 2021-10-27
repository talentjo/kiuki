import currencyList from '@/assets/currencyList.json'
import router from '@/router'
import { ALGOLIA_INDEX } from '@/config.js'

export default (data, offering = data.offering || data.offerings[0]) => ({
  product_id: data.id,
  name: data.name,
  sku: offering.unique_identifier,
  brand: data.owner.name,
  variant: offering.name,
  price: getPrice(offering.price, offering.currency),
  currency: offering.currency,
  quantity: offering && offering.quantity ? offering.quantity : 1,
  url: `${location.protocol}//${location.host}${router.resolve({ name: 'itemPage', params: { slug: data.slug } }).href}`,
  image_url: data.pictures[0],
  objectID: data.id, // algolia specific
  index: ALGOLIA_INDEX // algolia specific
})

const getPrice = (price, currency) => (
  price / Math.pow(10, currencyList[currency].fractionSize)
)
