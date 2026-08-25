<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useAdmin } from '../composables/useAdmin'

const emit = defineEmits<{ success: []; back: [] }>()

const { signIn } = useAdmin()

const email = ref('')
const password = ref('')
const show = ref(false)
const error = ref('')
const shake = ref(false)

function submit() {
  error.value = ''

  if (!email.value.trim() || !password.value) {
    return fail('Enter both your email and password.')
  }

  if (signIn(email.value, password.value)) {
    emit('success')
    return
  }

  fail('Those credentials do not match. Check and try again.')
  password.value = ''
}

function fail(message: string) {
  error.value = message
  // Restart the animation even on a repeated failure.
  shake.value = false
  nextTick(() => { shake.value = true })
}
</script>

<template>
  <section class="wrap">
    <div class="container inner">
      <form class="card" :class="{ shake }" @submit.prevent="submit" @animationend="shake = false">
        <span class="lock" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
            <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
          </svg>
        </span>

        <div class="head">
          <p class="eyebrow">Restricted</p>
          <h1 class="display title">Admin sign in</h1>
          <p class="sub">Sign in to view every business in one place. Visitors see only their own listing.</p>
        </div>

        <label class="field">
          <span class="lbl">Email</span>
          <input
            v-model="email"
            type="email"
            autocomplete="username"
            inputmode="email"
            placeholder="you@example.com"
            :aria-invalid="!!error"
          />
        </label>

        <label class="field">
          <span class="lbl">Password</span>
          <span class="pw">
            <input
              v-model="password"
              :type="show ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••••"
              :aria-invalid="!!error"
            />
            <button
              class="peek"
              type="button"
              :aria-label="show ? 'Hide password' : 'Show password'"
              @click="show = !show"
            >
              <svg v-if="show" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M9.4 5.7A9.6 9.6 0 0 1 12 5.5c6.2 0 10 6.5 10 6.5a17.6 17.6 0 0 1-3.4 4.2M6.2 6.7A17.4 17.4 0 0 0 2 12s3.8 6.5 10 6.5a9.9 9.9 0 0 0 3.3-.55" />
              </svg>
            </button>
          </span>
        </label>

        <p v-if="error" class="err" role="alert">{{ error }}</p>

        <button class="btn btn-primary full" type="submit">Sign in</button>

        <button class="back" type="button" @click="emit('back')">Back to the site</button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.wrap { padding: 60px 0 90px; }

.inner {
  display: flex;
  justify-content: center;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  width: min(100%, 420px);
  padding: 34px 30px 28px;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  animation: rise 0.6s var(--ease) both;
}

.card.shake { animation: shake 0.42s var(--ease); }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-7px); }
  45% { transform: translateX(6px); }
  70% { transform: translateX(-4px); }
}

.lock {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius);
  color: var(--on-fill);
  background: var(--brand);
  box-shadow: var(--shadow-sm);
}

.head { display: flex; flex-direction: column; gap: var(--sp-2); }

.title { font-size: 1.5rem; }

.sub {
  font-size: var(--t-meta);
  color: var(--ink-2);
  line-height: 1.55;
}

.field { display: flex; flex-direction: column; gap: var(--sp-2); }

.lbl {
  font-size: var(--t-caption);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.field input {
  width: 100%;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  font-size: var(--t-body);
  font-family: inherit;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--line);
  outline: none;
  transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.field input::placeholder { color: var(--ink-3); }

.field input:focus {
  border-color: color-mix(in srgb, var(--brand) 45%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 12%, transparent);
}

.pw { position: relative; display: block; }

/* Room for the reveal button so long passwords never sit under it. */
.pw input { padding-right: 44px; }

.peek {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--ink-3);
  transition: color 0.2s var(--ease), background 0.2s var(--ease);
}

.peek:hover { color: var(--ink); background: var(--bg-sunken); }

.err {
  font-size: var(--t-meta);
  color: var(--danger);
  line-height: 1.5;
}



.full { width: 100%; justify-content: center; margin-top: var(--sp-1); }

.back {
  align-self: center;
  padding: 6px 10px;
  font-size: var(--t-meta);
  color: var(--ink-3);
  transition: color 0.2s var(--ease);
}

.back:hover { color: var(--ink); }

@media (max-width: 480px) {
  .card { padding: 28px 22px 24px; }
}
</style>
