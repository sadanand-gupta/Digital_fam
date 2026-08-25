<script setup lang="ts">
import type { Store } from '../types'
import { CATEGORY_LABELS } from '../types'
import StarRating from './StarRating.vue'

defineProps<{
  store: Store
  index: number
  /** True when this store is the one the public currently sees at '/'. */
  isPublic?: boolean
}>()

const emit = defineEmits<{ open: [slug: string]; selectPublic: [slug: string] }>()
</script>

<template>
  <div
    class="store"
    :class="{ live: isPublic }"
    :style="{ '--a': store.accent[0], '--b': store.accent[1], animationDelay: `${index * 70}ms` }"
  >
    <button class="open" type="button" @click="emit('open', store.slug)">
      <span class="sr-only">Open {{ store.name }}</span>
    </button>

    <div class="top">
      <span class="mark" aria-hidden="true">{{ store.logoMark }}</span>
      <span class="meta">
        <span v-if="isPublic" class="live-tag">
          <span class="pulse" aria-hidden="true" />
          Live site
        </span>
        <span class="cat">{{ CATEGORY_LABELS[store.category] }}</span>
      </span>
    </div>

    <h3 class="name">{{ store.name }}</h3>
    <p class="tagline">{{ store.tagline }}</p>

    <div class="rating">
      <StarRating :rating="store.rating" :size="13" />
      <span class="score">{{ store.rating.toFixed(1) }}</span>
      <span class="count">· {{ store.reviewCount.toLocaleString() }} reviews</span>
    </div>

    <div class="bottom">
      <span class="ready">{{ store.reviews.length }} reviews ready to copy</span>
      <span class="arrow" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </div>

    <button
      v-if="!isPublic"
      class="setlive"
      type="button"
      @click="emit('selectPublic', store.slug)"
    >
      Set as live site
    </button>
    <p v-else class="setlive is-live">This is the public site</p>
  </div>
</template>

<style scoped>
.store {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
  text-align: left;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: transform 0.28s var(--ease), box-shadow 0.28s var(--ease), border-color 0.28s var(--ease);
  animation: rise 0.6s var(--ease) both;
  overflow: hidden;
}

.store::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 3px;
  background: var(--b);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s var(--ease);
}

.store:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--line-2);
}

/* Marks the shop currently served to the public. */
.store.live {
  border-color: color-mix(in srgb, var(--ok) 45%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--ok) 22%, transparent), var(--shadow-sm);
}

/*
 * Full-card hit area for opening the store. Sits under the real controls so
 * "Set as live site" stays clickable, and keeps the card a single tab stop.
 */
.open {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  cursor: pointer;
}

.open:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: -3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Content sits above the overlay so text stays selectable and legible. */
.top, .name, .tagline, .rating, .bottom { position: relative; z-index: 1; }

.store:hover::after { transform: scaleX(1); }

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--on-fill);
  background: var(--a);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--a) 35%, transparent);
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.live-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.67rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ok);
  background: color-mix(in srgb, var(--ok) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--ok) 30%, transparent);
}

.pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 22%, transparent);
}

.cat {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-3);
  text-align: right;
}

.name {
  font-family: var(--font-display);
  font-size: 1.22rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.tagline {
  font-size: 0.87rem;
  color: var(--ink-2);
  line-height: 1.55;
  flex: 1;
}

.rating {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
}

.score { font-weight: 700; }
.count { color: var(--ink-3); }

.bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.ready {
  font-size: 0.79rem;
  font-weight: 500;
  color: var(--ink-2);
}

.arrow {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--ink-2);
  background: var(--bg-sunken);
  transition: transform 0.28s var(--ease), background 0.28s var(--ease), color 0.28s var(--ease);
}

.store:hover .arrow {
  transform: translateX(3px);
  color: var(--on-fill);
  background: var(--a);
}

.setlive {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  padding: 9px 14px;
  width: 100%;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-2);
  background: var(--bg-sunken);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: color 0.2s var(--ease), border-color 0.2s var(--ease), background 0.2s var(--ease);
}

.setlive:hover {
  color: var(--on-fill);
  border-color: transparent;
  background: var(--brand);
}

.setlive.is-live {
  color: var(--ok);
  background: color-mix(in srgb, var(--ok) 10%, transparent);
  border-color: color-mix(in srgb, var(--ok) 26%, transparent);
  text-align: center;
  cursor: default;
}
</style>
