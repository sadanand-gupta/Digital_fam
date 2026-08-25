import type { Store, Review } from '../types'

let seq = 0
const r = (text: string, rating: number, sentiment: Review['sentiment'], tags: string[]): Review => ({
  id: `rv-${++seq}`, text, rating, sentiment, tags,
})

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
    // The !1s value from the Maps listing URL. Drives the direct-to-review-box
    // link in mapsLinks.ts.
    featureId: '0x3a5267c0fda62023:0x67ff2a7aca71306f',
    // MMDA Colony, Arumbakkam. Drives the map banner until a storefront photo
    // is added; drop a file in public/shops/ and set bannerImage to use one.
    coords: { lat: 13.0694, lng: 80.2143 },
    accent: ['#03153d', '#7d631f'],
    logoMark: 'C',
    reviews: [
      // Great — unreserved 5s, still specific rather than gushing.
      r("Chicken was proper crispy, not the soggy reheated kind. Ordered the fried chicken and a burger, both came out hot. For the price honestly cannot complain.", 5, 'great', ['fried-chicken', 'value']),
      r("Been here maybe four or five times now and it has been the same every time. That is the main thing for me, I know what I am getting.", 5, 'great', ['consistency', 'regular']),
      r("Got the chicken and finished it standing outside because I could not wait. Crunchy outside, still juicy inside. Will be back.", 5, 'great', ['fried-chicken']),
      r("Ordered late, around 9ish, still fresh. Not sitting under a lamp for hours like some places. Guy at the counter was nice about my hundred questions.", 5, 'great', ['freshness', 'staff']),
      r("My kids kept asking to come back so that says it. Spice is mild enough for them but still has flavour. We got the burger and chicken, both finished.", 5, 'great', ['family', 'spice']),
      r("Small place, nothing fancy, but the food does the talking. Better than the big chains and half the price.", 5, 'great', ['value']),

      // Good — solid 4s with one honest caveat, which is what real 4s look like.
      r("Good chicken, no complaints there. Only thing is seating is limited so we ended up taking it away. Fine by us but worth knowing.", 4, 'good', ['seating', 'takeaway']),
      r("Burger was really good, chicken was good too. Took a little longer than expected but it was a busy evening so fair enough.", 4, 'good', ['burgers', 'wait-time']),
      r("Solid place for a quick bite. Right on MMDA Main Road so easy to find. Parking is a bit of a hunt in the evening.", 4, 'good', ['location', 'parking']),
      r("Tasty and fresh, portions decent for what you pay. Would have liked a few more veg options for my friend but the chicken was spot on.", 4, 'good', ['portions', 'menu']),

      // Pretty good — genuine 4s, slightly more measured.
      r("Did the job. Chicken was crispy and hot, sandwich was alright. Nothing life changing but I would order again if I am around here.", 4, 'fine', ['fried-chicken', 'sandwiches']),
      r("Ordered takeaway twice. First time was great, second time slightly less crispy by the time I got home, but that is probably on me for the drive.", 4, 'fine', ['takeaway', 'packaging']),
      r("Decent food at a decent price. Place was clean when I went. Staff were polite, service was quick enough.", 4, 'fine', ['hygiene', 'service']),
      r("Went on a whim since I was passing through Arumbakkam. Chicken was good, crispy like it should be. Not a big place so we stood and ate, but no complaints.", 4, 'fine', ['fried-chicken', 'seating']),

      // It was okay — fair 3s. Still constructive, never damning.
      r("Chicken was good but I found it a bit oily that day. Might have just been my batch. The taste was there though and the guy was friendly.", 3, 'ok', ['fried-chicken', 'oily']),
      r("Food was fine, nothing wrong with it. Waited about fifteen minutes which felt long for a takeaway order. Would give it another go on a quieter day.", 3, 'ok', ['wait-time']),
      r("Alright for the price. Chicken was crispy but I would have liked it a bit more seasoned. Everything else was okay.", 3, 'ok', ['seasoning', 'value']),
      r("Food was okay, chicken was crispy enough. Place gets crowded in the evening and there is barely anywhere to stand. Better as a takeaway I think.", 3, 'ok', ['crowded', 'takeaway']),
    ],
  },
]

export const storeBySlug = (slug: string) => stores.find(s => s.slug === slug)
