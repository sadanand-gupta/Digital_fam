<script setup lang="ts">
import type { Store } from '../types'

defineProps<{ store: Store }>()

/** Downloads a poster as a standalone .svg the store can print or post. */
function download(svg: string, name: string) {
  const blob = new Blob([svg.trim()], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <section class="branding" :style="{ '--a': store.accent[0], '--b': store.accent[1] }">
    <header class="head">
      <div>
        <p class="eyebrow">Branding kit</p>
        <h2 class="display title">Posters for {{ store.name }}</h2>
        <p class="sub">
          Ready-made assets matched to this {{ store.category }}. Print them, put them at the
          counter, or share them online to nudge more reviews.
        </p>
      </div>
    </header>

    <div class="grid">
      <figure v-for="(asset, i) in store.branding" :key="asset.id" class="item" :style="{ animationDelay: `${i * 60}ms` }">
        <div class="poster" v-html="asset.poster" />
        <figcaption>
          <h3>{{ asset.title }}</h3>
          <p>{{ asset.caption }}</p>
          <button
            class="btn btn-ghost btn-sm dl"
            type="button"
            @click="download(asset.poster, `${store.slug}-${asset.id}`)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download SVG
          </button>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.branding {
  padding: 40px 0 8px;
}

.head { margin-bottom: 28px; }

.title {
  font-size: clamp(1.5rem, 3.4vw, 2rem);
  margin: 8px 0 10px;
}

.sub {
  color: var(--ink-2);
  max-width: 56ch;
  font-size: 0.95rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(230px, 100%), 1fr));
  gap: 22px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
  animation: rise 0.55s var(--ease) both;
}

.item:hover { transform: translateY(-4px); box-shadow: var(--shadow); }

.poster {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  transition: transform 0.35s var(--ease);
}

.item:hover .poster { transform: scale(1.02); }

.poster :deep(svg) { width: 100%; height: auto; }

figcaption { display: flex; flex-direction: column; gap: 6px; }

figcaption h3 {
  font-size: 0.92rem;
  font-weight: 600;
}

figcaption p {
  font-size: 0.8rem;
  color: var(--ink-3);
  line-height: 1.5;
}

.dl { margin-top: 6px; align-self: flex-start; }
</style>
