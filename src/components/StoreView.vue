<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Store, Review } from '../types'
import { CATEGORY_LABELS, SENTIMENTS, SENTIMENT_LABELS, type Sentiment } from '../types'
import ReviewCard from './ReviewCard.vue'
import StoreBanner from './StoreBanner.vue'
import GoogleMapsIcon from './GoogleMapsIcon.vue'
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

/** How many reviews to show for the selected option. */
const PAGE_SIZE = 4

const sentiment = ref<Sentiment | 'all'>('all')

/** Reviews this visitor has not copied yet — the live pool. */
const available = computed(() => props.store.reviews.filter(r => !isUsed(r.id)))

const usedCount = computed(() => props.store.reviews.length - available.value.length)
const exhausted = computed(() => available.value.length === 0)

/**
 * Only offer an option that still has something behind it, so a chip never
 * leads to an empty list as reviews get used up.
 */
const options = computed(() => {
  const live = new Set(available.value.map(r => r.sentiment))
  return SENTIMENTS.filter(v => live.has(v)).map(v => ({ value: v, label: SENTIMENT_LABELS[v] }))
})

/** Reviews matching the current filters, before the display window. */
const matching = computed(() =>
  available.value.filter(r => {
    if (sentiment.value !== 'all' && r.sentiment !== sentiment.value) return false
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
  sentiment.value = 'all'
}

/** Puts every review for this store back into circulation. */
function restoreAll() {
  resetMany(props.store.reviews.map(r => r.id))
  reset()
}
</script>

<template>
  <div class="page" :style="{ '--a': store.accent[0], '--b': store.accent[1] }">
    <StoreBanner :store="store" />

    <!-- Store hero -->
    <section class="hero has-banner">
      <div class="container">
        <button v-if="!single" class="back" type="button" @click="emit('back')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          All stores
        </button>

        <div class="hero-grid">
          <div class="identity">
            <p class="eyebrow">{{ CATEGORY_LABELS[store.category] }}</p>
            <h1 class="display name">{{ store.name }}</h1>
            <p class="tagline">{{ store.tagline }}</p>

            <div class="rating">
              <strong class="score">{{ store.rating.toFixed(1) }}</strong>
              <StarRating :rating="store.rating" :size="15" />
              <span class="count">{{ store.reviewCount.toLocaleString() }} Google reviews</span>
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
              <GoogleMapsIcon :size="18" />
              {{ reviewTarget.direct ? 'Write a review' : 'Open listing' }}
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
          <div class="row" role="group" aria-label="Filter by how the visit went">
            <span class="row-label">How was it?</span>
            <button
              class="filter"
              type="button"
              :class="{ on: sentiment === 'all' }"
              @click="sentiment = 'all'"
            >
              Any
            </button>
            <button
              v-for="o in options"
              :key="o.value"
              class="filter"
              type="button"
              :class="{ on: sentiment === o.value }"
              @click="sentiment = o.value"
            >
              {{ o.label }}
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

    <!-- Closing CTA -->
    <section class="cta-band">
      <div class="container inner">
        <div>
          <h2 class="display">Copied a review? One tap left.</h2>
          <p v-if="reviewTarget.direct">
            This opens the Google Maps review box for {{ store.name }} — just paste and post.
          </p>
          <p v-else>Open {{ store.name }} on Google Maps and paste it in.</p>
        </div>
        <a :href="reviewTarget.url" target="_blank" rel="noopener noreferrer" class="btn cta-btn">
          <GoogleMapsIcon :size="17" />
          {{ reviewTarget.direct ? 'Write the review' : 'Open listing' }}
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  position: relative;
  padding: 0 0 var(--sp-8);
}

/*
 * Pulled up over the banner's fade so the identity emerges from the image
 * rather than starting below a hard edge.
 */
.hero.has-banner {
  margin-top: clamp(-96px, -9vw, -56px);
}

.back {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-6);
  padding: var(--sp-2) var(--sp-4);
  border-radius: 999px;
  font-size: var(--t-meta);
  font-weight: 500;
  color: var(--ink-2);
  background: var(--surface-glass);
  backdrop-filter: blur(8px);
  border: 1px solid var(--line);
  transition: color 0.22s var(--ease), border-color 0.22s var(--ease),
              transform 0.22s var(--ease);
}

.back:hover { color: var(--ink); border-color: var(--line-2); transform: translateX(-2px); }

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(290px, 350px);
  gap: var(--sp-7);
  align-items: start;
}

.identity {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-3);
  animation: settle 0.7s var(--ease) both;
}

/* The dominant element on the page — everything else defers to it. */
.name {
  font-size: var(--t-h1);
  max-width: 18ch;
}

.tagline {
  font-size: var(--t-lead);
  font-weight: 400;
  line-height: 1.65;
  color: var(--ink-2);
  max-width: 44ch;
}

/*
 * The reputation line — the one number a visitor scans for. It gets its own
 * tinted panel so it reads as a highlight rather than another row of text.
 */
.rating {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-top: var(--sp-4);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--line);
  border-left: 3px solid var(--star);
  border-radius: var(--radius-sm);
  background: var(--bg-elev);
}

.score {
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--gold-ink);
}

.count {
  font-size: var(--t-meta);
  color: var(--ink-3);
}

.rating strong { font-weight: 700; }
.rating span { color: var(--ink-3); }

.info {
  padding: var(--sp-5);
  animation: settle 0.7s var(--ease) both;
  animation-delay: 120ms;
}

/* Rules between rows rather than around them — lighter than boxed sections. */
.info dl {
  display: flex;
  flex-direction: column;
}

.info dl > div + div {
  margin-top: var(--sp-4);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--line);
}

.info dt {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--t-eyebrow);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: var(--sp-2);
}

.info dt svg { color: var(--gold); }

.info dd {
  font-size: var(--t-meta);
  color: var(--ink);
  line-height: 1.62;
}

.info dd a { color: var(--ink-2); border-bottom: 1px solid var(--line-2); }
.info dd a:hover { color: var(--ink); }

.maps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  margin-top: var(--sp-5);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-sm);
  font-size: var(--t-meta);
  font-weight: 500;
  color: var(--on-fill);
  background: var(--brand);
  box-shadow: var(--shadow-sm);
  transition: transform 0.24s var(--ease), box-shadow 0.24s var(--ease),
              background 0.24s var(--ease);
}

.maps:hover {
  transform: translateY(-1px);
  background: var(--brand-2);
  box-shadow: var(--shadow);
}

/* Reviews */
/* Generous, even rhythm — the whitespace is doing the design work here. */
.section { padding: var(--sp-8) 0 var(--sp-9); }

.sec-head { margin-bottom: var(--sp-6); }

.sec-title {
  font-size: var(--t-h2);
  margin: var(--sp-3) 0 var(--sp-3);
  max-width: 20ch;
}

.sub {
  color: var(--ink-2);
  font-size: var(--t-body);
  line-height: 1.7;
  max-width: 54ch;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding-bottom: var(--sp-5);
  margin-bottom: var(--sp-5);
  border-bottom: 1px solid var(--line);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2);
}

.row-label {
  margin-right: var(--sp-2);
  font-size: var(--t-eyebrow);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.filter {
  padding: var(--sp-2) var(--sp-4);
  border-radius: 999px;
  font-size: var(--t-meta);
  font-weight: 400;
  letter-spacing: 0.01em;
  color: var(--ink-2);
  background: transparent;
  border: 1px solid var(--line-2);
  transition: color 0.3s var(--ease), border-color 0.3s var(--ease),
              background 0.3s var(--ease);
}

.filter:hover { color: var(--ink); border-color: var(--line-2); }

.filter.on {
  color: var(--on-fill);
  border-color: var(--fill-deep);
  background: var(--fill-deep);
}

.status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin-bottom: var(--sp-4);
}

.count {
  font-size: var(--t-caption);
  color: var(--ink-3);
}

.used-note {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--t-caption);
  color: var(--ink-3);
}

.restore {
  font-size: var(--t-caption);
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
  gap: var(--sp-3);
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
  color: var(--on-fill);
  background: var(--a);
  box-shadow: var(--shadow-sm);
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

.done .btn { margin-top: var(--sp-2); }

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
  gap: var(--sp-4);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  padding: 56px 0;
  color: var(--ink-3);
}

/* CTA band */
.cta-band { padding: 0 0 var(--sp-9); }

.cta-band .inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-5);
  padding: var(--sp-7) var(--sp-6);
  border-radius: var(--radius-xl);
  color: var(--on-fill);
  background: var(--fill-deep);
}

.cta-band h2 {
  font-size: clamp(1.3rem, 3vw, 1.75rem);
}

.cta-band p {
  margin-top: var(--sp-2);
  font-size: var(--t-body);
  opacity: 0.9;
}

.cta-btn {
  background: var(--on-fill);
  color: var(--ink);
  box-shadow: var(--shadow);
}

.cta-btn:hover { transform: translateY(-2px); }

@media (max-width: 860px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: var(--sp-5);
  }

  /* Identity leads; the details card follows rather than sitting alongside. */
  .info { order: 2; }
}

@media (max-width: 560px) {
  /* Less negative pull so the name clears the banner on a short screen. */
  .hero.has-banner { margin-top: -44px; }
  .hero { padding-bottom: var(--sp-6); }

  .name { max-width: 100%; }
  .tagline { font-size: var(--t-body); }

  .rating {
    max-width: 100%;
    flex-wrap: wrap;
    gap: var(--sp-2) var(--sp-3);
  }

  .section { padding: var(--sp-7) 0 var(--sp-8); }
  .sec-title { max-width: 100%; }

  /* The label owns its own line so chips get the full width to wrap into. */
  .row-label { width: 100%; margin-bottom: var(--sp-1); }

  /* Thumb-friendly targets — 44px min height for anything tappable. */
  .filter { padding: var(--sp-3) var(--sp-4); }
  .maps { padding: var(--sp-4); }

  .cta-band .inner {
    padding: var(--sp-6) var(--sp-5);
    /* Stack so the CTA is full-width and reachable, not squeezed beside text. */
    flex-direction: column;
    align-items: stretch;
    text-align: left;
  }

  .cta-btn { justify-content: center; }
  .done { padding: var(--sp-7) var(--sp-5); }
}

</style>
