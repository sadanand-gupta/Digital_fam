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

/** The one store shown to the public at '/'. Must match a slug in stores.ts. */
export const PUBLIC_STORE_SLUG = 'chickato-mmda'

export const ADMIN_EMAIL = 'sadanandguptat@gmail.com'
export const ADMIN_PASSWORD = 'Gupta@21072003'

/** Key under which the unlocked session is remembered in localStorage. */
export const ADMIN_STORAGE_KEY = 'df-admin'

export function checkCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD
}
