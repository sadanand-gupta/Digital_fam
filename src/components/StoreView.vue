<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Store, Review } from '../types'
import { bestReviewTarget } from '../data/mapsLinks'
import { useUsedReviews } from '../composables/useUsedReviews'
import { useOfferSignup } from '../composables/useOfferSignup'
import StarPicker from './StarPicker.vue'
import ReviewCard from './ReviewCard.vue'
import OfferSignup from './OfferSignup.vue'
import StarRating from './StarRating.vue'
import GoogleMapsIcon from './GoogleMapsIcon.vue'

const props = defineProps<{ store: Store; copiedId: string | null }>()
const emit = defineEmits<{ copy: [review: Review] }>()

const { isUsed, markUsed, resetMany } = useUsedReviews()

/** How many cards the carousel offers per star level. */
const PAGE_SIZE = 5

const stars = ref<number | null>(null)
const selected = ref<Review | null>(null)
/** True once this visitor has sent one off to Maps, so we can say thanks. */
const handedOff = ref(false)

/** Prefers Google's review composer, falls back to the plain listing. */
const target = computed(() => bestReviewTarget(props.store))

/**
 * The cards on offer: this star level, minus anything already copied on this
 * device. Retiring used text is what stops ten customers posting identical
 * reviews and getting all ten filtered as spam.
 */
const pool = computed(() => {
  if (stars.value === null) return []
  return props.store.reviews
    .filter(r => r.rating === stars.value && !isUsed(r.id))
    .slice(0, PAGE_SIZE)
})

/** Every review for this star level has been used up on this device. */
const exhausted = computed(() => stars.value !== null && pool.value.length === 0)

/**
 * Someone already on the list has nothing to fill in, so the offer step is
 * skipped for them entirely — Add review goes straight to Google, the way it
 * did before any of this existed. Making a returning customer tap twice to
 * read "you are already signed up" is a step that buys nobody anything.
 */
const { savedPhone } = useOfferSignup()

/** True once Add review has been pressed and the offer is showing. */
const offerOpen = ref(false)
const offer = ref<InstanceType<typeof OfferSignup> | null>(null)

/* Changing the star rating invalidates whatever was picked underneath it. */
watch(stars, () => {
  selected.value = null
  handedOff.value = false
  offerOpen.value = false
})

/* Picking a different card puts them back at the Add review press — and
 * clears the hand-off, or the previous card's "Copied" would stand over a
 * review this visitor has not copied. */
watch(selected, () => {
  offerOpen.value = false
  handedOff.value = false
})

/**
 * Copy and hand off in one press.
 *
 * This runs as the click handler of a real <a>, and deliberately does NOT
 * preventDefault: the browser performs the navigation itself as part of the
 * same user gesture, which is far more reliable than window.open on iOS.
 *
 * The copy must be issued synchronously here. Await anything first and Safari
 * treats the gesture as spent, the clipboard write is rejected, and the
 * visitor arrives at Google with nothing to paste.
 */
function onAdd() {
  const rv = selected.value
  if (!rv) return
  emit('copy', rv)
  markUsed(rv.id)
  handedOff.value = true
}

/** Same hand-off, but it throws away a number that has not saved yet. */
function onSkip() {
  offer.value?.cancel()
  onAdd()
}

/** Puts every review for this store back into circulation on this device. */
function restoreAll() {
  resetMany(props.store.reviews.map(r => r.id))
  selected.value = null
}
</script>

<template>
  <div class="page">
    <!-- 1 — Brand, straight away. Nothing above it to scroll past. -->
    <section class="hero">
      <div class="container">
        <h1 class="display name">{{ store.name }}</h1>
        <p class="tagline">{{ store.tagline }}</p>

        <div class="rating">
          <strong class="score">{{ store.rating.toFixed(1) }}</strong>
          <StarRating :rating="store.rating" :size="15" />
          <span class="count">{{ store.reviewCount }} Google reviews</span>
        </div>
      </div>
    </section>

    <!-- 2 — The star row, directly under the name. -->
    <section class="step">
      <div class="container">
        <p class="ask">How was your visit?</p>
        <StarPicker v-model="stars" />
      </div>
    </section>

    <!-- 3 — Whatever they tapped: swipe that level's cards, tap one. -->
    <template v-if="stars !== null">
      <section class="step">
        <div v-if="exhausted" class="container">
          <div class="spent card">
            <h2 class="spent-title">You have used every {{ stars }}-star review</h2>
            <p class="spent-body">
              All of them have been copied on this device. Reset to start over — just reword
              anything you post twice.
            </p>
            <button class="btn btn-ghost" type="button" @click="restoreAll">Reset the list</button>
          </div>
        </div>

        <template v-else>
          <p class="ask container">Pick the one that sounds like you</p>

          <!--
            Full-bleed on purpose: the track runs edge to edge so a half-visible
            card at the right tells you there is more to swipe.
          -->
          <div
            class="track"
            role="radiogroup"
            :aria-label="`${stars} star reviews`"
          >
            <ReviewCard
              v-for="r in pool"
              :key="r.id"
              :review="r"
              :selected="selected?.id === r.id"
              @select="selected = $event"
            />
          </div>

          <p class="hint container">{{ pool.length }} to choose from · swipe across</p>
        </template>
      </section>

      <!--
        4 — Add review, in two stages.

        Stage one opens the offer; stage two copies and hands off to Google.
        The number saves itself on a timer inside OfferSignup, but the copy and
        the new tab cannot: a browser only allows those inside the tap that
        asked for them, so Continue stays a real press on a real <a>.
      -->
      <section v-if="selected" class="step cta">
        <div class="container">
          <a
            v-if="savedPhone"
            class="btn btn-primary add"
            :href="target.url"
            target="_blank"
            rel="noopener noreferrer"
            @click="onAdd"
          >
            <GoogleMapsIcon :size="18" />
            Add review
          </a>

          <button
            v-else-if="!offerOpen"
            class="btn btn-primary add"
            type="button"
            @click="offerOpen = true"
          >
            <GoogleMapsIcon :size="18" />
            Add review
          </button>

          <template v-else>
            <OfferSignup ref="offer" :stars="stars ?? 5" :store="store.name" />

            <div class="go">
              <a
                class="btn btn-ghost"
                :href="target.url"
                target="_blank"
                rel="noopener noreferrer"
                @click="onSkip"
              >
                Skip
              </a>
              <a
                class="btn btn-primary add"
                :href="target.url"
                target="_blank"
                rel="noopener noreferrer"
                @click="onAdd"
              >
                <GoogleMapsIcon :size="18" />
                Continue
              </a>
            </div>

          </template>

          <p v-if="handedOff" class="done" role="status">
            Copied. Paste it into the box Google opened — then post.
          </p>
          <p v-else class="hint">
            Copies the review and opens
            {{ target.direct ? 'the Google review box' : 'the Google listing' }}.
          </p>
        </div>
      </section>
    </template>

    <!-- Shop details, kept below the funnel so it reads as a real business page. -->
    <section class="step details">
      <div class="container">
        <dl class="info card">
          <div>
            <dt>Address</dt>
            <dd>{{ store.address }}</dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{{ store.hours }}</dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---------- Hero ---------- */
/*
 * The map banner that used to sit above this was removed: it pulled a
 * third-party iframe on every visit, and dropping it lifts the star row
 * higher up the first screen, which is the only thing this page needs to do.
 */
.hero {
  padding-top: var(--sp-7);
  text-align: center;
}

.name {
  font-size: var(--t-h1);
  line-height: 1.1;
  letter-spacing: -0.015em;
}

.tagline {
  margin-top: var(--sp-2);
  color: var(--ink-2);
  font-size: var(--t-body);
}

.rating {
  margin-top: var(--sp-3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.score { font-size: var(--t-h3); }

.count {
  color: var(--ink-3);
  font-size: var(--t-meta);
}

/* ---------- Steps ---------- */
.step { padding-top: var(--sp-6); }

.ask {
  text-align: center;
  font-size: var(--t-lead);
  font-weight: 600;
  margin-bottom: var(--sp-4);
}

.hint {
  margin-top: var(--sp-3);
  text-align: center;
  font-size: var(--t-meta);
  color: var(--ink-3);
}

/* ---------- Carousel ---------- */
.track {
  display: flex;
  gap: var(--sp-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  /* Room for the selected card's 2px lift and its shadow. */
  padding: var(--sp-2) 0 var(--sp-4);
  /* Side padding so the first and last card can still centre when snapped. */
  padding-inline: max(var(--sp-5), calc((100% - min(86%, 420px)) / 2));
  scroll-padding-inline: var(--sp-5);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.track::-webkit-scrollbar { display: none; }

/* ---------- Add review ---------- */
.cta { text-align: center; }

.add {
  /* Wide enough to be the obvious next thing, capped so it stays a button. */
  min-width: min(320px, 100%);
  padding-block: 15px;
  font-size: var(--t-body);
}

/* Skip sits beside Continue, not under it: an escape hatch you have to hunt
 * for is a dark pattern, and this one costs nothing to offer. */
.go {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--sp-3);
}

.go .add { min-width: min(220px, 100%); }

.done {
  margin-top: var(--sp-3);
  font-size: var(--t-meta);
  font-weight: 600;
  color: var(--ok);
}

/* ---------- Used-up panel ---------- */
.spent {
  text-align: center;
  padding: var(--sp-6) var(--sp-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
}

.spent-title { font-size: var(--t-h3); }

.spent-body {
  color: var(--ink-2);
  font-size: var(--t-body);
  max-width: 44ch;
}

/* ---------- Details ---------- */
.details { padding-bottom: var(--sp-8); }

.info {
  padding: var(--sp-5);
  display: grid;
  gap: var(--sp-4);
}

.info dt {
  font-size: var(--t-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold-ink);
  margin-bottom: var(--sp-1);
}

.info dd {
  font-size: var(--t-meta);
  color: var(--ink-2);
  line-height: 1.55;
}

@media (min-width: 640px) {
  .info { grid-template-columns: 2fr 1fr; }
}
</style>
