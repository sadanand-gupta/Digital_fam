<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Store } from '../types'
import { REPORT_ISSUE } from '../data/chickatoReviews'
import { useIssueReport, type IssueReport } from '../composables/useIssueReport'
import StarRating from './StarRating.vue'

const props = defineProps<{ store: Store; stars: number }>()

const { report, save, clear } = useIssueReport()

/** Longer than this and nobody reads it, including the owner. */
const MAX = 600

const topics = ref<string[]>([])
const comment = ref('')
const phone = ref('')

/** Errors stay hidden until the first send attempt — nagging as you type is rude. */
const tried = ref(false)

/** Regenerated after "report something else" so the second one is its own case. */
const draftRef = ref(makeRef())

/**
 * A short handle the visitor can quote back: 'CC-4K1Z'. Initials of the shop,
 * then the clock in base 36. Not unique across the world and does not need to
 * be — it exists so a complaint feels filed rather than shouted into the air.
 */
function makeRef() {
  const initials =
    props.store.name
      .replace(/[^A-Za-z ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || 'DF'
  const tail = (Date.now() % 1679616).toString(36).toUpperCase().padStart(4, '0')
  return `${initials}-${tail}`
}

/** Drops spaces, dashes and a leading country code, leaving the local number. */
function localDigits(raw: string) {
  const d = raw.replace(/\D/g, '')
  return d.length > 10 && d.startsWith('91') ? d.slice(2) : d
}

const phoneDigits = computed(() => localDigits(phone.value))
const commentOk = computed(() => comment.value.trim().length >= 5)
/** Indian mobile. A landline cannot receive WhatsApp, so it is not accepted. */
const phoneOk = computed(() => /^[6-9]\d{9}$/.test(phoneDigits.value))
const valid = computed(() => commentOk.value && phoneOk.value)

function toggle(t: string) {
  topics.value = topics.value.includes(t)
    ? topics.value.filter(x => x !== t)
    : [...topics.value, t]
}

/** '9876543210' reads as a number; '98765 43210' reads as someone's phone. */
function pretty(d: string) {
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : `+91 ${d}`
}

function messageFor(r: IssueReport) {
  const lines = [`Issue report - ${props.store.name}`, `Rating given: ${r.stars} out of 5`]
  if (r.topics.length) lines.push(`What went wrong: ${r.topics.join(', ')}`)
  lines.push('', r.comment, '')
  lines.push(`Reach me on WhatsApp: ${pretty(r.phone)}`)
  lines.push(`Ref: ${r.ref}`)
  return lines.join('\n')
}

/**
 * There is no server behind this page, so a report is delivered the way the
 * shop already works: the owner's WhatsApp, opened with the text prefilled.
 * The visitor still presses send, which is why the confirmation says so
 * instead of claiming the message has already landed.
 */
function waUrl(r: IssueReport) {
  const to = REPORT_ISSUE.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${to}?text=${encodeURIComponent(messageFor(r))}`
}

const draft = computed<IssueReport>(() => ({
  ref: draftRef.value,
  stars: props.stars,
  topics: [...topics.value],
  comment: comment.value.trim(),
  phone: phoneDigits.value,
  at: new Date().toISOString(),
}))

/**
 * Click handler of a real <a>, deliberately not preventing default once the
 * form is valid: the browser performs the navigation itself as part of the
 * same user gesture, which survives iOS popup blocking in a way window.open
 * does not. Everything here is synchronous for the same reason.
 */
function onSend(e: MouseEvent) {
  tried.value = true
  if (!valid.value) {
    e.preventDefault()
    return
  }
  save({ ...draft.value, at: new Date().toISOString() })
}

function startOver() {
  clear()
  topics.value = []
  comment.value = ''
  phone.value = ''
  tried.value = false
  draftRef.value = makeRef()
}

const when = computed(() => {
  if (!report.value) return ''
  return new Date(report.value.at).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
})
</script>

<template>
  <!--
    One card, built to the same spec as the review cards in the carousel above
    it — same border, radius, width and padding. A low rating should not drop
    the visitor onto a different-looking page; it should just be the one card
    that happens to be theirs.
  -->

  <!-- Filed: shown the moment they send, and again if they come back. -->
  <div v-if="report" class="one">
    <span class="seal" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>

    <h2 class="title">Reported. We are on it.</h2>
    <p class="lead">
      Press send in the WhatsApp chat that just opened and it is on the owner's phone.
      Nothing here is posted anywhere public.
    </p>

    <p class="refline">
      Reference <strong>{{ report.ref }}</strong> <span aria-hidden="true">·</span> {{ when }}
    </p>

    <ol class="flow">
      <li class="on">
        <span class="mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <span class="body">
          <strong>Written up and sent.</strong>
          A copy stays on this device under {{ report.ref }}.
        </span>
      </li>
      <li>
        <span class="mark" aria-hidden="true">2</span>
        <span class="body">
          <strong>The owner reads it himself.</strong>
          No call centre, no ticket queue in between.
        </span>
      </li>
      <li>
        <span class="mark" aria-hidden="true">3</span>
        <span class="body">
          <strong>He replies on {{ pretty(report.phone) }}.</strong>
          You hear what actually changed, not just an apology.
        </span>
      </li>
    </ol>

    <a class="btn btn-primary send" :href="waUrl(report)" target="_blank" rel="noopener noreferrer">
      Open WhatsApp again
    </a>

    <div class="foot">
      <button class="quiet" type="button" @click="startOver">Report something else</button>
      <a class="quiet" :href="`tel:${REPORT_ISSUE.phone}`">Call {{ REPORT_ISSUE.phoneLabel }}</a>
    </div>
  </div>

  <!-- The card itself. Twenty seconds of work, no account, no app. -->
  <div v-else class="one">
    <header class="head">
      <StarRating :rating="stars" :size="15" />
      <span class="ratenote">Your rating</span>
    </header>

    <h2 class="title">{{ REPORT_ISSUE.heading }}</h2>
    <p class="lead">{{ REPORT_ISSUE.body }}</p>

    <fieldset class="block">
      <legend class="label">What went wrong? <span class="opt">pick any</span></legend>
      <div class="chips">
        <button
          v-for="t in REPORT_ISSUE.topics"
          :key="t"
          class="chip"
          :class="{ on: topics.includes(t) }"
          type="button"
          :aria-pressed="topics.includes(t)"
          @click="toggle(t)"
        >
          {{ t }}
        </button>
      </div>
    </fieldset>

    <div class="block">
      <label class="label" for="rp-note">In your own words</label>
      <textarea
        id="rp-note"
        v-model="comment"
        class="field note"
        :class="{ bad: tried && !commentOk }"
        :maxlength="MAX"
        rows="4"
        placeholder="What happened? The more exact you are, the faster it gets fixed."
        :aria-invalid="tried && !commentOk"
        aria-describedby="rp-note-help"
      />
      <p id="rp-note-help" class="under">
        <span v-if="tried && !commentOk" class="bad-text">
          Add a line about what happened, so the owner knows what to fix.
        </span>
        <span v-else class="count">{{ comment.length }} / {{ MAX }}</span>
      </p>
    </div>

    <div class="block">
      <label class="label" for="rp-wa">Your WhatsApp number</label>
      <div class="phone field" :class="{ bad: tried && !phoneOk }">
        <span class="cc" aria-hidden="true">+91</span>
        <input
          id="rp-wa"
          v-model="phone"
          type="tel"
          inputmode="numeric"
          autocomplete="tel-national"
          maxlength="15"
          placeholder="98765 43210"
          :aria-invalid="tried && !phoneOk"
          aria-describedby="rp-wa-help"
        />
      </div>
      <p id="rp-wa-help" class="under">
        <span v-if="tried && !phoneOk" class="bad-text">
          Enter the 10-digit mobile your WhatsApp is on.
        </span>
        <span v-else>So the owner can come back to you once it is sorted. Never shown publicly.</span>
      </p>
    </div>

    <!--
      The promise is the whole reason this card exists. Someone who believes it
      will be fixed does not need to go and say it louder on Google.
    -->
    <p class="promise">
      <span class="tick" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      We will fix this, and we will tell you what changed. You have our word.
    </p>

    <a
      class="btn btn-primary send"
      :href="waUrl(draft)"
      target="_blank"
      rel="noopener noreferrer"
      @click="onSend"
    >
      <svg class="wa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.1c-.25.69-1.44 1.32-1.99 1.36-.53.05-1.02.23-3.45-.72-2.9-1.14-4.74-4.1-4.88-4.29-.14-.19-1.16-1.55-1.16-2.95 0-1.4.73-2.09.99-2.37.26-.28.57-.35.76-.35h.54c.18 0 .42-.07.65.5.25.6.84 2.07.91 2.22.07.14.12.31.02.5-.09.19-.14.31-.28.47l-.42.49c-.14.14-.28.29-.12.57.16.28.72 1.18 1.54 1.91 1.06.94 1.95 1.24 2.23 1.38.28.14.44.12.6-.07.16-.19.69-.8.88-1.08.19-.28.37-.23.62-.14.25.09 1.61.76 1.89.9.28.14.46.21.53.32.07.12.07.65-.18 1.34z" />
      </svg>
      Report the issue
    </a>

    <div class="foot">
      <span class="fine">Goes to the owner only. Never posted publicly.</span>
      <a class="quiet" :href="`tel:${REPORT_ISSUE.phone}`">Call {{ REPORT_ISSUE.phoneLabel }}</a>
    </div>
  </div>
</template>

<style scoped>
/*
 * Border, radius, padding and width all match ReviewCard — this is the same
 * object as the cards in the carousel, holding a form instead of a review.
 */
.one {
  width: 100%;
  max-width: 440px;
  margin-inline: auto;
  text-align: left;

  padding: var(--sp-5);
  background: var(--bg-elev);
  border: 1.5px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
}

.head {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-3);
}

.ratenote {
  font-size: var(--t-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: var(--ink-3);
}

.title {
  font-family: var(--font-display);
  font-size: var(--t-h3);
  line-height: 1.3;
}

.lead {
  margin-top: var(--sp-2);
  color: var(--ink-2);
  font-size: var(--t-meta);
  line-height: 1.6;
}

/* ---------- Form blocks ---------- */
.block {
  width: 100%;
  margin-top: var(--sp-5);
  border: none;
  padding: 0;
}

.label {
  display: block;
  font-size: var(--t-meta);
  font-weight: 600;
  margin-bottom: var(--sp-2);
  padding: 0;
}

.opt {
  font-weight: 400;
  color: var(--ink-3);
  font-size: var(--t-caption);
}

.under {
  margin-top: var(--sp-2);
  font-size: var(--t-caption);
  color: var(--ink-3);
  line-height: 1.45;
}

.count { font-variant-numeric: tabular-nums; }

/* Gold-ink rather than red: this card is already an apology, and a red field
 * on top of it reads as the visitor having done something wrong. */
.bad-text { color: var(--gold-ink); font-weight: 600; }

/* ---------- Chips ---------- */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.chip {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--line);
  background: var(--bg-sunken);
  color: var(--ink-2);
  font-size: var(--t-caption);
  font-weight: 500;
  transition: border-color 0.18s var(--ease), background 0.18s var(--ease),
              color 0.18s var(--ease);
}

.chip:hover { border-color: var(--line-2); }

.chip.on {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--on-fill);
}

/* ---------- Fields ---------- */
.field {
  width: 100%;
  background: var(--bg-sunken);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

.field:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 14%, transparent);
}

.field.bad { border-color: var(--gold-ink); }

.note {
  display: block;
  padding: var(--sp-3) var(--sp-4);
  font-size: var(--t-body);
  line-height: 1.6;
  resize: vertical;
  min-height: 104px;
}

/* The ring on .field is the focus indicator for both controls. */
.note:focus, .phone input:focus { outline: none; }

.note::placeholder, .phone input::placeholder { color: var(--ink-3); }

.phone {
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

.cc {
  padding: 0 var(--sp-3);
  display: grid;
  place-items: center;
  font-size: var(--t-body);
  font-weight: 600;
  color: var(--ink-2);
  border-right: 1.5px solid var(--line);
  background: color-mix(in srgb, var(--ink) 4%, transparent);
}

.phone input {
  flex: 1;
  min-width: 0;
  padding: 13px var(--sp-4);
  border: none;
  background: none;
  font-size: var(--t-body);
  letter-spacing: 0.04em;
}

/* ---------- The promise ---------- */
.promise {
  margin-top: var(--sp-5);
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: var(--sp-3);
  align-items: start;

  padding: var(--sp-3) var(--sp-4);
  border-radius: 12px;
  /* Gold wash rather than a border, so it reads as a note and not a warning. */
  background: color-mix(in srgb, var(--gold) 12%, transparent);
  font-size: var(--t-caption);
  font-weight: 600;
  color: var(--ink);
  line-height: 1.5;
}

.tick {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--gold-ink);
  color: var(--on-fill);
}

.tick svg { width: 11px; height: 11px; }

/* ---------- Send ---------- */
.send {
  margin-top: var(--sp-4);
  width: 100%;
  padding-block: 14px;
  font-size: var(--t-body);
}

.wa { width: 18px; height: 18px; }

.foot {
  margin-top: var(--sp-3);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2) var(--sp-4);
}

.fine {
  font-size: var(--t-caption);
  color: var(--ink-3);
}

.quiet {
  font-size: var(--t-caption);
  font-weight: 600;
  color: var(--ink-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.quiet:hover { color: var(--ink); }

/* ---------- Filed state ---------- */
.seal {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: var(--brand);
  color: var(--on-fill);
  margin-bottom: var(--sp-3);
  animation: pop 0.42s var(--ease) both;
}

.seal svg { width: 21px; height: 21px; }

@keyframes pop {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.refline {
  margin-top: var(--sp-3);
  font-size: var(--t-caption);
  color: var(--ink-3);
  letter-spacing: 0.04em;
}

.refline strong {
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

/*
 * The three steps are the point of this state. An unhappy customer is really
 * asking "and then what?" — a bare thank-you leaves that unanswered, which is
 * what sends them to Google to say it louder instead.
 */
.flow {
  width: 100%;
  margin-top: var(--sp-4);
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--sp-4);
}

.flow li {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: var(--sp-3);
  align-items: start;
}

.mark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1.5px solid var(--line-2);
  color: var(--ink-3);
  font-size: var(--t-caption);
  font-weight: 700;
}

.flow .on .mark {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--on-fill);
}

.mark svg { width: 12px; height: 12px; }

.flow .body {
  font-size: var(--t-caption);
  color: var(--ink-3);
  line-height: 1.55;
}

.flow .body strong {
  display: block;
  font-size: var(--t-meta);
  color: var(--ink);
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .seal { animation: none; }
}
</style>
