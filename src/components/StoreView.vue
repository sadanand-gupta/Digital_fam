<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Store, Review } from '../types'
import { CATEGORY_LABELS } from '../types'
import ReviewCard from './ReviewCard.vue'
import BrandingPanel from './BrandingPanel.vue'
import StarRating from './StarRating.vue'
import { useUsedReviews } from '../composables/useUsedReviews'
import { bestReviewTarget } from '../data/mapsLinks'

const props = defineProps<{
  store: Store
  copiedId: string | null
  /** True when this is the public site's only listing — hides the directory link. */
  single?: boolean
}>()
const emit = defineEmits<{ copy: [review: Review]; back: [] }>()

const { isUsed, resetMany } = useUsedReviews()

/** Prefers the review composer, falls back to the listing. */
const reviewTarget = computed(() => bestReviewTarget(props.store))

type ToneFilter = 'all' | Review['tone']

/** How many reviews are visible at once; the rest wait in reserve. */
const PAGE_SIZE = 6

const tone = ref<ToneFilter>('all')
const tag = ref<string>('all')

const tones: { value: ToneFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'concise', label: 'Short' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'warm', label: 'Warm' },
  { value: 'enthusiastic', label: 'Glowing' },
]

/** Reviews this visitor has not copied yet — the live pool. */
const available = computed(() => props.store.reviews.filter(r => !isUsed(r.id)))

const availableTones = computed(() => {
  const present = new Set(available.value.map(r => r.tone))
  return tones.filter(t => t.value === 'all' || present.has(t.value as Review['tone']))
})

const usedCount = computed(() => props.store.reviews.length - available.value.length)
const exhausted = computed(() => available.value.length === 0)

const tags = computed(() =>
  [...new Set(available.value.flatMap(r => r.tags))].sort(),
)

/** Reviews matching the current filters, before the display window. */
const matching = computed(() =>
  available.value.filter(r => {
    if (tone.value !== 'all' && r.tone !== tone.value) return false
    if (tag.value !== 'all' && !r.tags.includes(tag.value)) return false
    return true
  }),
)

/**
 * Only a window of PAGE_SIZE is on screen. Copying one removes it from
 * `available`, so the next unused review slides up into the freed slot.
 */
const filtered = computed(() => matching.value.slice(0, PAGE_SIZE))

/** Unused reviews waiting behind the visible window. */
const queued = computed(() => Math.max(0, matching.value.length - filtered.value.length))

function reset() {
  tone.value = 'all'
  tag.value = 'all'
}

/** Puts every review for this store back into circulation. */
function restoreAll() {
  resetMany(props.store.reviews.map(r => r.id))
  reset()
}
</script>

<template>
  <div class="page" :style="{ '--a': store.accent[0], '--b': store.accent[1] }">
    <!-- Store hero -->
    <section class="hero">
      <div class="wash" aria-hidden="true" />
      <div class="container">
        <button v-if="!single" class="back" type="button" @click="emit('back')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          All stores
        </button>

        <div class="hero-grid">
          <div class="identity">
            <span class="mark" aria-hidden="true">{{ store.logoMark }}</span>
            <div>
              <p class="eyebrow">{{ CATEGORY_LABELS[store.category] }}</p>
              <h1 class="display name">{{ store.name }}</h1>
              <p class="tagline">{{ store.tagline }}</p>

              <div class="rating">
                <StarRating :rating="store.rating" :size="15" />
                <strong>{{ store.rating.toFixed(1) }}</strong>
                <span>· {{ store.reviewCount.toLocaleString() }} Google reviews</span>
              </div>
            </div>
          </div>

          <aside class="info card">
            <dl>
              <div>
                <dt>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  Address
                </dt>
                <dd>{{ store.address }}</dd>
              </div>
              <div>
                <dt>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
                  </svg>
                  Hours
                </dt>
                <dd>{{ store.hours }}</dd>
              </div>
              <div v-if="store.phone">
                <dt>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                  </svg>
                  Phone
                </dt>
                <dd><a :href="`tel:${store.phone.replace(/\s/g, '')}`">{{ store.phone }}</a></dd>
              </div>
            </dl>

            <a
              :href="reviewTarget.url"
              target="_blank"
              rel="noopener noreferrer"
              class="maps"
            >
              <svg v-if="reviewTarget.direct" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.4l7-.9z" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {{ reviewTarget.direct ? 'Write a review' : 'Open in Google Maps' }}
            </a>

            <a
              v-if="reviewTarget.direct"
              :href="store.mapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="secondary-link"
            >
              View listing &amp; directions
            </a>
          </aside>
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section class="section">
      <div class="container">
        <header class="sec-head">
          <div>
            <p class="eyebrow">Ready to copy</p>
            <h2 class="display sec-title">Pick the review that fits your visit</h2>
            <p class="sub">
              Every one of these is a starting point — copy it as-is, or tweak a line so it
              sounds like you.
            </p>
          </div>
        </header>

        <div class="filters">
          <div class="row" role="group" aria-label="Filter by tone">
            <span class="row-label">Tone</span>
            <button
              v-for="t in availableTones"
              :key="t.value"
              class="filter"
              type="button"
              :class="{ on: tone === t.value }"
              @click="tone = t.value"
            >
              {{ t.label }}
            </button>
          </div>

          <div class="row" role="group" aria-label="Filter by topic">
            <span class="row-label">Topic</span>
            <button class="filter" type="button" :class="{ on: tag === 'all' }" @click="tag = 'all'">
              Any
            </button>
            <button
              v-for="t in tags"
              :key="t"
              class="filter"
              type="button"
              :class="{ on: tag === t }"
              @click="tag = t"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <div class="status">
          <p class="count" aria-live="polite">
            Showing {{ filtered.length }} review<span v-if="filtered.length !== 1">s</span>
            <span v-if="queued"> · {{ queued }} more waiting</span>
          </p>
          <p v-if="usedCount" class="used-note">
            {{ usedCount }} already copied
            <button class="restore" type="button" @click="restoreAll">Restore</button>
          </p>
        </div>

        <!-- Exhausted: every review for this store has been copied -->
        <div v-if="exhausted" class="done">
          <span class="done-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <h3>You've used all {{ store.reviews.length }} reviews</h3>
          <p>
            Every review for {{ store.name }} has been copied on this device. Reset the list to
            start over — just remember to reword anything you post twice.
          </p>
          <button class="btn btn-primary" type="button" @click="restoreAll">Reset the list</button>
        </div>

        <TransitionGroup v-else-if="filtered.length" name="swap" tag="div" class="grid">
          <ReviewCard
            v-for="(r, i) in filtered"
            :key="r.id"
            :review="r"
            :index="i"
            :accent="store.accent"
            :copied="copiedId === r.id"
            @copy="emit('copy', $event)"
          />
        </TransitionGroup>

        <div v-else class="empty">
          <p>No unused reviews match this combination of filters.</p>
          <button class="btn btn-ghost btn-sm" type="button" @click="reset">Clear filters</button>
        </div>
      </div>
    </section>

    <!-- Branding -->
    <section class="branding-wrap">
      <div class="container">
        <BrandingPanel :store="store" />
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="cta-band">
      <div class="container inner">
        <div>
          <h2 class="display">Copied a review? One tap left.</h2>
          <p v-if="reviewTarget.direct">
            This opens the review box for {{ store.name }} directly — just paste and post.
          </p>
          <p v-else>Open {{ store.name }} on Google Maps and paste it in.</p>
        </div>
        <a :href="reviewTarget.url" target="_blank" rel="noopener noreferrer" class="btn cta-btn">
          {{ reviewTarget.direct ? 'Write the review' : 'Open in Google Maps' }}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17L17 7M8 7h9v9" />
          </svg>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  position: relative;
  padding: 26px 0 44px;
  overflow: hidden;
}

.wash {
  position: absolute;
  top: -320px;
  left: 50%;
  width: 1000px;
  height: 620px;
  transform: translateX(-50%);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--a) 26%, transparent), transparent);
  filter: blur(24px);
  pointer-events: none;
}

.back {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 26px;
  padding: 8px 15px;
  border-radius: 999px;
  font-size: 0.83rem;
  font-weight: 500;
  color: var(--ink-2);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  transition: all 0.2s var(--ease);
}

.back:hover { color: var(--ink); border-color: var(--line-2); transform: translateX(-2px); }

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  gap: 32px;
  align-items: start;
}

.identity {
  display: flex;
  gap: 18px;
  animation: rise 0.55s var(--ease) both;
}

.mark {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 62px;
  height: 62px;
  border-radius: 18px;
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--a), var(--b));
  box-shadow: 0 6px 20px color-mix(in srgb, var(--a) 38%, transparent);
}

.name {
  font-size: clamp(1.7rem, 4.2vw, 2.6rem);
  margin: 6px 0 8px;
}

.tagline {
  font-size: 1rem;
  color: var(--ink-2);
  max-width: 46ch;
}

.rating {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  font-size: 0.86rem;
}

.rating strong { font-weight: 700; }
.rating span { color: var(--ink-3); }

.info {
  padding: 22px;
  animation: rise 0.55s var(--ease) both;
  animation-delay: 100ms;
}

.info dl {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info dt {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 3px;
}

.info dd {
  font-size: 0.87rem;
  color: var(--ink-2);
  line-height: 1.5;
}

.info dd a { color: var(--ink-2); border-bottom: 1px solid var(--line-2); }
.info dd a:hover { color: var(--ink); }

.maps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 20px;
  padding: 12px 18px;
  border-radius: 999px;
  font-size: 0.87rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--a), var(--b));
  box-shadow: 0 4px 16px color-mix(in srgb, var(--a) 32%, transparent);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.maps:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--a) 42%, transparent);
}

.secondary-link {
  display: block;
  margin-top: 11px;
  text-align: center;
  font-size: 0.79rem;
  color: var(--ink-3);
  transition: color 0.18s var(--ease);
}

.secondary-link:hover { color: var(--ink); }

/* Reviews */
.section { padding: 42px 0 56px; }

.sec-head { margin-bottom: 22px; }

.sec-title {
  font-size: clamp(1.45rem, 3.2vw, 1.95rem);
  margin: 8px 0 10px;
}

.sub {
  color: var(--ink-2);
  font-size: 0.93rem;
  max-width: 58ch;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  margin-bottom: 18px;
  border-radius: var(--radius);
  background: var(--bg-sunken);
  border: 1px solid var(--line);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.row-label {
  min-width: 48px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.filter {
  padding: 6px 13px;
  border-radius: 999px;
  font-size: 0.79rem;
  font-weight: 500;
  color: var(--ink-2);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  transition: all 0.18s var(--ease);
}

.filter:hover { color: var(--ink); border-color: var(--line-2); }

.filter.on {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--a), var(--b));
}

.status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin-bottom: 18px;
}

.count {
  font-size: 0.79rem;
  color: var(--ink-3);
}

.used-note {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 0.79rem;
  color: var(--ink-3);
}

.restore {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink-2);
  border-bottom: 1px solid var(--line-2);
  transition: color 0.18s var(--ease), border-color 0.18s var(--ease);
}

.restore:hover { color: var(--ink); border-color: var(--ink-3); }

/* Exhausted state */
.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 28px;
  text-align: center;
  border-radius: var(--radius-lg);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  animation: rise 0.5s var(--ease) both;
}

.done-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(135deg, var(--a), var(--b));
  box-shadow: 0 6px 18px color-mix(in srgb, var(--a) 34%, transparent);
}

.done h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
}

.done p {
  max-width: 46ch;
  font-size: 0.89rem;
  color: var(--ink-2);
  line-height: 1.6;
}

.done .btn { margin-top: 6px; }

/* Copied card leaves, the replacement slides up into its slot */
.swap-leave-active {
  transition: opacity 0.32s var(--ease), transform 0.32s var(--ease);
  position: absolute;
  width: calc(100% - 0px);
}

.swap-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(-6px);
}

.swap-enter-active { transition: opacity 0.4s var(--ease), transform 0.4s var(--ease); }

.swap-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.swap-move { transition: transform 0.4s var(--ease); }

.grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 18px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 56px 0;
  color: var(--ink-3);
}

/* Branding */
.branding-wrap {
  background: var(--bg-sunken);
  border-block: 1px solid var(--line);
  padding-bottom: 44px;
}

/* CTA band */
.cta-band { padding: 52px 0; }

.cta-band .inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding: 34px;
  border-radius: var(--radius-xl);
  color: #fff;
  background: linear-gradient(120deg, var(--a), var(--b));
  box-shadow: var(--shadow-lg);
}

.cta-band h2 {
  font-size: clamp(1.3rem, 3vw, 1.75rem);
}

.cta-band p {
  margin-top: 7px;
  font-size: 0.92rem;
  opacity: 0.9;
}

.cta-btn {
  background: #fff;
  color: #111;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

.cta-btn:hover { transform: translateY(-2px); }

@media (max-width: 860px) {
  .hero-grid { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .identity { flex-direction: column; gap: 14px; }
  .cta-band .inner { padding: 26px; }

  /* Comfortable touch targets — chips are small to hit with a thumb. */
  .filter { padding: 9px 15px; font-size: 0.82rem; }
  .row-label { min-width: 100%; }
  .filters { padding: 14px; }
  .status { gap: 6px; }
  .maps { padding: 14px 18px; }
  .done { padding: 44px 20px; }
}
</style>
