<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { SUPER_ADMIN } from '../data/admin'
import { useAdminSession } from '../composables/useAdminSession'
import AdminSignups from './AdminSignups.vue'

type Stage = 'form' | 'checking' | 'denied'

/** Long enough to read as "it checked", short enough not to feel broken. */
const CHECK_MS = 800

const open = ref(false)
const listOpen = ref(false)
const stage = ref<Stage>('form')
const username = ref('')
const password = ref('')
const reveal = ref(false)

const user = ref<HTMLInputElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

const { signedIn, signIn, signOut: endSession } = useAdminSession()

/**
 * Signing in lands on the list, not on a confirmation.
 *
 * There is nothing to decide at that point — the admin pressed Admin because
 * they wanted the signups — so a "welcome back" screen charges a tap for
 * information they already have. A session still open goes straight through.
 */
function enter() {
  if (signedIn.value) listOpen.value = true
  else open.value = true
}

/**
 * Checks the typed credentials against data/admin.ts.
 *
 * There is nothing to wait for — the comparison is instant — but a result that
 * lands on the same frame as the click reads as a form that ignored you, so
 * the spinner is held for a beat on purpose.
 */
function submit() {
  if (!username.value.trim() || !password.value) return

  stage.value = 'checking'
  clearTimeout(timer)

  timer = setTimeout(() => {
    try {
      signIn(username.value, password.value)
      password.value = ''
      stage.value = 'form'
      open.value = false
      listOpen.value = true
    } catch {
      stage.value = 'denied'
    }
  }, CHECK_MS)
}

function retry() {
  stage.value = 'form'
  password.value = ''
  reveal.value = false
  nextTick(() => user.value?.focus())
}

function signOut() {
  endSession()
  listOpen.value = false
  stage.value = 'form'
  username.value = ''
  password.value = ''
}

function close() {
  open.value = false
  if (stage.value !== 'form') retry()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && !listOpen.value) close()
}

/* Whichever layer is up, the page behind must not scroll, or it drifts under
 * a thumb on a phone. */
watch([open, listOpen], ([m, l]) => {
  document.body.style.overflow = m || l ? 'hidden' : ''
})

watch(open, isOpen => {
  if (isOpen) {
    window.addEventListener('keydown', onKey)
    if (stage.value === 'form') nextTick(() => user.value?.focus())
  } else {
    window.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <button class="trigger" type="button" @click="enter">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
    <span class="word">Admin</span>
  </button>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="backdrop" @click.self="close">
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ag-title"
        >
          <button class="x" type="button" aria-label="Close" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <!-- Checking -->
          <template v-if="stage === 'checking'">
            <span class="spinner" aria-hidden="true" />
            <h2 id="ag-title" class="title">Checking your details</h2>
            <p class="sub" role="status">One moment.</p>
          </template>

          <!-- Rejected -->
          <template v-else-if="stage === 'denied'">
            <span class="seal deny-seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8v5M12 16.5v.5" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <h2 id="ag-title" class="title">That did not match</h2>
            <p class="sub" role="alert">
              Please contact the super admin to get your access sorted.
            </p>

            <a
              class="btn btn-primary wide"
              :href="`https://wa.me/91${SUPER_ADMIN.whatsapp}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {{ SUPER_ADMIN.label }}
            </a>
            <button class="link" type="button" @click="retry">Try again</button>
          </template>

          <!-- The form -->
          <template v-else>
            <span class="seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
            </span>
            <h2 id="ag-title" class="title">Admin sign in</h2>
            <p class="sub">For the shop team. Customers do not need this.</p>

            <form class="form" @submit.prevent="submit">
              <label class="label" for="ag-user">Username</label>
              <div class="field">
                <input
                  id="ag-user"
                  ref="user"
                  v-model="username"
                  type="text"
                  autocomplete="username"
                  autocapitalize="none"
                  spellcheck="false"
                  placeholder="Enter username"
                />
              </div>

              <label class="label" for="ag-pass">Password</label>
              <div class="field pass">
                <input
                  id="ag-pass"
                  v-model="password"
                  :type="reveal ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter password"
                />
                <button
                  class="peek"
                  type="button"
                  :aria-label="reveal ? 'Hide password' : 'Show password'"
                  @click="reveal = !reveal"
                >
                  {{ reveal ? 'Hide' : 'Show' }}
                </button>
              </div>

              <button
                class="btn btn-primary wide submit"
                type="submit"
                :disabled="!username.trim() || !password"
              >
                Submit
              </button>
            </form>
          </template>
        </div>
      </div>
    </Transition>

    <AdminSignups v-if="listOpen" @close="listOpen = false" @signout="signOut" />
  </Teleport>
</template>

<style scoped>
/* ---------- Trigger ---------- */
/* Sized to the theme toggle it stands beside — same height, same border,
 * same resting colour, so the two read as one pair of controls. */
.trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-2);
  font-size: var(--t-caption);
  font-weight: 600;
  transition: color 0.18s var(--ease), border-color 0.18s var(--ease),
              background 0.18s var(--ease);
}

.trigger:hover {
  color: var(--ink);
  border-color: var(--line-2);
  background: var(--bg-sunken);
}

/* On a narrow phone the word is what pushes the header out of line, and the
 * padlock alone still says what it is. */
@media (max-width: 420px) {
  .trigger { width: 36px; padding: 0; justify-content: center; }
  .trigger .word { display: none; }
}

.trigger svg { width: 14px; height: 14px; }

/* ---------- Shell ---------- */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: var(--sp-5);
  background: color-mix(in srgb, var(--c-navy) 55%, transparent);
  backdrop-filter: blur(3px);
}

.modal {
  position: relative;
  width: 100%;
  max-width: 380px;
  padding: var(--sp-6) var(--sp-5) var(--sp-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--sp-2);

  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
}

.x {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  color: var(--ink-3);
  transition: background 0.18s var(--ease), color 0.18s var(--ease);
}

.x:hover { background: var(--bg-sunken); color: var(--ink); }
.x svg { width: 15px; height: 15px; }

/* ---------- Heading block ---------- */
.seal {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: var(--bg-sunken);
  border: 1px solid var(--line);
  color: var(--gold-ink);
  margin-bottom: var(--sp-2);
}

.seal svg { width: 21px; height: 21px; }


.deny-seal { color: var(--gold-ink); }

.title {
  font-family: var(--font-display);
  font-size: var(--t-h3);
  line-height: 1.25;
}

.sub {
  font-size: var(--t-caption);
  color: var(--ink-3);
  line-height: 1.55;
  max-width: 30ch;
}

.sub strong { color: var(--ink); }

/* ---------- Form ---------- */
.form {
  width: 100%;
  margin-top: var(--sp-4);
  text-align: left;
}

.label {
  display: block;
  font-size: var(--t-caption);
  font-weight: 600;
  margin-bottom: var(--sp-2);
}

.label + .field { margin-bottom: var(--sp-4); }

.field {
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: var(--bg-sunken);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

.field:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 14%, transparent);
}

.field input {
  flex: 1;
  min-width: 0;
  padding: 12px var(--sp-4);
  border: none;
  background: none;
  font-size: var(--t-body);
}

.field input:focus { outline: none; }
.field input::placeholder { color: var(--ink-3); }

.peek {
  padding: 0 var(--sp-4);
  font-size: var(--t-caption);
  font-weight: 600;
  color: var(--ink-3);
  border-left: 1.5px solid var(--line);
}

.peek:hover { color: var(--ink); }

.submit { margin-top: var(--sp-2); }

.wide { width: 100%; margin-top: var(--sp-4); }

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.link {
  margin-top: var(--sp-3);
  font-size: var(--t-caption);
  font-weight: 600;
  color: var(--ink-3);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.link:hover { color: var(--ink); }


/* ---------- Spinner ---------- */
.spinner {
  width: 40px;
  height: 40px;
  margin-bottom: var(--sp-2);
  border-radius: 999px;
  border: 3px solid color-mix(in srgb, var(--ink) 12%, transparent);
  border-top-color: var(--brand);
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- Entrance ---------- */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s var(--ease); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.fade-enter-active .modal { transition: transform 0.24s var(--ease); }
.fade-enter-from .modal { transform: translateY(10px) scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .spinner { animation-duration: 1.6s; }
  .fade-enter-active .modal, .fade-enter-from .modal { transition: none; transform: none; }
}
</style>
