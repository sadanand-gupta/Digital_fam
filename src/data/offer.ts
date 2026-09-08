/**
 * The offer shown between picking a review and posting it.
 *
 * Two versions of the same ask. A discount pitched at someone who just wrote a
 * one-star review reads as a bribe, so 1 and 2 stars get win-back wording
 * instead of "exclusive offers".
 */
export const OFFER = {
  eyebrow: 'Before you go',

  headline: 'Get 10% off your next visit',
  body: 'Leave your WhatsApp number and the code comes to you, along with first word on new combos.',

  /** Shown instead at 1 and 2 stars. */
  lowHeadline: 'Let us make the next one right',
  lowBody: 'Leave your WhatsApp number and we will send you 10% off, and tell you once this is sorted.',

  /**
   * Stored verbatim with every signup. If Meta or the shop is ever asked what
   * the customer agreed to, the answer has to be the exact sentence they saw,
   * not a summary of it — so this string is written to the record as-is.
   */
  consent: 'I agree to receive offers from Chickato on WhatsApp.',
}

/**
 * Firestore, reached over its REST API.
 *
 * REST rather than the Firebase SDK on purpose: the SDK is around 100KB for a
 * page that does one write, and every byte here is paid for on a phone on
 * mobile data outside the shop. Security rules apply to REST identically.
 *
 * SETUP
 *  1. console.firebase.google.com -> add project (or use an existing one).
 *  2. Build -> Firestore Database -> Create database -> production mode.
 *  3. Project settings -> General -> Your apps -> Web app. Copy `projectId`
 *     and `apiKey` from the snippet into the two blanks below.
 *  4. Firestore -> Rules -> paste `firestore.rules` from this repo -> Publish.
 *
 * The apiKey is NOT a secret and is meant to ship in the bundle — it only
 * identifies the project. The security rules are the actual lock, which is why
 * step 4 is not optional: without it the customer list is world-readable.
 *
 * Left blank the form still renders, but nothing is sent and the panel says so
 * rather than telling the customer their number was saved when it was not.
 */
export const FIREBASE = {
  projectId: 'growub-top',
  apiKey: 'AIzaSyA0P86GaU0h_QsM1Hf4ukuJ3mNebAztw_g',
  /** Document id is the phone number, so a repeat visit updates one row. */
  collection: 'signups',
}

export const signupConfigured = Boolean(FIREBASE.projectId && FIREBASE.apiKey)
