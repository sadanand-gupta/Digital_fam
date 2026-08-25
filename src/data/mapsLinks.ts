import type { Store } from '../types'

/**
 * Deep link that opens Google's "write a review" dialog for a place.
 *
 * Three routes in, tried in order of reliability:
 *
 *  1. `placeId` ('ChIJ…') via search.google.com/local/writereview — Google's
 *     documented endpoint. Note it accepts ONLY a Place ID: passing a CID
 *     there returns HTTP 400, so never build that URL from `cid`.
 *  2. `featureId` ('0x…:0x…', the `!1s` value in a Maps place URL) via the
 *     `!12e1` review action on maps.google.com. This is what a share link
 *     gives you when no Place ID is available.
 *  3. Nothing — the caller falls back to the plain listing.
 *
 * On phones with the Maps app installed, both working forms hand off to it.
 */
export function reviewUrl(store: Store): string | null {
  if (store.placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(store.placeId)}`
  }
  if (store.featureId) {
    // !4m3!3m2!1s<featureId>!12e1 — open the place, then its review composer.
    return `https://www.google.com/maps/place//data=!4m3!3m2!1s${store.featureId}!12e1`
  }
  return null
}

/**
 * Where the primary "leave a review" button should send someone: the review
 * composer when we can build one, otherwise the listing so they can still get
 * there in a tap or two.
 */
export function bestReviewTarget(store: Store): { url: string; direct: boolean } {
  const direct = reviewUrl(store)
  return direct ? { url: direct, direct: true } : { url: store.mapsUrl, direct: false }
}
