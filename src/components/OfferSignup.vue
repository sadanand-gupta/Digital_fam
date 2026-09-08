<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { OFFER } from '../data/offer'
import { useOfferSignup } from '../composables/useOfferSignup'

const props = defineProps<{ stars: number; store: string }>()

const { status, savedPhone, submit, reset } = useOfferSignup()

/**
 * How long the number sits still before it saves itself.
 *
 * Only the sheet write happens on this timer. The copy and the hop to Google
 * stay on the Continue tap, because a browser will not write the clipboard or
 * open a tab once the tap that started it is over.
 */
const SETTLE_MS = 2000

const phone = ref('')
const consent = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

/** Drops spaces and a leading country code, leaving the local number. */
const digits = computed(() => {
  const d = phone.value.replace(/\D/g, '')
  return d.length > 10 && d.startsWith('91') ? d.slice(2) : d
})

/** Indian mobile. A landline cannot receive WhatsApp, so it is not accepted. */
const phoneOk = computed(() => /^[6-9]\d{9}$/.test(digits.value))
const ready = computed(() => phoneOk.value && consent.value)

/** Only nag about the number once they have typed enough to be wrong. */
const looksWrong = computed(() => digits.value.length >= 10 && !phoneOk.value)

const low = computed(() => props.stars <= 2)
const headline = computed(() => (low.value ? OFFER.lowHeadline : OFFER.headline))
const body = computed(() => (low.value ? OFFER.lowBody : OFFER.body))

function nice(d: string) {
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : `+91 ${d}`
}

/* Both fields feed one timer: it restarts on every keystroke and on the tick,
 * so the save only fires once they have actually stopped. */
watch([ready, digits], () => {
  clearTimeout(timer)
  reset()
  if (!ready.value || status.value === 'saved') return
  timer = setTimeout(
    () => submit({ phone: digits.value, stars: props.stars, store: props.store }),
    SETTLE_MS,
  )
})

/** Skip cancels a save that has not fired yet. Nothing is kept. */
function cancel() {
  clearTimeout(timer)
  phone.value = ''
  consent.value = false
}

defineExpose({ cancel })

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <!-- Already on the list from a previous visit: no reason to ask twice. -->
  <div v-if="savedPhone" class="offer done-card">
    <span class="gift" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
    <p class="saved-line">
      You are on the list as <strong>{{ nice(savedPhone) }}</strong>. Your 10% off is on its way.
    </p>
  </div>

  <div v-else class="offer">
    <p class="eyebrow">{{ OFFER.eyebrow }}</p>

    <h3 class="headline">
      <span class="gift" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
        </svg>
      </span>
      {{ headline }}
    </h3>

    <p class="body">{{ body }}</p>

    <div class="phone field" :class="{ bad: looksWrong }">
      <span class="cc" aria-hidden="true">+91</span>
      <input
        v-model="phone"
        type="tel"
        inputmode="numeric"
        autocomplete="tel-national"
        maxlength="15"
        placeholder="WhatsApp number"
        aria-label="Your WhatsApp number"
        :aria-invalid="looksWrong"
        aria-describedby="of-help"
      />
    </div>

    <!-- Unticked on purpose. A pre-ticked box is not consent, and this exact
         sentence is what gets written to the sheet beside the number. -->
    <label class="agree">
      <input v-model="consent" type="checkbox" />
      <span>{{ OFFER.consent }}</span>
    </label>

    <p id="of-help" class="status" role="status">
      <span v-if="status === 'saving'" class="working">Saving your number...</span>
      <span v-else-if="status === 'saved'" class="ok">
        Saved. Your 10% off is on its way to {{ nice(digits) }}.
      </span>
      <span v-else-if="status === 'error'" class="warn">
        Could not save that just now. Your review is unaffected, carry on below.
      </span>
      <span v-else-if="looksWrong" class="warn">That is not a 10-digit mobile number.</span>
      <span v-else-if="phoneOk && !consent">Tick the box and it saves itself.</span>
      <span v-else>Optional. Skip it and your review still posts as normal.</span>
    </p>
  </div>
</template>

<style scoped>
.offer {
  width: 100%;
  max-width: 460px;
  margin: 0 auto var(--sp-5);
  padding: var(--sp-5);
  text-align: left;

  border: 1.5px dashed var(--line-2);
  border-radius: 18px;
  /* Dashed and washed rather than a solid card: this is an aside on the way
   * past, and it must not compete with the review cards above it. */
  background: color-mix(in srgb, var(--gold) 8%, transparent);
}

.eyebrow {
  font-size: var(--t-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  color: var(--gold-ink);
}

.headline {
  margin-top: var(--sp-2);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-family: var(--font-display);
  font-size: var(--t-h3);
  line-height: 1.25;
}

.gift {
  flex: none;
  display: grid;
  place-items: center;
  color: var(--gold-ink);
}

.gift svg { width: 20px; height: 20px; }

.body {
  margin-top: var(--sp-2);
  font-size: var(--t-meta);
  color: var(--ink-2);
  line-height: 1.6;
}

/* ---------- Number ---------- */
.field {
  margin-top: var(--sp-4);
  width: 100%;
  background: var(--bg-elev);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

.field:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 14%, transparent);
}

.field.bad { border-color: var(--gold-ink); }

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

.phone input:focus { outline: none; }

.phone input::placeholder { color: var(--ink-3); }

/* ---------- Consent ---------- */
.agree {
  margin-top: var(--sp-3);
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  font-size: var(--t-caption);
  color: var(--ink-2);
  line-height: 1.5;
  cursor: pointer;
}

.agree input {
  flex: none;
  /* 18px box inside a taller row, so the whole label is a 44px tap target. */
  width: 18px;
  height: 18px;
  margin: 2px 0 0;
  accent-color: var(--brand);
  cursor: pointer;
}

.status {
  margin-top: var(--sp-3);
  font-size: var(--t-caption);
  color: var(--ink-3);
  line-height: 1.45;
  min-height: 1.4em;
}

.working { color: var(--ink-2); font-weight: 600; }
.ok { color: var(--gold-ink); font-weight: 600; }
.warn { color: var(--gold-ink); font-weight: 600; }

/* ---------- Already signed up ---------- */
.done-card {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.done-card .gift {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--brand);
  color: var(--on-fill);
}

.done-card .gift svg { width: 15px; height: 15px; }

.saved-line {
  font-size: var(--t-meta);
  color: var(--ink-2);
  line-height: 1.5;
}

.saved-line strong { color: var(--ink); }
</style>
