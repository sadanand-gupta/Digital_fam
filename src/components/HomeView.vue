<script setup lang="ts">
import { computed, ref } from 'vue'
import { stores } from '../data/stores'
import { CATEGORY_LABELS, type StoreCategory } from '../types'
import StoreCard from './StoreCard.vue'

const emit = defineEmits<{ open: [slug: string] }>()

const query = ref('')
const category = ref<StoreCategory | 'all'>('all')

const categories = computed(() => {
  const present = [...new Set(stores.map(s => s.category))]
  return present.map(c => ({ value: c, label: CATEGORY_LABELS[c] }))
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return stores.filter(s => {
    const matchesCat = category.value === 'all' || s.category === category.value
    if (!matchesCat) return false
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      CATEGORY_LABELS[s.category].toLowerCase().includes(q)
    )
  })
})

const totalReviews = computed(() => stores.reduce((n, s) => n + s.reviews.length, 0))

const steps = [
  {
    n: '01',
    title: 'Pick your store',
    body: 'Find the place you visited. Every listing carries a library of reviews written for that exact business.',
  },
  {
    n: '02',
    title: 'Copy a review',
    body: 'Browse by tone or topic, find one that matches your experience, and tap copy. It lands on your clipboard instantly.',
  },
  {
    n: '03',
    title: 'Paste on Maps',
    body: 'Hit the Maps button, paste, and post. No blank-page hesitation, no wondering what to write.',
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="glow" aria-hidden="true" />
      <div class="container hero-inner">
        <span class="pill rise">
          <span class="dot" aria-hidden="true" />
          {{ totalReviews }} reviews ready across {{ stores.length }} businesses
        </span>

        <h1 class="display headline rise" style="animation-delay: 60ms">
          Never stare at a<br />
          <span class="grad">blank review box</span> again.
        </h1>

        <p class="lede rise" style="animation-delay: 120ms">
          Thoughtfully written reviews for the places you actually visit. Pick one that matches
          your experience, copy it in a tap, and post it on Google Maps in under a minute.
        </p>

        <div class="cta rise" style="animation-delay: 180ms">
          <a href="#stores" class="btn btn-primary">
            Browse stores
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a href="#how" class="btn btn-ghost">See how it works</a>
        </div>

        <dl class="stats rise" style="animation-delay: 240ms">
          <div><dt>{{ totalReviews }}</dt><dd>Prewritten reviews</dd></div>
          <div><dt>{{ stores.length }}</dt><dd>Local businesses</dd></div>
          <div><dt>~20s</dt><dd>To post a review</dd></div>
        </dl>
      </div>
    </section>

    <!-- Stores -->
    <section id="stores" class="section">
      <div class="container">
        <header class="sec-head">
          <div>
            <p class="eyebrow">Directory</p>
            <h2 class="display sec-title">Choose a business</h2>
          </div>

          <div class="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input v-model="query" type="search" placeholder="Search by name, area or type…" aria-label="Search stores" />
          </div>
        </header>

        <div class="filters" role="group" aria-label="Filter by category">
          <button
            class="filter"
            type="button"
            :class="{ on: category === 'all' }"
            @click="category = 'all'"
          >
            All
          </button>
          <button
            v-for="c in categories"
            :key="c.value"
            class="filter"
            type="button"
            :class="{ on: category === c.value }"
            @click="category = c.value"
          >
            {{ c.label }}
          </button>
        </div>

        <div v-if="filtered.length" class="grid">
          <StoreCard
            v-for="(s, i) in filtered"
            :key="s.id"
            :store="s"
            :index="i"
            @open="emit('open', $event)"
          />
        </div>

        <p v-else class="empty">
          No businesses match “{{ query }}”. Try a different search or clear the filter.
        </p>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="section how">
      <div class="container">
        <header class="sec-head center">
          <div>
            <p class="eyebrow">How it works</p>
            <h2 class="display sec-title">Three taps, one honest review</h2>
          </div>
        </header>

        <ol class="steps">
          <li v-for="(s, i) in steps" :key="s.n" class="step" :style="{ animationDelay: `${i * 90}ms` }">
            <span class="num">{{ s.n }}</span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.body }}</p>
          </li>
        </ol>

        <p class="note">
          These are starting points, not scripts — edit any line so it reflects what actually
          happened on your visit.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  position: relative;
  padding: 76px 0 64px;
  overflow: hidden;
}

.glow {
  position: absolute;
  top: -280px;
  left: 50%;
  width: 900px;
  height: 620px;
  transform: translateX(-50%);
  background:
    radial-gradient(closest-side, color-mix(in srgb, var(--brand) 22%, transparent), transparent),
    radial-gradient(closest-side at 70% 60%, color-mix(in srgb, var(--brand-2) 18%, transparent), transparent);
  filter: blur(20px);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 22px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 15px;
  border-radius: 999px;
  font-size: 0.79rem;
  font-weight: 500;
  color: var(--ink-2);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 22%, transparent);
}

.headline {
  font-size: clamp(2.3rem, 6.4vw, 4.1rem);
  max-width: 16ch;
}

.grad {
  background: linear-gradient(115deg, var(--brand), var(--brand-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lede {
  max-width: 60ch;
  font-size: clamp(0.98rem, 1.6vw, 1.1rem);
  color: var(--ink-2);
}

.cta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 11px;
  margin-top: 4px;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px 46px;
  margin-top: 26px;
  padding-top: 26px;
  border-top: 1px solid var(--line);
  width: min(100%, 620px);
}

.stats div { text-align: center; }

.stats dt {
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stats dd {
  font-size: 0.76rem;
  color: var(--ink-3);
  margin-top: 2px;
}

/* Sections */
.section { padding: 56px 0; }

.sec-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.sec-head.center { justify-content: center; text-align: center; margin-bottom: 34px; }

.sec-title {
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  margin-top: 8px;
}

.search {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 260px;
  padding: 10px 16px;
  border-radius: 999px;
  color: var(--ink-3);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.search:focus-within {
  border-color: color-mix(in srgb, var(--brand) 45%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand) 12%, transparent);
}

.search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  font-size: 0.88rem;
  color: var(--ink);
}

.search input::placeholder { color: var(--ink-3); }
.search input::-webkit-search-cancel-button { cursor: pointer; }

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 26px;
}

.filter {
  padding: 7px 15px;
  border-radius: 999px;
  font-size: 0.81rem;
  font-weight: 500;
  color: var(--ink-2);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  transition: all 0.2s var(--ease);
}

.filter:hover { border-color: var(--line-2); color: var(--ink); }

.filter.on {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  box-shadow: 0 3px 12px color-mix(in srgb, var(--brand) 30%, transparent);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(272px, 100%), 1fr));
  gap: 20px;
}

.empty {
  padding: 48px 0;
  text-align: center;
  color: var(--ink-3);
}

/* How */
.how {
  background: var(--bg-sunken);
  border-block: 1px solid var(--line);
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 20px;
  list-style: none;
  padding: 0;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 26px 24px;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  animation: rise 0.6s var(--ease) both;
}

.num {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.step h3 { font-size: 1.02rem; font-weight: 600; }

.step p {
  font-size: 0.87rem;
  color: var(--ink-2);
  line-height: 1.6;
}

.note {
  margin-top: 26px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--ink-3);
  max-width: 62ch;
  margin-inline: auto;
}

@media (max-width: 640px) {
  .hero { padding: 48px 0 44px; }

  .sec-head { flex-direction: column; align-items: stretch; }

  /* Full-width search instead of a cramped inline field. */
  .search { min-width: 0; width: 100%; }

  /* Comfortable touch targets for the category chips. */
  .filter { padding: 9px 15px; font-size: 0.83rem; }

  .stats { gap: 14px 28px; }
  .cta .btn { flex: 1 1 auto; justify-content: center; }
  .step { padding: 22px 20px; }
}
</style>
