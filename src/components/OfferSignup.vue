<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useOfferSignup } from '../composables/useOfferSignup'
import GoogleMapsIcon from './GoogleMapsIcon.vue'

const props = defineProps<{
  stars: number
  store: string
  targetUrl?: string
}>()

const emit = defineEmits<{
  skip: []
  add: []
}>()

const { status, savedPhone, submit, reset, clear } = useOfferSignup()

const SETTLE_MS = 2000

const phone = ref('')
const consent = ref(true)
const touched = ref(false)
const validationError = ref<string | null>(null)

let timer: ReturnType<typeof setTimeout> | undefined

/** Short store name (e.g. "Chickato") to keep text concise. */
const shortStore = computed(() => {
  return props.store ? props.store.split(' ')[0] : 'Chickato'
})

/** Drops spaces and non-digits, strictly capping at 10 digits. */
const digits = computed(() => phone.value.replace(/\D/g, '').slice(0, 10))

/** Indian mobile validation: exactly 10 digits starting with 6-9. */
const phoneOk = computed(() => /^[6-9]\d{9}$/.test(digits.value))
const ready = computed(() => phoneOk.value && consent.value)

function onPhoneInput(e: Event) {
  const target = e.target as HTMLInputElement
  const cleaned = target.value.replace(/\D/g, '').slice(0, 10)
  phone.value = cleaned
  target.value = cleaned
  touched.value = false
  validationError.value = null
}

const low = computed(() => props.stars <= 2)

const formattedHeadline = computed(() => {
  if (low.value) {
    return 'Let us make<br/><span class="highlight-green">the next one right</span>'
  }
  return 'Get <span class="highlight-green">10% OFF</span><br/>on your next visit'
})

function nice(d: string) {
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : `+91 ${d}`
}

/* Saves automatically once phone and consent are valid and settled */
watch([ready, digits], () => {
  clearTimeout(timer)
  reset()
  if (!ready.value || status.value === 'saved') return
  timer = setTimeout(
    () => submit({ phone: digits.value, stars: props.stars, store: props.store }),
    SETTLE_MS,
  )
})

function handleSubmit(e: MouseEvent) {
  touched.value = true
  validationError.value = null

  if (!digits.value) {
    validationError.value = 'Please enter your 10-digit WhatsApp number.'
    e.preventDefault()
    return
  }

  if (!phoneOk.value) {
    validationError.value = 'Please enter a valid 10-digit mobile number starting with 6-9.'
    e.preventDefault()
    return
  }

  if (!consent.value) {
    validationError.value = 'You must agree to receive offers on WhatsApp to submit.'
    e.preventDefault()
    return
  }

  // Valid! Trigger save and emit add event
  submit({ phone: digits.value, stars: props.stars, store: props.store })
  emit('add')
}

function retry() {
  if (!ready.value) return
  reset()
  submit({ phone: digits.value, stars: props.stars, store: props.store })
}

function useAnother() {
  clear()
  phone.value = ''
  consent.value = true
  touched.value = false
  validationError.value = null
}

function cancel() {
  clearTimeout(timer)
  phone.value = ''
  consent.value = true
  touched.value = false
  validationError.value = null
  reset()
}

defineExpose({ cancel })

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <!-- Sleek Professional Saved State Card -->
  <div v-if="savedPhone" class="offer-card done-card">
    <div class="saved-badge">
      <span class="saved-dot"></span>
      10% OFF RESERVED
    </div>

    <div class="saved-info-row">
      <div class="saved-details">
        <h3 class="saved-title">You're on the list!</h3>
        <p class="saved-number">Saved for <strong>{{ nice(savedPhone) }}</strong></p>
      </div>
      <button class="btn-change-num" type="button" @click="useAnother">
        Change number
      </button>
    </div>

    <!-- Actions Row side by side -->
    <div v-if="targetUrl" class="actions-row">
      <a
        class="btn-skip"
        :href="targetUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="$emit('skip')"
      >
        Skip
      </a>
      <a
        class="btn-submit"
        :href="targetUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="$emit('add')"
      >
        <GoogleMapsIcon :size="18" />
        Add review
      </a>
    </div>
  </div>

  <!-- Clean White Offer Card with Add Review Button -->
  <div v-else class="offer-card">
    <!-- Header with title on left and WhatsApp Icon on right -->
    <div class="card-header">
      <h2 class="card-title" v-html="formattedHeadline"></h2>
      
      <!-- WhatsApp Icon Graphic -->
      <div class="whatsapp-graphic">
        <svg class="wa-rays" width="30" height="26" viewBox="0 0 30 26" fill="none">
          <line x1="4" y1="22" x2="1" y2="25" stroke="#00a859" stroke-width="3.5" stroke-linecap="round" />
          <line x1="15" y1="12" x2="18" y2="3" stroke="#00a859" stroke-width="3.5" stroke-linecap="round" />
          <line x1="22" y1="18" x2="28" y2="13" stroke="#00a859" stroke-width="3.5" stroke-linecap="round" />
        </svg>
        <div class="wa-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" fill="#ffffff"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.974-1.393A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.072-1.115l-.292-.173-2.956.828.84-2.875-.19-.303A7.957 7.957 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" fill="#00a859"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Phone Number Input with Validation -->
    <div class="form-group">
      <label class="input-label" for="of-phone">Your WhatsApp number <span class="req">*</span></label>
      <div class="phone-input-wrap" :class="{ bad: touched && !phoneOk }">
        <div class="country-badge">
          <span class="cc">IN +91</span>
          <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
        <div class="input-divider"></div>
        <input
          id="of-phone"
          :value="phone"
          type="tel"
          inputmode="numeric"
          autocomplete="tel-national"
          maxlength="10"
          placeholder="98765 43210"
          :aria-invalid="touched && !phoneOk"
          class="phone-input"
          @input="onPhoneInput"
        />
      </div>
      
      <!-- Phone Validation Messages -->
      <p v-if="touched && !digits" class="field-error" role="alert">
        Please enter your 10-digit WhatsApp number.
      </p>
      <p v-else-if="touched && !phoneOk" class="field-error" role="alert">
        Please enter a valid 10-digit mobile number starting with 6-9.
      </p>
    </div>

    <!-- Compulsory Checkbox Consent -->
    <label class="checkbox-wrap" :class="{ bad: touched && !consent }">
      <input
        v-model="consent"
        type="checkbox"
        class="custom-checkbox"
        @change="validationError = null"
      />
      <span class="checkbox-label">
        I agree to receive offers from {{ shortStore }} on WhatsApp. <span class="req">*</span>
      </span>
    </label>
    <p v-if="touched && !consent" class="field-error" role="alert">
      You must agree to receive offers on WhatsApp to submit.
    </p>

    <!-- General Error / Retry text -->
    <p v-if="status === 'error'" class="field-error" role="status">
      Could not save that just now. <button class="again" type="button" @click="retry">Try again</button>
    </p>

    <!-- Actions Row (Skip & Add Review side by side) -->
    <div v-if="targetUrl" class="actions-row">
      <a
        class="btn-skip"
        :href="targetUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="$emit('skip')"
      >
        Skip
      </a>
      <a
        class="btn-submit"
        :href="targetUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="handleSubmit"
      >
        <GoogleMapsIcon :size="18" />
        Add review
      </a>
    </div>
  </div>
</template>

<style scoped>
/* Glass Card Merged with Website Theme */
.offer-card {
  width: 100%;
  max-width: 450px;
  margin: 0 auto 20px;
  padding: 28px 24px 22px;
  text-align: left;

  background: var(--bg-elev, rgba(255, 255, 255, 0.03));
  border: 1.5px solid var(--line, rgba(255, 255, 255, 0.14));
  border-radius: 22px;
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--ink, #ffffff);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.card-title {
  font-family: 'Plus Jakarta Sans', var(--font-display), system-ui, -apple-system, sans-serif;
  font-size: clamp(1.6rem, 3.8vw, 1.9rem);
  font-weight: 800;
  color: var(--ink, #ffffff);
  line-height: 1.15;
  letter-spacing: -0.025em;
}

:deep(.highlight-green) {
  color: #25d366;
}

/* WhatsApp Icon Graphic */
.whatsapp-graphic {
  position: relative;
  flex: none;
  margin-top: 2px;
}

.wa-circle {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #00a859;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px rgba(0, 168, 89, 0.35);
}

.wa-rays {
  position: absolute;
  top: -10px;
  right: -10px;
  pointer-events: none;
}

/* Form Controls */
.form-group {
  margin-top: 16px;
}

.input-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ink, #ffffff);
  margin-bottom: 8px;
}

.req {
  color: #ef4444;
  font-weight: 800;
}

.phone-input-wrap {
  display: flex;
  align-items: center;
  background: var(--bg-sunken, rgba(0, 0, 0, 0.35));
  border: 1.5px solid var(--line, rgba(255, 255, 255, 0.16));
  border-radius: 14px;
  padding: 4px 12px;
  transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.phone-input-wrap:focus-within {
  border-color: #25d366;
  box-shadow: 0 0 0 3.5px rgba(37, 211, 102, 0.2);
}

.phone-input-wrap.bad {
  border-color: #ef4444;
  box-shadow: 0 0 0 3.5px rgba(239, 68, 68, 0.25);
}

.country-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  color: var(--ink, #ffffff);
  font-size: 0.98rem;
  user-select: none;
}

.cc {
  color: var(--ink, #ffffff);
  font-weight: 800;
}

.chevron {
  color: var(--ink-3, #94a3b8);
}

.input-divider {
  width: 1.5px;
  height: 24px;
  background: var(--line, rgba(255, 255, 255, 0.14));
  margin: 0 10px;
}

.phone-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  padding: 10px 0;
  color: var(--ink, #ffffff);
  font-size: 1.05rem;
  font-weight: 600;
  outline: none;
  letter-spacing: 0.04em;
}

.phone-input::placeholder {
  color: var(--ink-3, #707070);
}

/* Checkbox */
.checkbox-wrap {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--ink-2, #cbd5e1);
  font-weight: 500;
  line-height: 1.45;
  cursor: pointer;
  transition: color 0.2s;
}

.checkbox-wrap.bad {
  color: #ef4444;
}

.custom-checkbox {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  accent-color: #25d366;
  cursor: pointer;
}

/* Error Messages */
.field-error {
  margin-top: 6px;
  font-size: 0.82rem;
  color: #ef4444;
  font-weight: 600;
}

.again {
  font-weight: 600;
  color: #25d366;
  text-decoration: underline;
}

/* Actions Row (Skip & Add Review side by side) */
.actions-row {
  margin-top: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-skip {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1.5px solid var(--line, rgba(255, 255, 255, 0.2));
  background: var(--bg-sunken, rgba(255, 255, 255, 0.05));
  color: var(--ink-2, #cbd5e1);
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s var(--ease);
}

.btn-skip:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--ink, #ffffff);
  transform: translateY(-1px);
}

.btn-submit {
  flex: 2;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  background: #00a859;
  color: #ffffff;
  font-size: 1.02rem;
  font-weight: 800;
  box-shadow: 0 6px 20px rgba(0, 168, 89, 0.35);
  transition: all 0.2s var(--ease);
  white-space: nowrap;
}

.btn-submit:hover {
  background: #00b05b;
  box-shadow: 0 8px 24px rgba(0, 168, 89, 0.45);
  transform: translateY(-1px);
}

/* Saved state card */
.done-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saved-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(37, 211, 102, 0.12);
  border: 1px solid rgba(37, 211, 102, 0.3);
  color: #25d366;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  width: fit-content;
}

.saved-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #25d366;
  box-shadow: 0 0 6px #25d366;
}

.saved-info-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.saved-title {
  font-family: 'Plus Jakarta Sans', var(--font-display), sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--ink, #ffffff);
  line-height: 1.2;
}

.saved-number {
  margin-top: 4px;
  font-size: 0.9rem;
  color: var(--ink-2, #cbd5e1);
}

.saved-number strong {
  color: var(--ink, #ffffff);
  font-weight: 700;
}

.btn-change-num {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-3, #94a3b8);
  text-decoration: underline;
  text-underline-offset: 3px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s;
}

.btn-change-num:hover {
  color: #25d366;
}
</style>
