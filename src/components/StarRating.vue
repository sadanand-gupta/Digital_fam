<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{ rating: number; size?: number }>(),
  { size: 14 },
)

/** Unique per instance — duplicate SVG ids break every gradient after the first. */
const uid = useId()

/**
 * Fill fraction for each of the five stars: 1 full, 0 empty, or a fraction so
 * a 4.3 shows four full stars and a 30%-filled fifth rather than rounding up
 * to something the business did not earn.
 */
const fills = computed(() =>
  Array.from({ length: 5 }, (_, i) => Math.min(1, Math.max(0, props.rating - i))),
)
</script>

<template>
  <span class="stars" role="img" :aria-label="`Rated ${rating} out of 5 stars`">
    <svg
      v-for="(fill, i) in fills"
      :key="i"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <defs v-if="fill > 0 && fill < 1">
        <linearGradient :id="`h-${uid}-${i}`" x1="0" x2="1" y1="0" y2="0">
          <stop :offset="fill" stop-color="var(--star)" />
          <stop :offset="fill" stop-color="var(--star-empty)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.4l7-.9z"
        :fill="fill === 1 ? 'var(--star)' : fill === 0 ? 'var(--star-empty)' : `url(#h-${uid}-${i})`"
        :stroke="fill > 0 ? 'var(--star-edge)' : 'var(--star-empty-edge)'"
        stroke-width="1.1"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</template>

<style scoped>
.stars {
  display: inline-flex;
  gap: 1px;
  line-height: 0;
}
</style>
