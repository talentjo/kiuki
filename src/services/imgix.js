import { IMGIX_DOMAIN } from '@/config'

// options https://docs.imgix.com/apis/rendering/
const imgix = (url, options) => {
  if (!url) return
  const dpr = Math.min(Math.max(window.devicePixelRatio, 1), 2)

  const params = new URLSearchParams({
    ...{ auto: 'format', q: 90, dpr },
    ...options
  }).toString()

  const path = new URL(url).pathname

  return `https://${IMGIX_DOMAIN}${path}?${params}`
}

export default imgix
