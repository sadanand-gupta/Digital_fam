import { ref, onUnmounted } from 'vue'

/**
 * Copy helper with a graceful fallback for non-secure contexts, where
 * navigator.clipboard is undefined (e.g. plain-http LAN testing).
 */
export function useClipboard(resetAfter = 2000) {
  const copiedId = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined

  const legacyCopy = (text: string) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    document.body.removeChild(ta)
    return ok
  }

  const copy = async (text: string, id: string) => {
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        ok = true
      } else {
        ok = legacyCopy(text)
      }
    } catch {
      ok = legacyCopy(text)
    }
    if (!ok) return false

    copiedId.value = id
    clearTimeout(timer)
    timer = setTimeout(() => { copiedId.value = null }, resetAfter)
    return true
  }

  onUnmounted(() => clearTimeout(timer))

  return { copy, copiedId }
}
