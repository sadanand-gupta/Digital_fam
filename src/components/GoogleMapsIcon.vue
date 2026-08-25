<script setup lang="ts">
import iconUrl from '../assets/google-maps.png'

/**
 * Google Maps pin, so the destination is recognisable at a glance without
 * spelling out "Google Maps" in the label.
 *
 * Imported rather than referenced by path so Vite fingerprints and inlines it
 * — the icon ships with the bundle instead of costing a separate request.
 */
withDefaults(defineProps<{ size?: number }>(), { size: 18 })
</script>

<template>
  <img
    :src="iconUrl"
    :width="size"
    :height="size"
    class="gm"
    alt="Google Maps"
    decoding="async"
    draggable="false"
  />
</template>

<style scoped>
/*
 * Sized by the width/height attributes; these keep it from being stretched by
 * a flex parent and hold the square aspect on every button it sits in.
 */
.gm {
  flex: none;
  object-fit: contain;
  user-select: none;
}
</style>
