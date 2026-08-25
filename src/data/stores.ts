import type { Store, Review, BrandingAsset } from '../types'
import { posters } from './posters'

let seq = 0
const r = (text: string, rating: number, tone: Review['tone'], tags: string[]): Review => ({
  id: `rv-${++seq}`, text, rating, tone, tags,
})

const TITLES = { stars: 'Five-Star Card', scan: 'Scan & Review', quote: 'Quote Card', badge: 'Rating Badge' } as const

const branding = (
  name: string, a: string, b: string,
  kinds: (keyof typeof posters)[], captions: string[],
): BrandingAsset[] =>
  kinds.map((k, i) => ({
    id: `${k}-${i}`,
    title: TITLES[k as keyof typeof TITLES],
    caption: captions[i],
    poster: posters[k](a, b, name),
  }))

export const stores: Store[] = [
  {
    id: 's1',
    slug: 'chickato-mmda',
    name: 'Chickato Crispy Fried Chicken MMDA',
    category: 'restaurant',
    tagline: 'Crispy fried chicken, burgers and sandwiches in MMDA Colony',
    address:
      'No.p2, MMDA Main Road, near Post Office, Annish Nagar, Q Block, MMDA Colony, Arumbakkam, Chennai, Tamil Nadu 600106',
    phone: '',
    hours: 'Dine-in · Takeaway',
    rating: 4.3,
    reviewCount: 16,
    mapsUrl: 'https://maps.app.goo.gl/Q82z7WcNyXqJi9d57',
    // Decimal form of 0x67ff2a7aca71306f from the listing URL. Drives the
    // direct-to-review-box link in mapsLinks.ts.
    cid: '7493755011838586991',
    // MMDA Colony, Arumbakkam. Drives the map banner until a storefront photo
    // is added; drop a file in public/shops/ and set bannerImage to use one.
    coords: { lat: 13.0694, lng: 80.2143 },
    accent: ['#f59e0b', '#dc2626'],
    logoMark: 'C',
    reviews: [
      r('The chicken is properly crispy on the outside and still juicy inside — exactly what you want and honestly harder to find than it should be. Portion was generous for the price too.', 5, 'detailed', ['fried-chicken', 'value', 'portions']),
      r('Quick service and hot food. Ordered takeaway and it was ready faster than they quoted.', 5, 'concise', ['takeaway', 'fast']),
      r('Came here with family after hearing about it locally and none of us were disappointed. The spice level is well judged — flavourful without being overwhelming for the kids.', 5, 'warm', ['family', 'spice']),
      r('Great value for money. Two of us ate well and the bill was still under what a single main costs elsewhere in Chennai.', 5, 'concise', ['value', 'pricing']),
      r('The burgers deserve more attention than they get. Fresh bun, well seasoned patty, and they do not skimp on the fillings. Easily my regular order now.', 5, 'detailed', ['burgers', 'regular']),
      r('Absolutely loved it! Ordered the crispy chicken and it arrived hot, golden and perfectly seasoned. Will definitely be coming back.', 5, 'enthusiastic', ['fried-chicken']),
      r('Easy to find right on MMDA Main Road near the post office, and there was no long wait even in the evening rush.', 5, 'concise', ['location', 'wait-time']),
      r('The staff were friendly and patient while we made up our minds about the menu. Small thing, but it makes the visit better.', 5, 'warm', ['staff', 'service']),
      r('Clean setup and the food comes out fresh rather than sitting under a lamp. You can taste the difference immediately.', 5, 'detailed', ['hygiene', 'freshness']),
      r('Good sandwiches and the chicken is consistently crispy across the few visits I have made. Consistency is what keeps me ordering.', 5, 'warm', ['sandwiches', 'consistency']),
      r('Solid spot for a quick bite in Arumbakkam. Fair prices, tasty food, no fuss.', 4, 'concise', ['quick-bite']),
      r('Ordered for a small get-together and everything arrived on time and still warm. Packaging held up well on the way home.', 5, 'detailed', ['group', 'delivery', 'packaging']),
    ],
    branding: branding('Chickato Crispy Fried Chicken', '#f59e0b', '#dc2626', ['scan', 'stars', 'quote', 'badge'], [
      'Place near the billing counter or on the table.',
      'Print for the entrance or menu board.',
      'Share to Instagram stories after a visit.',
      'Attach to takeaway bags and delivery orders.',
    ]),
  },
]

export const storeBySlug = (slug: string) => stores.find(s => s.slug === slug)
