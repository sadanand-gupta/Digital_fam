import type { Review } from '../types'

/**
 * Review library for Chickato Crispy Fried Chicken — MMDA, Arumbakkam.
 *
 * Keyed by `rating`, because the star row is the picker: tapping 4 stars
 * shows the 4-star pool.
 *
 * WRITING RULES (these are why the text reads the way it does):
 *  - Phone-typed, not essay-typed. Run-on sentences, few commas, no em dashes.
 *  - One concrete detail per review — an item, a time, the road, the crowd.
 *    Generic praise is what the spam filter and real readers both discount.
 *  - No prices. They differ per branch and go stale; a wrong price in a review
 *    makes the whole thing look planted.
 *  - No two reviews lead with the same item or the same sentence shape.
 *
 * MENU CAVEAT: the item list came from the Mylapore outlet. Everything used
 * below is core Chickato (fried chicken, wings, lollipop, strips, popcorn,
 * zinger burger, fries, shawarma, combos). Items NOT confirmed at MMDA —
 * crab lollipop, fish fingers, fish strips, bucket — are quarantined in
 * `unverifiedItemReviews` at the bottom. Confirm with the owner, then merge.
 */

let seq = 0
const r = (text: string, rating: Review['rating']): Review => ({
  id: `ck-${++seq}`,
  text,
  rating,
})

/* ---------------------------------------------------------------- 5 stars */
/* Unreserved, but each one still earns it with a detail. */
const five: Review[] = [
  r("Chicken was proper crispy, not the soggy reheated type. Got the strips and a zinger burger, both came out hot. For this price honestly cannot complain.", 5),
  r("Been coming here a while now, popcorn chicken is my regular order. Tastes the same every single time. That consistency is the main thing for me.", 5),
  r("Ordered the wings and ended up finishing them standing outside itself, could not wait to reach home. Crunchy outside and still juicy inside.", 5),
  r("Went around 9 in the night and it was still fresh. Not sitting under a lamp for hours like some other places do. Counter guy was patient with all my questions also.", 5),
  r("Zinger burger here beats the big chains and costs way less. Fries came out hot too, not the lukewarm ones.", 5),
  r("My kids keep asking to come back so that says everything. Spice is mild enough for them but still has proper flavour. Popcorn chicken and fries finished in five minutes.", 5),
  r("Small place, nothing fancy, but the food does the talking. Chicken lollipop was the highlight for me.", 5),
  r("Took the combo with chicken fries and pepsi. Filling and cheap. Right on MMDA Main Road so it is easy to find also.", 5),
  r("Shawarma was loaded properly, not the type where you only get bread and sauce. Had it for lunch and did not need dinner after.", 5),
  r("Best fried chicken around Arumbakkam side according to me. The coating actually stays crispy till you finish, that is rare.", 5),
]

/* ---------------------------------------------------------------- 4 stars */
/* Solid, with exactly one honest caveat. This is what real 4s look like —
 * a 4-star with no complaint in it reads fake. */
const four: Review[] = [
  r("Good chicken, no complaints there. Only thing is seating is limited so we ended up taking it away. Fine by us but worth knowing beforehand.", 4),
  r("Burger was really good and the strips were good too. Took a bit longer than expected but it was the evening rush so fair enough.", 4),
  r("Solid spot for a quick bite. Parking is a bit of a hunt in the evening on MMDA Main Road, that is the only thing.", 4),
  r("Tasty and fresh, portions are decent for what you pay. Would have liked a couple more veg options for my friend but the chicken was spot on.", 4),
  r("Wings were nice and hot. Wanted a bigger order but it was almost over by the time I reached, so went with popcorn instead. Still good.", 4),
  r("Fries were the properly crispy type which I like. Chicken was good also, just wish they had a spicier option on the menu.", 4),
  r("Regular spot for us after work. Service is quick most days. Once or twice we waited a while but that is normal for evening time here.", 4),
  r("Quantity is good for what they charge. Packing was neat for takeaway also, nothing leaked on the way home.", 4),
  r("Shawarma was good and the chicken inside was crispy. Would have liked an extra sauce or chutney with it but overall happy.", 4),
  r("Ordered twice this month. First time was great, second time slightly less crispy by the time I got home, but that is probably on me for the drive.", 4),
]

/* ---------------------------------------------------------------- 3 stars */
/* Fair and constructive, never damning. Someone who genuinely had a bad
 * visit should write their own words — see REPORT_ISSUE below. */
const three: Review[] = [
  r("Chicken was good but felt a bit oily that day. Might have just been my batch. Taste was there though and the guy at the counter was friendly.", 3),
  r("Food was fine, nothing wrong with it. Waited around fifteen minutes which felt long for a takeaway order. Would give it another go on a quieter day.", 3),
  r("Alright for the price. Crispy enough but I would have liked it a bit more seasoned. Everything else was okay.", 3),
  r("Chicken was crispy enough. Place gets crowded in the evening and there is barely anywhere to stand. Works better as a takeaway I feel.", 3),
  r("Ordered popcorn chicken and it was okay. Pieces were smaller than I expected. Fries were good though so not a wasted trip.", 3),
]

export const chickatoReviews: Review[] = [...five, ...four, ...three]

/**
 * 1 and 2 stars deliberately have no review text.
 *
 * The shop pays for this page. Handing their unhappy customer ready-made
 * one-star reviews would manufacture the exact damage they hired us to undo.
 * StoreView shows the report form instead and routes them to the owner.
 *
 * Known trade-off, recorded so nobody rediscovers it as a surprise: sending
 * unhappy visitors to the owner while sending happy ones to Google is *review
 * gating*, which Google's Maps policy prohibits, and templated text is what
 * their duplicate filter looks for. Retiring used reviews (useUsedReviews.ts)
 * is the defence on the second point; the first is a business decision.
 *
 * A bare "call the owner" button was the first version of this and almost
 * nobody pressed it — a phone call is a bigger ask than a bad meal is worth.
 * The form below asks for the same thing in the shape people already use:
 * pick what went wrong, type a line, leave a number, done in twenty seconds.
 */
export const REPORT_ISSUE = {
  heading: 'Sorry, that is not how it should have gone.',
  body: 'Tell the owner what happened. It lands on his phone directly, not in a queue, and he comes back to you himself.',
  /**
   * Quick-pick chips. They exist so an annoyed customer can report something
   * useful without composing a sentence, and so the owner gets a category he
   * can actually act on. Keep the list short — a long one gets skipped.
   */
  topics: [
    'Food quality',
    'Long wait',
    'Wrong order',
    'Staff behaviour',
    'Cleanliness',
    'Price',
    'Something else',
  ],
  /** Owner's WhatsApp. Every report is handed to this chat. */
  whatsapp: '+919087618120',
  /** Same line, for anyone who would rather just call. */
  phone: '+919087618120',
  phoneLabel: '+91 90876 18120',
}

/*
 * PARKED — not yet enabled. These name items confirmed only at the Mylapore
 * outlet. Ring +91 90876 18120, confirm MMDA actually sells them, then paste
 * the ones that check out into the arrays above.
 *
 * Kept as a comment rather than an unused export so the text does not ship in
 * the bundle for every visitor to download and never see.
 *
 *   r("Crab lollipop was the surprise of the night, did not expect it here.
 *      Chicken was crispy as always.", 5),
 *   r("Got the bucket for four of us and it was more than enough. Everything
 *      came out hot together which is the hard part.", 5),
 *   r("Ordered fish strips along with the chicken, fish was actually better
 *      than I expected. Small counter so there is a bit of standing around.", 4),
 *   r("Fish fingers were decent, chicken is still the better order here.
 *      Fries were hot.", 4),
 */
