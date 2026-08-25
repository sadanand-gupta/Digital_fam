export type StoreCategory = 'clinic' | 'restaurant' | 'salon' | 'retail' | 'automotive' | 'fitness'

/**
 * How positive a review reads. Doubles as the visitor-facing filter, so the
 * options are worded the way someone would describe their own visit.
 *
 * Deliberately stops at 'ok' — the lowest tier is still a fair 3-star write-up
 * that mentions a genuine niggle, so the listing keeps a healthy average.
 * Anyone who had a bad visit should write their own words, not copy ours.
 */
export type Sentiment = 'great' | 'good' | 'fine' | 'ok'

export interface Review {
  id: string
  text: string
  rating: number
  sentiment: Sentiment
  tags: string[]
}

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  great: 'Great',
  good: 'Good',
  fine: 'Pretty good',
  ok: 'It was okay',
}

/** Filter order, best first. */
export const SENTIMENTS: Sentiment[] = ['great', 'good', 'fine', 'ok']

export interface Store {
  id: string
  slug: string
  name: string
  category: StoreCategory
  tagline: string
  address: string
  phone: string
  hours: string
  rating: number
  reviewCount: number
  /** Link to the listing itself (directions, hours, photos). */
  mapsUrl: string
  /**
   * Google Place ID, e.g. 'ChIJN1t_tDeuEmsRUsoyG83frY4'. When present the site
   * can deep-link straight into the review composer instead of the listing.
   * Find one at https://developers.google.com/maps/documentation/places/web-service/place-id
   */
  placeId?: string
  /**
   * Google feature ID — the `!1s0x…:0x…` value in a Maps place URL, e.g.
   * '0x3a5267c0fda62023:0x67ff2a7aca71306f'. Used to build the review deep
   * link when no Place ID is available. Take it straight from the listing URL
   * (resolve a maps.app.goo.gl short link first).
   */
  featureId?: string
  /**
   * Storefront/banner image shown across the top of the store page. Put the
   * file in public/shops/ and reference it as '/shops/<file>'; a remote URL
   * works too. Falls back to the gradient banner when absent.
   *
   * Google Maps photos cannot be hotlinked — they sit behind signed, expiring
   * URLs — so download the photo (or use the owner's own) and serve it here.
   */
  bannerImage?: string
  /** Alt text for bannerImage; defaults to the store name when omitted. */
  bannerAlt?: string
  /** Latitude/longitude of the storefront, for the map preview. */
  coords?: { lat: number; lng: number }
  /** Two-stop gradient used across the store's cards and hero */
  accent: [string, string]
  logoMark: string
  reviews: Review[]
}

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  clinic: 'Clinic & Healthcare',
  restaurant: 'Restaurant & Cafe',
  salon: 'Salon & Spa',
  retail: 'Retail & Boutique',
  automotive: 'Automotive',
  fitness: 'Fitness & Wellness',
}
