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
    <div class="head">
      <StarRating :rating="review.rating" />
      <span class="tone">{{ SENTIMENT_LABELS[review.sentiment] }}</span>
    </div>

    <p class="text">{{ review.text }}</p>

    <footer class="foot">
      <span class="meta">{{ wordCount }} words</span>
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
  gap: 14px;
  padding: 26px 24px;
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
  background: linear-gradient(90deg, var(--a), var(--b));
  opacity: 0;
  transition: opacity 0.25s var(--ease);
}

.review:hover {
  transform: translateY(-3px);
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

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tone {
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.text {
  font-size: 0.96rem;
  line-height: 1.78;
  color: var(--ink);
  flex: 1;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.meta {
  font-size: 0.74rem;
  color: var(--ink-3);
}

.copy {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--a), var(--b));
  box-shadow: 0 2px 10px color-mix(in srgb, var(--a) 30%, transparent);
  transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), background 0.25s var(--ease);
}

.copy:hover { transform: translateY(-1px); box-shadow: 0 6px 18px color-mix(in srgb, var(--a) 40%, transparent); }
.copy:active { transform: scale(0.95); }

.copy.done {
  background: var(--ok);
  box-shadow: 0 2px 10px color-mix(in srgb, var(--ok) 35%, transparent);
}

.tick { animation: pop 0.32s var(--ease) both; }
</style>
