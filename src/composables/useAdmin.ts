import { ref } from 'vue'
import { ADMIN_STORAGE_KEY, checkCredentials } from '../data/adminConfig'

/**
 * Module-level so every component shares one signed-in state — a ref created
 * per-call would let the header and the page disagree about who is logged in.
 */
const isAdmin = ref(read())

function read(): boolean {
  try { return localStorage.getItem(ADMIN_STORAGE_KEY) === '1' } catch { return false }
}

export function useAdmin() {
  /** @returns true when the credentials matched and the session is now open. */
  function signIn(email: string, password: string): boolean {
    if (!checkCredentials(email, password)) return false
    isAdmin.value = true
    try { localStorage.setItem(ADMIN_STORAGE_KEY, '1') } catch { /* private mode */ }
    return true
  }

  function signOut() {
    isAdmin.value = false
    try { localStorage.removeItem(ADMIN_STORAGE_KEY) } catch { /* private mode */ }
  }

  return { isAdmin, signIn, signOut }
}
