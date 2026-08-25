import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Minimal history router: '' for home, 'store/<slug>' for a store page.
 *
 * Path-based rather than hash-based so printed QR codes carry a clean
 * `digitalfam.in/store/meridian` URL. This requires the host to rewrite every
 * path to index.html — see vercel.json / public/_redirects.
 */
export function useRoute() {
  const clean = (p: string) => p.replace(/^\/+/, '').replace(/\/+$/, '')

  const path = ref(clean(window.location.pathname))

  const sync = () => { path.value = clean(window.location.pathname) }

  onMounted(() => window.addEventListener('popstate', sync))
  onUnmounted(() => window.removeEventListener('popstate', sync))

  const navigate = (to: string) => {
    const target = to ? `/${to}` : '/'
    if (target !== window.location.pathname) {
      window.history.pushState({}, '', target)
      path.value = clean(target)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { path, navigate }
}
