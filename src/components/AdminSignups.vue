<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminSession, type Signup } from '../composables/useAdminSession'
import StarRating from './StarRating.vue'

const emit = defineEmits<{ close: [] }>()

const { signups, loadSignups } = useAdminSession()

const loading = ref(true)
const error = ref('')
const query = ref('')
const copied = ref('')

async function refresh() {
  loading.value = true
  error.value = ''
  try {
    await loadSignups()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'READ_FAILED'
    error.value =
      msg === 'READ_FAILED_403'
        ? 'Firestore refused the read. Publish firestore.rules, then try again.'
        : 'Could not load the list just now.'
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

const rows = computed(() => {
  const q = query.value.replace(/\D/g, '')
  return q ? signups.value.filter(s => s.phone.includes(q)) : signups.value
})

/** Signups since midnight — the number the shop actually watches. */
const today = computed(() => {
  const start = new Date().setHours(0, 0, 0, 0)
  return signups.value.filter(s => new Date(s.at).getTime() >= start).length
})

function pretty(d: string) {
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : d
}

/** Always the same shape, so the template never has to test for a bad date. */
function when(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '—', time: '' }
  return {
    date: d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}

async function copy(s: Signup) {
  try {
    await navigator.clipboard.writeText(`+91${s.phone}`)
    copied.value = s.phone
    setTimeout(() => (copied.value = ''), 1600)
  } catch {
    /* Clipboard blocked — the number is on screen to read anyway. */
  }
}
</script>

<template>
  <div class="sheet">
    <header class="bar">
      <div class="container inner">
        <div class="who">
          <p class="eyebrow">Digital Fam · Admin</p>
          <h1 class="title">WhatsApp signups</h1>
        </div>

        <div class="tools">
          <button class="icon" type="button" aria-label="Refresh" @click="refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 11-2.6-6.4M21 3v6h-6" />
            </svg>
          </button>
          <button class="icon" type="button" aria-label="Close" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="container body">
      <!-- Two numbers the shop actually cares about. -->
      <div class="stats">
        <div class="stat">
          <span class="n">{{ signups.length }}</span>
          <span class="k">Total opted in</span>
        </div>
        <div class="stat">
          <span class="n">{{ today }}</span>
          <span class="k">Today</span>
        </div>
      </div>

      <div class="search field">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          v-model="query"
          type="search"
          inputmode="numeric"
          placeholder="Search a number"
          aria-label="Search signups by number"
        />
      </div>

      <p v-if="loading" class="state">
        <span class="spinner" aria-hidden="true" />
        Loading the list...
      </p>

      <p v-else-if="error" class="state bad" role="alert">{{ error }}</p>

      <p v-else-if="!signups.length" class="state">
        No signups yet. The first customer to leave a number appears here.
      </p>

      <p v-else-if="!rows.length" class="state">Nothing matches that number.</p>

      <template v-else>
        <!-- Header row is desktop-only: on a phone each card carries its own
             labels, because a four-column table at 360px is unreadable. -->
        <div class="head" aria-hidden="true">
          <span>WhatsApp number</span>
          <span>Rated</span>
          <span>Date &amp; time</span>
          <span />
        </div>

        <ul class="rows">
          <li v-for="s in rows" :key="s.phone" class="row">
            <span class="num">{{ pretty(s.phone) }}</span>

            <span class="rated">
              <StarRating :rating="s.stars" :size="12" />
              <span class="rv">{{ s.stars }}</span>
            </span>

            <span class="stamp">
              <span class="d">{{ when(s.at).date }}</span>
              <span class="t">{{ when(s.at).time }}</span>
            </span>

            <button class="copy" type="button" @click="copy(s)">
              {{ copied === s.phone ? 'Copied' : 'Copy' }}
            </button>
          </li>
        </ul>

        <p class="foot">
          Showing {{ rows.length }} of {{ signups.length }}. Every number here agreed to be
          contacted, and the wording they agreed to is stored beside it.
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sheet {
  position: fixed;
  inset: 0;
  z-index: 70;
  overflow-y: auto;
  background: var(--bg);
  background-image: var(--bg-gradient);
}

/* ---------- Bar ---------- */
.bar {
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid var(--line);
  background: var(--surface-glass);
  backdrop-filter: blur(10px);
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding-block: var(--sp-4);
}

.eyebrow {
  font-size: var(--t-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  color: var(--gold-ink);
}

.title {
  font-family: var(--font-display);
  font-size: var(--t-h3);
  line-height: 1.2;
}

.tools { display: flex; gap: var(--sp-2); }

.icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--ink-2);
  transition: background 0.18s var(--ease), color 0.18s var(--ease),
              border-color 0.18s var(--ease);
}

.icon:hover { background: var(--bg-elev); color: var(--ink); border-color: var(--line-2); }
.icon svg { width: 16px; height: 16px; }

.body { padding-block: var(--sp-5) var(--sp-8); }

/* ---------- Stats ---------- */
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}

.stat {
  padding: var(--sp-4) var(--sp-5);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.n {
  display: block;
  font-family: var(--font-display);
  font-size: 1.9rem;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.k {
  display: block;
  margin-top: var(--sp-1);
  font-size: var(--t-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--ink-3);
}

/* ---------- Search ---------- */
.field {
  margin-top: var(--sp-4);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 0 var(--sp-4);
  background: var(--bg-elev);
  border: 1.5px solid var(--line);
  border-radius: 999px;
  color: var(--ink-3);
  transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

.field:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 14%, transparent);
}

.field svg { flex: none; width: 16px; height: 16px; }

.field input {
  flex: 1;
  min-width: 0;
  padding: 11px 0;
  border: none;
  background: none;
  font-size: var(--t-body);
  color: var(--ink);
}

.field input:focus { outline: none; }
.field input::placeholder { color: var(--ink-3); }

/* ---------- States ---------- */
.state {
  margin-top: var(--sp-6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  text-align: center;
  font-size: var(--t-meta);
  color: var(--ink-3);
}

.state.bad { color: var(--gold-ink); font-weight: 600; }

.spinner {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--ink) 14%, transparent);
  border-top-color: var(--brand);
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- Table ---------- */
.head {
  display: none;
  margin-top: var(--sp-5);
  padding: 0 var(--sp-5) var(--sp-2);
  font-size: var(--t-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--ink-3);
}

.rows {
  margin-top: var(--sp-3);
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--sp-2);
}

.row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--sp-2) var(--sp-4);
  align-items: center;

  padding: var(--sp-4) var(--sp-5);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: border-color 0.18s var(--ease);
}

.row:hover { border-color: var(--line-2); }

.num {
  font-size: var(--t-body);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.rated {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  grid-column: 1;
}

.rv { font-size: var(--t-caption); color: var(--ink-3); }

.stamp {
  grid-column: 2;
  grid-row: 2;
  display: flex;
  align-items: baseline;
  gap: var(--sp-2);
  font-size: var(--t-caption);
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}

.stamp .d { color: var(--ink-2); font-weight: 500; }

.copy {
  grid-column: 2;
  grid-row: 1;
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid var(--line-2);
  font-size: var(--t-caption);
  font-weight: 600;
  color: var(--ink-2);
  transition: background 0.18s var(--ease), color 0.18s var(--ease);
}

.copy:hover { background: var(--brand); border-color: var(--brand); color: var(--on-fill); }

.foot {
  margin-top: var(--sp-5);
  font-size: var(--t-caption);
  color: var(--ink-3);
  line-height: 1.55;
}

/* One row per line once there is width for four real columns. */
@media (min-width: 720px) {
  .head {
    display: grid;
    grid-template-columns: 1.2fr 0.9fr 1.1fr auto;
    gap: var(--sp-4);
  }

  .row {
    grid-template-columns: 1.2fr 0.9fr 1.1fr auto;
    gap: var(--sp-4);
  }

  .rated, .stamp, .copy { grid-column: auto; grid-row: auto; }
  .stamp { justify-content: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .spinner { animation-duration: 1.6s; }
}
</style>
