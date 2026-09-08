/**
 * One prewritten review a visitor can pick.
 *
 * `rating` is the only axis. The star row IS the picker, so the old
 * `sentiment` field (great/good/fine/ok) was a second name for the same thing
 * and has been dropped along with the unrendered `tags`.
 *
 * Nothing below 3 exists on purpose. Someone who had a genuinely bad visit
 * should write their own words and report it to the owner directly — see
 * REPORT_ISSUE in data/chickatoReviews.ts and components/ReportIssue.vue.
 */
export interface Review {
  id: string
  text: string
  /** 3, 4 or 5. Drives which star tap reveals this review. */
  rating: 3 | 4 | 5
}

export interface Store {
  name: string
  tagline: string
  address: string
  phone: string
  hours: string
  /** The listing's current Google average, shown under the name. */
  rating: number
  reviewCount: number
  /** Link to the listing itself (directions, hours, photos). */
  mapsUrl: string
  /**
   * Google Place ID, e.g. 'ChIJN1t_tDeuEmsRUsoyG83frY4'. When present the site
   * can deep-link straight into the review composer instead of the listing.
   */
  placeId?: string
  /**
   * Google feature ID — the `!1s0x…:0x…` value in a Maps place URL. Used to
   * build the review deep link when no Place ID is available. Take it from
   * the listing URL (resolve a maps.app.goo.gl short link first).
   */
  featureId?: string
  reviews: Review[]
}
