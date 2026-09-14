<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Store, Review } from '../types'
import { bestReviewTarget } from '../data/mapsLinks'
import { useUsedReviews } from '../composables/useUsedReviews'
import StarPicker from './StarPicker.vue'
import ReviewCard from './ReviewCard.vue'
import OfferSignup from './OfferSignup.vue'
import StarRating from './StarRating.vue'
import ImageSlider from './ImageSlider.vue'

const props = defineProps<{ store: Store; copiedId: string | null }>()
const emit = defineEmits<{ copy: [review: Review] }>()

const { isUsed, markUsed, resetMany } = useUsedReviews()

/** How many cards the carousel offers per star level. */
const PAGE_SIZE = 3

const stars = ref<number | null>(null)
const selected = ref<Review | null>(null)
const customReviewText = ref('')
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

const offer = ref<InstanceType<typeof OfferSignup> | null>(null)

/* Changing the star rating invalidates whatever was picked underneath it. */
watch(stars, () => {
  selected.value = null
  customReviewText.value = ''
  handedOff.value = false
})

/* Picking a different card clears the hand-off */
watch(selected, () => {
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
  if (stars.value === 1) {
    if (customReviewText.value.trim()) {
      emit('copy', {
        id: 'custom-1star',
        rating: 1,
        text: customReviewText.value.trim(),
      })
    }
  } else {
    const rv = selected.value
    if (!rv) return
    emit('copy', rv)
    markUsed(rv.id)
  }
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
        <div class="staged-1"><ImageSlider /></div>
        <h1 class="display name staged-2">{{ store.name }}</h1>
        <p class="tagline staged-3">{{ store.tagline }}</p>

        <div class="rating staged-3">
          <strong class="score">{{ store.rating.toFixed(1) }}</strong>
          <StarRating :rating="store.rating" :size="15" />
          <span class="count">{{ store.reviewCount }} Google reviews</span>
        </div>
      </div>
    </section>

    <!-- 2 — The star row, directly under the name. -->
    <section class="step staged-4">
      <div class="container">
        <p class="ask">How was your visit?</p>
        <StarPicker v-model="stars" />
      </div>
    </section>

    <!-- 3 — Whatever they tapped: swipe that level's cards, tap one, or type feedback for 1 star. -->
    <template v-if="stars !== null">
      <section class="step" v-if="stars > 1">
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

      <section class="step" v-else-if="stars === 1">
        <div class="container custom-feedback-container">
          <p class="ask">Tell us what happened</p>
          <div class="custom-box">
            <textarea
              v-model="customReviewText"
              class="custom-textarea"
              placeholder="Type your feedback here based on your experience..."
              rows="4"
            ></textarea>
            <p v-if="customReviewText.trim()" class="custom-hint">
              Your feedback will be automatically copied to clipboard when you click Add review below.
            </p>
          </div>
        </div>
      </section>

      <!--
        4 — Add review, in two stages.

        Stage one opens the offer; stage two copies and hands off to Google.
        The number saves itself on a timer inside OfferSignup, but the copy and
        the new tab cannot: a browser only allows those inside the tap that
        asked for them, so Continue stays a real press on a real <a>.
      -->
      <section v-if="selected || stars === 1" class="step cta">
        <div class="container">
          <OfferSignup
            ref="offer"
            :stars="stars ?? 5"
            :store="store.name"
            :target-url="target.url"
            @skip="onSkip"
            @add="onAdd"
          />

          <p v-if="handedOff" class="done" role="status">
            {{ stars === 1
               ? (customReviewText.trim()
                   ? 'Copied. Paste it into the box Google opened — then post.'
                   : 'Opened Google. You can now write your own feedback.')
               : 'Copied. Paste it into the box Google opened — then post.' }}
          </p>
          <p v-else class="hint">
            {{ stars === 1
               ? (customReviewText.trim()
                   ? 'Copies your feedback and opens ' + (target.direct ? 'the Google review box' : 'the Google listing') + '.'
                   : 'Opens the Google review box so you can write your own feedback.')
               : 'Copies the review and opens ' + (target.direct ? 'the Google review box' : 'the Google listing') + '.' }}
          </p>
        </div>
      </section>
    </template>

    <!-- Shop details, kept below the funnel so it reads as a real business page. -->
    <section class="step details staged-4">
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
  color: var(--teal);
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
  color: var(--teal);
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

/* ---------- 1-Star Custom Feedback Box ---------- */
.custom-feedback-container {
  max-width: 520px;
  margin: 0 auto;
}

.custom-box {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--bg-elev, rgba(255, 255, 255, 0.03));
  border: 2.5px solid #25d366;
  border-radius: 18px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.custom-box:focus-within {
  border-color: #25d366;
  box-shadow: 0 0 0 4px rgba(37, 211, 102, 0.25), 0 8px 24px rgba(0, 0, 0, 0.4);
}

.custom-textarea {
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--ink, #ffffff);
  font-family: var(--font, sans-serif);
  font-size: var(--t-body, 0.95rem);
  line-height: 1.55;
  resize: vertical;
  min-height: 100px;
  outline: none;
}

.custom-textarea::placeholder {
  color: var(--ink-3, #707070);
}

.custom-hint {
  font-size: var(--t-caption, 0.8rem);
  color: #25d366;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 4px;
}

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
  color: #25d366;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(37, 211, 102, 0.1);
  border: 1px solid rgba(37, 211, 102, 0.25);
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
  color: var(--teal);
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

/* ---------- Staged Entrance ---------- */
@keyframes fade-scale-in {
  0% { opacity: 0; transform: scale(0.96); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes slide-up-fade {
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}

.staged-1 {
  animation: fade-scale-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: 0s;
}
.staged-2 {
  animation: slide-up-fade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: 0.2s;
}
.staged-3 {
  animation: slide-up-fade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: 0.4s;
}
.staged-4 {
  animation: slide-up-fade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: 0.6s;
}
</style>
