export type StoreCategory = 'clinic' | 'restaurant' | 'salon' | 'retail' | 'automotive' | 'fitness'

export interface Review {
  id: string
  text: string
  rating: number
  tags: string[]
  tone: 'warm' | 'concise' | 'detailed' | 'enthusiastic'
}

export interface BrandingAsset {
  id: string
  title: string
  caption: string
  /** Inline SVG poster markup rendered as the visual */
  poster: string
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
  /** Two-stop gradient used across the store's cards and hero */
  accent: [string, string]
  logoMark: string
  reviews: Review[]
  branding: BrandingAsset[]
}

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  clinic: 'Clinic & Healthcare',
  restaurant: 'Restaurant & Cafe',
  salon: 'Salon & Spa',
  retail: 'Retail & Boutique',
  automotive: 'Automotive',
  fitness: 'Fitness & Wellness',
}
