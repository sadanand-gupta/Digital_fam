import type { Store } from '../types'
import { chickatoReviews } from './chickatoReviews'

/**
 * The one business this deployment serves. Each client gets their own build,
 * so there is no array and no lookup by slug.
 *
 * Getting the Maps values for a new shop:
 *  1. Resolve the share link:
 *     curl -sSL -o /dev/null -w '%{url_effective}' <maps.app.goo.gl link>
 *  2. Take the `!1s0x…:0x…` value from that URL as `featureId`. A real
 *     `ChIJ…` `placeId` is better if you can get one — see mapsLinks.ts.
 */
export const store: Store = {
  name: 'Chickato Crispy Fried Chicken MMDA',
  tagline: 'Crispy fried chicken, burgers and shawarma in MMDA Colony',
  address:
    'No.p2, MMDA Main Road, near Post Office, Annish Nagar, Q Block, MMDA Colony, Arumbakkam, Chennai, Tamil Nadu 600106',
  phone: '+91 78240 51456',
  hours: 'Dine-in · Takeaway',
  rating: 4.3,
  reviewCount: 17,
  mapsUrl: 'https://maps.app.goo.gl/Q82z7WcNyXqJi9d57',
  featureId: '0x3a5267c0fda62023:0x67ff2a7aca71306f',
  // Written per star level. The star row filters these by `rating`; 1 and 2
  // stars deliberately have no entries.
  reviews: chickatoReviews,
}
