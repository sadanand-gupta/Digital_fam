import type { Store } from '../types'

/**
 * Deep link that opens Google's "write a review" dialog for a place.
 * Requires a Place ID — it cannot be built from a business name.
 * On phones with the Maps app installed this hands off to the app.
 */
export function reviewUrl(store: Store): string | null {
  if (!store.placeId) return null
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(store.placeId)}`
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
