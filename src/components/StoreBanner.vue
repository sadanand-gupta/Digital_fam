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

    <!--
      Two veils rather than one. The wash mutes the raw map so it reads as
      context instead of the subject; the fade dissolves its lower half into
      the page so the store's name emerges from it rather than sitting under a
      hard edge.
    -->
    <div class="wash" aria-hidden="true" />
    <div class="fade" aria-hidden="true" />
  </div>
</template>

<style scoped>
.banner {
  position: relative;
  /* Tall enough to feel cinematic, short enough to stay context not subject. */
  height: clamp(200px, 32vw, 340px);
  overflow: hidden;
  background: var(--bg);
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

/*
 * Desaturated and lightened: OSM's stock tiles are loud with road colour and
 * label text, which fights the editorial type below.
 */
.map {
  pointer-events: none;
  filter: saturate(0.42) contrast(0.92) brightness(1.06);
}

/* A photo needs far less correction than a map does. */
.banner.photo .map { filter: none; }

.wash {
  position: absolute;
  inset: 0;
  background: rgba(var(--scrim-rgb), 0.12);
}

.banner.photo .wash { background: rgba(var(--scrim-rgb), 0.22); }

/*
 * The page colour rising through the lower half. Stops are weighted low so
 * the top of the map stays legible while the bottom disappears completely.
 */
.fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 38%,
    color-mix(in srgb, var(--bg) 55%, transparent) 72%,
    var(--bg) 100%
  );
}

@media (max-width: 640px) {
  /* Shorter on phones so the name and rating clear the fold. */
  .banner { height: 168px; }
}
</style>
