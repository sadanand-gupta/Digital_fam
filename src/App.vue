<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { stores, storeBySlug } from './data/stores'
import type { Review } from './types'
import { useClipboard } from './composables/useClipboard'
import { useRoute } from './composables/useRoute'
import { useUsedReviews } from './composables/useUsedReviews'
import { bestReviewTarget } from './data/mapsLinks'
import SiteHeader from './components/SiteHeader.vue'
import HomeView from './components/HomeView.vue'
import StoreView from './components/StoreView.vue'
import CopyToast from './components/CopyToast.vue'

const { path, navigate } = useRoute()
const { copy, copiedId } = useClipboard()
const { markUsed } = useUsedReviews()

const activeStore = computed(() => {
  const m = path.value.match(/^store\/(.+)$/)
  return m ? storeBySlug(m[1]) : undefined
})

const toast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | undefined

/** Delay before a copied card is retired, so its "Copied" tick is seen first. */
const RETIRE_DELAY = 700
let retireTimer: ReturnType<typeof setTimeout> | undefined

async function handleCopy(review: Review) {
  const ok = await copy(review.text, review.id)
  if (!ok) return

  toast.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = false }, 4200)

  // Retire it only once the text is actually on the clipboard, so a failed
  // copy never silently burns a review. The pause lets the confirmation land.
  clearTimeout(retireTimer)
  retireTimer = setTimeout(() => markUsed(review.id), RETIRE_DELAY)
}

onUnmounted(() => {
  clearTimeout(toastTimer)
  clearTimeout(retireTimer)
})

/** Hide a lingering toast when the user changes page. */
watch(path, () => {
  toast.value = false
  clearTimeout(toastTimer)
})

/** Where the toast's action button should point for the current store. */
const reviewTarget = computed(() =>
  activeStore.value ? bestReviewTarget(activeStore.value) : null,
)

const year = new Date().getFullYear()
</script>

<template>
  <SiteHeader @home="navigate('')" />

  <main>
    <StoreView
      v-if="activeStore"
      :key="activeStore.slug"
      :store="activeStore"
      :copied-id="copiedId"
      @copy="handleCopy"
      @back="navigate('')"
    />

    <div v-else-if="path.startsWith('store/')" class="missing container">
      <h1 class="display">Store not found</h1>
      <p>That listing doesn't exist. Head back and pick one from the directory.</p>
      <button class="btn btn-primary" type="button" @click="navigate('')">Browse stores</button>
    </div>

    <HomeView v-else @open="navigate(`store/${$event}`)" />
  </main>

  <footer class="footer">
    <div class="container inner">
      <p class="mark">Digital<em>Fam</em></p>
      <p class="fine">
        {{ stores.length }} businesses · Reviews are templates meant to be edited to match your
        real experience.
      </p>
      <p class="fine">© {{ year }} Digital Fam</p>
    </div>
  </footer>

  <CopyToast
    :show="toast"
    :maps-url="reviewTarget?.url"
    :direct="reviewTarget?.direct"
  />
</template>

<style scoped>
.missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 110px 0;
  text-align: center;
}

.missing h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); }
.missing p { color: var(--ink-2); max-width: 44ch; }

.footer {
  padding: 40px 0;
  border-top: 1px solid var(--line);
  background: var(--bg-sunken);
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
}

.mark {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
}

.mark em { font-style: normal; font-weight: 500; color: var(--ink-3); }

.fine {
  font-size: 0.78rem;
  color: var(--ink-3);
  max-width: 52ch;
}
</style>
