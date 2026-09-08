import { ref } from 'vue'
import { FIREBASE, OFFER, signupConfigured } from '../data/offer'

const KEY = 'df-offer-signup'

export type SignupStatus = 'idle' | 'saving' | 'saved' | 'error'

const status = ref<SignupStatus>('idle')
/** The number this device already signed up with, if any. */
const savedPhone = ref<string | null>(load())

function load(): string | null {
  try {
    const v = localStorage.getItem(KEY)
    return v && /^\d{10}$/.test(v) ? v : null
  } catch {
    // Private mode or disabled storage — they can simply sign up again.
    return null
  }
}

function persist(phone: string) {
  try {
    localStorage.setItem(KEY, phone)
  } catch {
    /* Storage unavailable — the in-memory value still works for this session. */
  }
}

export interface SignupPayload {
  /** Local 10-digit mobile, no country code. */
  phone: string
  /** What they rated the visit, so the shop can tell a win-back from a fan. */
  stars: number
  store: string
}

/** Base for both the collection and one document inside it. */
function base() {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`
}

/**
 * Firestore's REST shape: every value carries its own type tag. Verbose, but
 * it is the price of not shipping the SDK, and it keeps the stored types
 * honest — `stars` lands as a number, `at` as a real timestamp.
 */
function fields(p: SignupPayload) {
  return {
    phone: { stringValue: p.phone },
    stars: { integerValue: String(p.stars) },
    store: { stringValue: p.store },
    consent: { booleanValue: true },
    consentText: { stringValue: OFFER.consent },
    source: { stringValue: 'review-page' },
    at: { timestampValue: new Date().toISOString() },
  }
}

/**
 * Writes one signup, keyed by the phone number.
 *
 * The document id IS the number, so a customer who signs up twice updates one
 * record instead of leaving two the shop would message twice. Firestore
 * answers a repeat create with 409, which is the cue to patch instead.
 *
 * `keepalive` matters more than it looks: the visitor taps through to Google
 * moments after this fires, and without it the browser is free to cancel the
 * request as the tab goes away.
 */
async function post(p: SignupPayload) {
  const body = JSON.stringify({ fields: fields(p) })
  const opts: RequestInit = {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body,
  }

  const create = await fetch(
    `${base()}/${FIREBASE.collection}?documentId=${p.phone}&key=${FIREBASE.apiKey}`,
    opts,
  )
  if (create.ok) return

  if (create.status === 409) {
    // Already on the list. Refresh their last visit and latest rating.
    const mask = Object.keys(fields(p))
      .map(f => `updateMask.fieldPaths=${f}`)
      .join('&')
    const patch = await fetch(
      `${base()}/${FIREBASE.collection}/${p.phone}?${mask}&key=${FIREBASE.apiKey}`,
      { ...opts, method: 'PATCH' },
    )
    if (patch.ok) return
    throw new Error(`firestore patch ${patch.status}`)
  }

  throw new Error(`firestore create ${create.status}`)
}

/**
 * WhatsApp opt-ins, collected on the way to Google.
 *
 * Collection only. Nothing here sends a message — offers go out later through
 * the official WhatsApp Business Platform, never an unofficial gateway driving
 * the shop's own line.
 */
export function useOfferSignup() {
  const submit = async (p: SignupPayload) => {
    if (status.value === 'saving') return
    if (!signupConfigured) {
      // No project wired up yet. Say nothing happened rather than claim it did.
      status.value = 'error'
      return
    }

    status.value = 'saving'
    try {
      await post(p)
      savedPhone.value = p.phone
      persist(p.phone)
      status.value = 'saved'
    } catch (err) {
      console.error('signup failed', err)
      status.value = 'error'
    }
  }

  /** Lets a corrected number re-arm the auto-save after a failure. */
  const reset = () => {
    if (status.value !== 'saved') status.value = 'idle'
  }

  return { status, savedPhone, submit, reset }
}
