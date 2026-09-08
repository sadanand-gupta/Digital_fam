<script setup lang="ts">
import type { Review } from './types'
import { store } from './data/store'
import { useClipboard } from './composables/useClipboard'
import SiteHeader from './components/SiteHeader.vue'
import StoreView from './components/StoreView.vue'
import CopyToast from './components/CopyToast.vue'
import AdminGate from './components/AdminGate.vue'

const { copy, copiedId } = useClipboard()

/**
 * Fired from StoreView's Add review handler, which is itself the click
 * handler of a real <a>. Vue emits are synchronous, so the clipboard write is
 * still issued inside the user gesture.
 *
 * Do NOT make this async or await anything ahead of copy() — Safari would
 * treat the gesture as spent and the visitor would land on Google with an
 * empty clipboard.
 */
function handleCopy(review: Review) {
  copy(review.text, review.id)
}

const year = new Date().getFullYear()
</script>

<template>
  <SiteHeader />

  <main>
    <StoreView :store="store" :copied-id="copiedId" @copy="handleCopy" />
  </main>

  <footer class="footer">
    <div class="container inner">
      <p class="mark">Digital<em>Fam</em></p>
      <p class="fine">
        Reviews are templates meant to be edited to match your real experience.
      </p>
      <p class="fine">© {{ year }} Digital Fam</p>

      <!-- Staff door. Deliberately the quietest thing on the page. -->
      <AdminGate />
    </div>
  </footer>

  <CopyToast :show="copiedId !== null" />
</template>

<style scoped>
.footer {
  padding: var(--sp-7) 0;
  border-top: 1px solid var(--line);
  /* Translucent so the page gradient carries through the full height. */
  background: color-mix(in srgb, var(--bg-sunken) 55%, transparent);
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
  font-size: var(--t-lead);
  font-weight: 700;
}

.mark em { font-style: normal; font-weight: 500; color: var(--ink-3); }

.fine {
  font-size: var(--t-caption);
  color: var(--ink-3);
  max-width: 52ch;
}
</style>
