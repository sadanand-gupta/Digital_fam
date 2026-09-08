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
/* Fair and constructive. A middling visit with a reason attached, which is
 * what a real 3 reads like. */
const three: Review[] = [
  r("Chicken was good but felt a bit oily that day. Might have just been my batch. Taste was there though and the guy at the counter was friendly.", 3),
  r("Food was fine, nothing wrong with it. Waited around fifteen minutes which felt long for a takeaway order. Would give it another go on a quieter day.", 3),
  r("Alright for the price. Crispy enough but I would have liked it a bit more seasoned. Everything else was okay.", 3),
  r("Chicken was crispy enough. Place gets crowded in the evening and there is barely anywhere to stand. Works better as a takeaway I feel.", 3),
  r("Ordered popcorn chicken and it was okay. Pieces were smaller than I expected. Fries were good though so not a wasted trip.", 3),
]

/* ---------------------------------------------------------------- 2 stars */
/* One thing was wrong enough to spoil the visit, with one thing still
 * standing. A 2 that damns everything reads as a grudge, not a review. */
const two: Review[] = [
  r("Chicken strips were dry and tasted like they had been sitting a long while. Fries were alright so that is the only reason this is not lower.", 2),
  r("Small order and it still took twenty minutes on a quiet evening. Food was just okay by the time it came out.", 2),
  r("Lollipop was raw in the middle for me. Mentioned it at the counter and they heard me out but nothing came of it.", 2),
  r("Wings had hardly any coating left on them. Tasted plain compared to the last time I ordered the same thing here.", 2),
  r("Barely any space to stand inside and the queue comes out onto MMDA Main Road. For average food the wait did not feel worth it.", 2),
]

/* ---------------------------------------------------------------- 1 star */
/* A visit that went wrong, told plainly. One specific failure each, no
 * pile-on and no name calling, which is also what survives moderation. */
const one: Review[] = [
  r("Ordered the zinger burger and it came out cold. Bun had gone soggy by the time I opened the box at home. Not what I expected after the wait.", 1),
  r("Waited close to thirty minutes for one takeaway order on a normal weekday. Nobody at the counter could say how much longer. Left without it in the end.", 1),
  r("Chicken was so oily I could not finish even half of it. The paper under it was fully soaked through. Whole box went in the bin.", 1),
  r("Got somebody else order completely. Asked for shawarma and reached home with popcorn chicken and fries. Nobody checked before handing it over.", 1),
  r("Went in the evening and the place had not been cleaned at all. Old boxes were lying on the tables the whole time I stood there waiting.", 1),
]

export const chickatoReviews: Review[] = [...five, ...four, ...three, ...two, ...one]


/*
 * PARKED — not yet enabled. These name items confirmed only at the Mylapore
 * outlet. Confirm with the owner that MMDA actually sells them, then paste
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
