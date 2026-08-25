import { ref, computed } from 'vue'

const KEY = 'df-used-reviews'

/**
 * Review ids this visitor has already copied, so the same text is never handed
 * out twice. Kept in localStorage and shared across every component instance —
 * the module-level ref means the store page and any future surface stay in sync.
 */
const used = ref<Set<string>>(load())

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter(v => typeof v === 'string')) : new Set()
  } catch {
    // Private mode, disabled storage, or corrupt JSON — start clean.
    return new Set()
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...used.value]))
  } catch {
    /* Storage unavailable — the in-memory set still works for this session. */
  }
}

export function useUsedReviews() {
  const markUsed = (id: string) => {
    if (used.value.has(id)) return
    // Reassign so Vue tracks the change; Set mutation alone is not reactive here.
    used.value = new Set(used.value).add(id)
    persist()
  }

  /** Brings every review for the given ids back into circulation. */
  const resetMany = (ids: string[]) => {
    const next = new Set(used.value)
    let changed = false
    for (const id of ids) changed = next.delete(id) || changed
    if (!changed) return
    used.value = next
    persist()
  }

  const isUsed = (id: string) => used.value.has(id)

  return { used: computed(() => used.value), markUsed, resetMany, isUsed }
}
