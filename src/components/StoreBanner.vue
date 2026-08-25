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
  </div>
</template>

<style scoped>
.banner {
  position: relative;
  height: clamp(180px, 30vw, 320px);
  overflow: hidden;
  background: linear-gradient(120deg, var(--a), var(--b));
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

.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--a) 30%, transparent),
    transparent 45%,
    var(--bg) 100%
  );
}

/* Without a photo or coords, lean on the store's own gradient. */
.banner.plain .scrim {
  background: linear-gradient(to bottom, transparent, var(--bg) 100%);
}

@media (max-width: 640px) {
  .banner { height: 150px; }
}
</style>
