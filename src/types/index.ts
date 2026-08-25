export type StoreCategory = 'clinic' | 'restaurant' | 'salon' | 'retail' | 'automotive' | 'fitness'

export interface Review {
  id: string
  text: string
  rating: number
  tags: string[]
  tone: 'warm' | 'concise' | 'detailed' | 'enthusiastic'
}

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
   * Google CID — the number in a `maps.google.com/?cid=` link, and the decimal
   * form of the trailing hex in a place URL's `!1s0x…:0x…` segment. Used to
   * build the review deep link when no Place ID is available.
   */
  cid?: string
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
