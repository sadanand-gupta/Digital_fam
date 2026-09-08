import { computed, ref } from 'vue'
import { FIREBASE } from '../data/offer'
import { ADMIN } from '../data/admin'

const KEY = 'df-admin'

export interface Signup {
  /** Local 10-digit mobile, as stored. */
  phone: string
  stars: number
  store: string
  /** ISO timestamp of the signup. */
  at: string
}

const authed = ref(restore())
const signups = ref<Signup[]>([])

export const signedIn = computed(() => authed.value)

/** Survives a refresh, dies with the tab. A session, not a login. */
function restore(): boolean {
  try {
    return sessionStorage.getItem(KEY) === 'in'
  } catch {
    return false
  }
}

function remember(on: boolean) {
  try {
    if (on) sessionStorage.setItem(KEY, 'in')
    else sessionStorage.removeItem(KEY)
  } catch {
    /* Storage unavailable — the session still holds in memory. */
  }
}

/**
 * Compares against the strings in data/admin.ts.
 *
 * In the browser, so it proves nothing to anyone but the person typing. See
 * the note in data/admin.ts for why that is acceptable here and what to do
 * when it stops being acceptable.
 */
export function signIn(username: string, password: string) {
  if (username.trim() !== ADMIN.username || password !== ADMIN.password) {
    throw new Error('BAD_CREDENTIALS')
  }
  authed.value = true
  remember(true)
}

export function signOut() {
  authed.value = false
  remember(false)
  signups.value = []
}

/** One Firestore REST value, unwrapped to something usable. */
function str(f: Record<string, unknown> | undefined, key: string): string {
  const v = f?.[key] as Record<string, string> | undefined
  return v?.stringValue ?? v?.timestampValue ?? ''
}

/**
 * Reads the signup list straight off Firestore's REST endpoint.
 *
 * No token: with the gate checked in the browser there is nothing to send that
 * Firestore could verify, so the rules allow this read outright. Newest first,
 * capped at 500 — a restaurant will not pass that for years, and an unbounded
 * page is how a list view becomes slow without anyone noticing.
 */
export async function loadSignups() {
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}` +
    `/databases/(default)/documents/${FIREBASE.collection}` +
    `?pageSize=500&orderBy=${encodeURIComponent('at desc')}&key=${FIREBASE.apiKey}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`READ_FAILED_${res.status}`)

  const data = await res.json()

  // An empty collection comes back as {}, not { documents: [] }.
  const docs: Array<{ fields?: Record<string, unknown> }> = data.documents ?? []

  signups.value = docs.map(d => {
    const f = d.fields as Record<string, unknown> | undefined
    const stars = (f?.stars as Record<string, string> | undefined)?.integerValue
    return {
      phone: str(f, 'phone'),
      stars: Number(stars ?? 0),
      store: str(f, 'store'),
      at: str(f, 'at'),
    }
  })
}

export function useAdminSession() {
  return { signedIn, signups, signIn, signOut, loadSignups }
}
