<script setup lang="ts">
import { computed } from 'vue'
import type { Review } from '../types'
import { SENTIMENT_LABELS } from '../types'
import StarRating from './StarRating.vue'

const props = defineProps<{
  review: Review
  index: number
  copied: boolean
  accent: [string, string]
}>()

const emit = defineEmits<{ copy: [review: Review] }>()

const wordCount = computed(() => props.review.text.trim().split(/\s+/).length)
</script>

<template>
  <article
    class="review"
    :class="{ 'is-copied': copied }"
    :style="{
      '--a': accent[0],
      '--b': accent[1],
      animationDelay: `${Math.min(index, 9) * 45}ms`,
    }"
  >
    <p class="tone">{{ SENTIMENT_LABELS[review.sentiment] }}</p>

    <p class="text">{{ review.text }}</p>

    <footer class="foot">
      <span class="meta">
        <StarRating :rating="review.rating" :size="12" />
        <span class="words">{{ wordCount }} words</span>
      </span>
      <button
        class="copy"
        :class="{ done: copied }"
        type="button"
        :aria-label="copied ? 'Review copied to clipboard' : 'Copy this review'"
        @click="emit('copy', review)"
      >
        <svg v-if="!copied" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="tick">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span>{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </footer>
  </article>
</template>

<style scoped>
.review {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-6) var(--sp-5) var(--sp-5);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: transform 0.45s var(--ease), box-shadow 0.45s var(--ease), border-color 0.45s var(--ease);
  animation: settle 0.7s var(--ease) both;
  overflow: hidden;
}

.review::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--b);
  opacity: 0;
  transition: opacity 0.25s var(--ease);
}

.review:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
  border-color: var(--line-2);
}

.review:hover::before { opacity: 1; }

.review.is-copied {
  border-color: color-mix(in srgb, var(--ok) 45%, transparent);
}

.review.is-copied::before {
  opacity: 1;
  background: var(--ok);
}

/* Editorial category label — the card's opening line. */
.tone {
  font-size: var(--t-eyebrow);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold-ink);
}

.text {
  font-size: var(--t-body);
  line-height: 1.8;
  color: var(--ink);
  flex: 1;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-top: auto;
  padding-top: var(--sp-4);
  border-top: 1px solid var(--line);
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--t-caption);
  color: var(--ink-3);
}

.words { letter-spacing: 0.01em; }

.copy {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-sm);
  font-size: var(--t-meta);
  font-weight: 500;
  color: var(--on-fill);
  background: var(--brand);
  box-shadow: var(--shadow-sm);
  transition: transform 0.22s var(--ease), box-shadow 0.22s var(--ease),
              background 0.25s var(--ease);
}

.copy:hover {
  transform: translateY(-1px);
  background: var(--brand-2);
  box-shadow: var(--shadow);
}

.copy:active { transform: translateY(0); }

.copy.done {
  background: var(--ok);
  box-shadow: var(--shadow-sm);
}

.tick { animation: pop 0.32s var(--ease) both; }
</style>
