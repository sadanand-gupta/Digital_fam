<script setup lang="ts">
/**
 * Map pin, so the destination reads as a map without spelling it out.
 *
 * Was a 22.68 KB PNG — for an icon rendered at 18px. Inline SVG instead:
 * a few hundred bytes, sharp at any density, tinted by the button it sits in,
 * and no third-party asset licence to attribute.
 *
 * Decorative on purpose: every button this appears in already names the
 * action in text, so a second announcement would only add noise.
 */
withDefaults(defineProps<{ size?: number }>(), { size: 18 })
</script>

<template>
  <svg
    class="gm"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
</template>

<style scoped>
/* Held square so a flex parent cannot stretch it. */
.gm { flex: none; }
</style>
