<script setup lang="ts">
withDefaults(defineProps<{ rating: number; size?: number }>(), { size: 14 })
</script>

<template>
  <span class="stars" :aria-label="`${rating} out of 5 stars`">
    <svg
      v-for="i in 5"
      :key="i"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      aria-hidden="true"
      :class="{ dim: i > Math.round(rating) }"
    >
      <path
        d="M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.4l7-.9z"
        fill="currentColor"
      />
    </svg>
  </span>
</template>

<style scoped>
.stars {
  display: inline-flex;
  gap: 2px;
  color: var(--gold);
  line-height: 0;
}

.dim { color: var(--line-2); }
</style>
