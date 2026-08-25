import { computed, ref } from 'vue'
import { stores, storeBySlug } from '../data/stores'
import { DEFAULT_PUBLIC_STORE_SLUG, PUBLIC_STORE_STORAGE_KEY } from '../data/adminConfig'

/**
 * Which single store the public sees at '/'. An admin picks it from the
 * directory and the choice sticks, so the site keeps serving that shop on
 * every later visit without a code change or redeploy.
 *
 * Module-level so the header, directory and page all read one value.
 */
const selected = ref(read())

function read(): string {
  try {
    return localStorage.getItem(PUBLIC_STORE_STORAGE_KEY) || DEFAULT_PUBLIC_STORE_SLUG
  } catch {
    return DEFAULT_PUBLIC_STORE_SLUG
  }
}

export function usePublicStore() {
  /**
   * A saved slug can go stale if that store is later renamed or removed, so
   * resolve through the list and fall back rather than showing an empty site.
   */
  const publicStore = computed(
    () => storeBySlug(selected.value) ?? storeBySlug(DEFAULT_PUBLIC_STORE_SLUG) ?? stores[0],
  )

  const publicSlug = computed(() => publicStore.value.slug)

  function setPublicStore(slug: string) {
    if (!storeBySlug(slug)) return
    selected.value = slug
    try { localStorage.setItem(PUBLIC_STORE_STORAGE_KEY, slug) } catch { /* private mode */ }
  }

  /** Drop the override and go back to the slug baked into adminConfig.ts. */
  function resetPublicStore() {
    selected.value = DEFAULT_PUBLIC_STORE_SLUG
    try { localStorage.removeItem(PUBLIC_STORE_STORAGE_KEY) } catch { /* private mode */ }
  }

  return { publicStore, publicSlug, setPublicStore, resetPublicStore }
}
