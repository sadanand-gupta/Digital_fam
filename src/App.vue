<script setup lang="ts">
import type { Review } from './types'
import { store } from './data/store'
import { useClipboard } from './composables/useClipboard'
import SiteHeader from './components/SiteHeader.vue'
import StoreView from './components/StoreView.vue'
import CopyToast from './components/CopyToast.vue'

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
</script>

<template>
  <SiteHeader />

  <main>
    <StoreView :store="store" :copied-id="copiedId" @copy="handleCopy" />
  </main>

  <CopyToast :show="copiedId !== null" />
</template>
