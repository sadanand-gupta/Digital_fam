<script setup lang="ts">
import type { Review } from '../types'

defineProps<{ review: Review; selected: boolean }>()
const emit = defineEmits<{ select: [review: Review] }>()
</script>

<template>
  <!--
    A card is now a choice, not an action. The old per-card Copy button let
    people copy and leave without ever reaching Google — the single Add Review
    button below the carousel closes that gap.
  -->
  <button
    class="review"
    :class="{ on: selected }"
    type="button"
    role="radio"
    :aria-checked="selected"
    @click="emit('select', review)"
  >
    <span class="tick" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>

    <span class="text">{{ review.text }}</span>
  </button>
</template>

<style scoped>
.review {
  position: relative;
  /* Each card is one snap stop in the carousel track. */
  scroll-snap-align: center;
  flex: 0 0 min(86%, 420px);

  display: flex;
  text-align: left;
  padding: var(--sp-5);
  padding-right: var(--sp-6);

  background: var(--bg-elev);
  border: 1.5px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
  color: var(--ink);

  transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease),
              transform 0.18s var(--ease), background 0.18s var(--ease);
}

.review:hover { border-color: var(--line-2); }

.review.on {
  border-color: var(--brand);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.review:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
}

.text {
  font-size: var(--t-body);
  line-height: 1.65;
}

/* Selected state has to survive a glance on a bright phone screen, so it is
 * a filled badge rather than only a border tint. */
.tick {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--brand);
  color: var(--on-fill);
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.18s var(--ease), transform 0.18s var(--ease);
}

.tick svg { width: 13px; height: 13px; }

.review.on .tick { opacity: 1; transform: scale(1); }

@media (prefers-reduced-motion: reduce) {
  .review, .review.on { transform: none; }
  .tick { transition: opacity 0.01ms; }
}
</style>
