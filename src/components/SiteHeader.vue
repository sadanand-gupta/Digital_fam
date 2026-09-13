<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import logoDark from '../assets/logo-dark.png'
import AdminGate from './AdminGate.vue'

const scrolled = ref(false)
const onScroll = () => { scrolled.value = window.scrollY > 8 }

onMounted(() => {
  document.documentElement.dataset.theme = 'dark'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a0a0a')
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
        <img
          class="logo"
          :src="logoDark"
          alt="GrowUB — Digital Growth for Businesses"
          width="352"
          height="120"
          decoding="async"
        />
      </div>

      <nav class="nav">
        <!-- Staff door. Quiet, but reachable without hunting for it. -->
        <AdminGate />

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



</style>
