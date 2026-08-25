/**
 * Site access configuration.
 *
 * The public site is single-shop: visitors only ever see PUBLIC_STORE_SLUG.
 * The full directory of every store is admin-only, unlocked from /admin with
 * the credentials below.
 *
 * NOTE ON SECURITY: this is a client-side gate. The credentials and every
 * store's data ship inside the JS bundle, so this hides the directory from
 * ordinary visitors — it is not protection against someone reading the
 * bundle. Move to a server-checked login if that ever matters.
 */

/**
 * The store shown to the public at '/' until an admin picks a different one.
 * Must match a slug in stores.ts. Acts as the fallback whenever no selection
 * has been saved, or a saved slug no longer exists.
 */
export const DEFAULT_PUBLIC_STORE_SLUG = 'chickato-mmda'

/** Key under which the admin's chosen public store is remembered. */
export const PUBLIC_STORE_STORAGE_KEY = 'df-public-store'

export const ADMIN_EMAIL = 'sadanandguptat@gmail.com'
export const ADMIN_PASSWORD = 'Gupta@21072003'

/** Key under which the unlocked session is remembered in localStorage. */
export const ADMIN_STORAGE_KEY = 'df-admin'

export function checkCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD
}
