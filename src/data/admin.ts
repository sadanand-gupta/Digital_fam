import { FIREBASE } from './offer'

/**
 * Admin gate credentials.
 *
 * Checked in the browser, which means both strings ship in the JavaScript
 * bundle and anyone can read them with devtools open. This is a door marked
 * STAFF ONLY, not a lock — it keeps the admin view out of a customer's way,
 * and that is the whole of what it does.
 *
 * Deliberate and known. If the customer list ever needs to be genuinely
 * private, the shape of the fix is Firebase Authentication plus a rule reading
 * `request.auth.token.email` — that check runs on Google's servers, where the
 * visitor cannot reach it, which is the only place an access check holds.
 */
export const ADMIN = {
  username: 'growUP',
  password: 'growUP#05',
}

/** Shown when a login fails, so a locked-out admin knows who to ask. */
export const SUPER_ADMIN = {
  whatsapp: '7824051456',
  label: '+91 78240 51456',
}

/** Where the signups live, for an admin who wants the raw console. */
export const CONSOLE_URL = `https://console.firebase.google.com/project/${FIREBASE.projectId}/firestore/data`
