<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Store } from '../types'

const props = defineProps<{ store: Store }>()

/** Set when the supplied image fails to load, so we fall back gracefully. */
const imageBroken = ref(false)

const showPhoto = computed(() => !!props.store.bannerImage && !imageBroken.value)

/**
 * OpenStreetMap embed centred on the shop. Used when there is no storefront
 * photo — Google's Static Maps API needs a billed key, and Maps photos sit
 * behind signed URLs that cannot be hotlinked.
 */
const mapEmbed = computed(() => {
  const c = props.store.coords
  if (!c) return null
  const d = 0.0035
  const bbox = [c.lng - d, c.lat - d / 2, c.lng + d, c.lat + d / 2].join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${c.lat}%2C${c.lng}`
})
</script>

<template>
  <div class="banner" :class="{ photo: showPhoto, plain: !showPhoto && !mapEmbed }">
    <img
      v-if="showPhoto"
      class="shot"
      :src="store.bannerImage"
      :alt="store.bannerAlt || `${store.name} storefront`"
      loading="eager"
      decoding="async"
      @error="imageBroken = true"
    />

    <iframe
      v-else-if="mapEmbed"
      class="map"
      :src="mapEmbed"
      :title="`Map showing ${store.name}`"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    />

    <!-- Keeps the header legible over whatever sits behind it. -->
    <div class="scrim" aria-hidden="true" />

    <!--
      Wave that dissolves the banner into the page. Two layers drifting at
      different speeds give depth without motion loud enough to distract.
    -->
    <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path class="w1" d="M-80,64 C200,110 460,20 720,52 C980,84 1240,116 1520,72 L1520,120 L-80,120 Z" />
      <path class="w2" d="M-80,86 C220,52 500,108 780,80 C1060,52 1260,92 1520,66 L1520,120 L-80,120 Z" />
    </svg>
  </div>
</template>

<style scoped>
.banner {
  position: relative;
  height: clamp(180px, 30vw, 320px);
  overflow: hidden;
  background: var(--a);
}

.shot,
.map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.shot { object-fit: cover; }

/* The embed is decorative here; the address and Maps link do the real work. */
.map { pointer-events: none; filter: saturate(0.9); }

.wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  width: 100%;
  height: clamp(48px, 7vw, 82px);
  pointer-events: none;
}

.wave path { fill: var(--bg); }

/* The back wave sits softer so the two layers read as depth, not one shape. */
.wave .w2 { opacity: 0.55; }

.wave .w1 { animation: drift 14s ease-in-out infinite alternate; }
.wave .w2 { animation: drift 19s ease-in-out infinite alternate-reverse; }

/* translateX only — cheap to composite and never triggers layout. */
@keyframes drift {
  from { transform: translateX(-2.5%); }
  to { transform: translateX(2.5%); }
}

@media (prefers-reduced-motion: reduce) {
  .wave .w1, .wave .w2 { animation: none; }
}

.scrim {
  position: absolute;
  inset: 0;
  background: rgba(var(--scrim-rgb), 0.28);
}

/* Without a photo or coords, the store's flat accent carries the banner. */
.banner.plain .scrim {
  background: rgba(var(--scrim-rgb), 0.12);
}

@media (max-width: 640px) {
  .banner { height: 150px; }
}
</style>
