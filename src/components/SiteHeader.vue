<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import logoLight from '../assets/logo-light.png'
import logoDark from '../assets/logo-dark.png'
import AdminGate from './AdminGate.vue'

const scrolled = ref(false)
const dark = ref(false)

const onScroll = () => { scrolled.value = window.scrollY > 8 }

function apply(isDark: boolean) {
  dark.value = isDark
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'

  // The address bar takes its colour from this tag. Left static it stays ivory
  // behind a dark page, which reads as a rendering fault on a phone. A media
  // query cannot do it — the theme here is a toggle, not an OS preference.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? '#060f22' : '#f7f2e8')

  try { localStorage.setItem('df-theme', isDark ? 'dark' : 'light') } catch { /* private mode */ }
}

function toggle() { apply(!dark.value) }

onMounted(() => {
  let saved: string | null = null
  try { saved = localStorage.getItem('df-theme') } catch { /* private mode */ }
  // Ivory is the brand's default look; dark mode follows the visitor's own
  // choice, falling back to their OS preference.
  apply(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="hdr" :class="{ solid: scrolled }">
    <div class="container inner">
      <!-- One shop, one page — the mark is identity, not a link. -->
      <div class="brand">
        <!--
          Two files, not one recoloured with a filter. The mark is white-on-dark
          as drawn, and white is invisible on the ivory theme — so the light
          version has its wordmark repainted in the page's ink while the blue
          and green are kept. `dark` is already tracked here for the toggle.
        -->
        <img
          class="logo"
          :src="dark ? logoDark : logoLight"
          alt="GrowUB — Digital Growth for Businesses"
          width="352"
          height="120"
          decoding="async"
        />
      </div>

      <nav class="nav">
        <!-- Staff door. Quiet, but reachable without hunting for it. -->
        <AdminGate />

        <button
          class="theme"
          type="button"
          :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggle"
        >
          <svg v-if="dark" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid transparent;
  transition: background 0.3s var(--ease), border-color 0.3s var(--ease), backdrop-filter 0.3s var(--ease);
}

.hdr.solid {
  background: var(--surface-glass);
  border-bottom-color: var(--line);
  backdrop-filter: blur(18px) saturate(1.3);
  box-shadow: var(--shadow-sm);
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  /* Compact by design — an oversized bar eats the hero. */
  height: 62px;
}

.brand {
  display: inline-flex;
  align-items: center;
}

/* Transparent PNG, so it needs no plate — it sits straight on the page. */
.logo {
  display: block;
  height: 34px;
  width: auto;
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.theme {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin-left: 4px;
  border-radius: 50%;
  color: var(--ink-2);
  border: 1px solid var(--line);
  background: transparent;
  transition: color 0.22s var(--ease), border-color 0.22s var(--ease),
              background 0.22s var(--ease);
}

.theme:hover { color: var(--ink); border-color: var(--line-2); background: var(--bg-sunken); }

</style>
