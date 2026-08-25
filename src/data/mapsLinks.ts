import type { Store } from '../types'

/**
 * Deep link that opens Google's "write a review" dialog for a place.
 *
 * Two routes in, because the two IDs Google hands out take different URLs:
 *  - placeId ('ChIJ…'), from the Places API or the Place ID finder
 *  - cid, the number in a `maps.google.com/?cid=` link. It is also the second
 *    hex value in a place URL's `data=…!1s0x…:0x…` segment — convert that
 *    trailing hex to decimal and store it here.
 *
 * Neither can be derived from a business name. On phones with the Maps app
 * installed both hand off to the app.
 */
export function reviewUrl(store: Store): string | null {
  if (store.placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(store.placeId)}`
  }
  if (store.cid) {
    return `https://search.google.com/local/writereview?placeid=&cid=${encodeURIComponent(store.cid)}`
  }
  return null
}

/**
 * Where the primary "leave a review" button should send someone: the review
 * composer when we have a Place ID, otherwise the listing so they can still
 * get there in a tap or two.
 */
export function bestReviewTarget(store: Store): { url: string; direct: boolean } {
  const direct = reviewUrl(store)
  return direct ? { url: direct, direct: true } : { url: store.mapsUrl, direct: false }
}
