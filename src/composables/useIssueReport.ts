import { ref } from 'vue'

const KEY = 'df-issue-report'

/**
 * Reports go stale. Someone who complained in March and comes back in July had
 * a different visit, and showing them the old confirmation would read as the
 * shop still sitting on it.
 */
const KEEP_DAYS = 14

export interface IssueReport {
  /** Short handle shown to the visitor, e.g. 'CC-4K1Z'. */
  ref: string
  /** 1 or 2 — what they tapped before reporting. */
  stars: number
  topics: string[]
  comment: string
  /** Local 10-digit mobile, no country code. */
  phone: string
  /** ISO timestamp of the hand-off to WhatsApp. */
  at: string
}

/**
 * The last issue this device reported, kept in localStorage.
 *
 * There is no backend — the report itself is delivered by opening the owner's
 * WhatsApp with the text prefilled. This record is what lets the page say
 * "reported, ref CC-4K1Z" on the way back, so the visitor can see it went
 * somewhere instead of typing into a void.
 */
const stored = ref<IssueReport | null>(load())

function load(): IssueReport | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p: unknown = JSON.parse(raw)
    if (!p || typeof p !== 'object') return null

    const r = p as Record<string, unknown>
    if (typeof r.ref !== 'string' || typeof r.at !== 'string') return null

    const age = Date.now() - new Date(r.at).getTime()
    if (!Number.isFinite(age) || age > KEEP_DAYS * 864e5) return null

    return {
      ref: r.ref,
      stars: typeof r.stars === 'number' ? r.stars : 1,
      topics: Array.isArray(r.topics) ? r.topics.filter(t => typeof t === 'string') : [],
      comment: typeof r.comment === 'string' ? r.comment : '',
      phone: typeof r.phone === 'string' ? r.phone : '',
      at: r.at,
    }
  } catch {
    // Private mode, disabled storage, or corrupt JSON — start clean.
    return null
  }
}

function persist() {
  try {
    if (stored.value) localStorage.setItem(KEY, JSON.stringify(stored.value))
    else localStorage.removeItem(KEY)
  } catch {
    /* Storage unavailable — the in-memory value still works for this session. */
  }
}

export function useIssueReport() {
  const save = (r: IssueReport) => {
    stored.value = r
    persist()
  }

  const clear = () => {
    stored.value = null
    persist()
  }

  return { report: stored, save, clear }
}
