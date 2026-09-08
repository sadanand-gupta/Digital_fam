<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ modelValue: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [stars: number] }>()

/**
 * A rising ladder. The old chips ('Great / Good / Pretty good / It was okay')
 * asked people to tell two near-synonyms apart; a star row does not need
 * reading at all, and it mirrors what Google itself asks first.
 */
const LABELS = ['Bad', 'Poor', 'Okay', 'Good', 'Great']

/** Preview fill while a pointer is over a star; null when not hovering. */
const hovered = ref<number | null>(null)

/** How many stars read as filled. Hover previews over the real selection. */
const lit = computed(() => hovered.value ?? props.modelValue ?? 0)

const caption = computed(() => {
  const n = hovered.value ?? props.modelValue
  return n ? LABELS[n - 1] : 'Tap to rate'
})

const buttons = ref<HTMLButtonElement[]>([])

/** Arrow keys move through the row, as a radio group is expected to. */
function onKey(e: KeyboardEvent, n: number) {
  const delta =
    e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 :
    e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
  if (!delta) return
  e.preventDefault()
  const next = Math.min(5, Math.max(1, n + delta))
  emit('update:modelValue', next)
  buttons.value[next - 1]?.focus()
}
</script>

<template>
  <div class="picker">
    <div
      class="row"
      role="radiogroup"
      aria-label="How was your visit?"
      @mouseleave="hovered = null"
    >
      <button
        v-for="n in 5"
        :key="n"
        :ref="el => { if (el) buttons[n - 1] = el as HTMLButtonElement }"
        class="star"
        :class="{ lit: n <= lit, picked: n === modelValue }"
        type="button"
        role="radio"
        :aria-checked="n === modelValue"
        :aria-label="`${n} star${n > 1 ? 's' : ''} — ${LABELS[n - 1]}`"
        :tabindex="modelValue === null ? (n === 1 ? 0 : -1) : n === modelValue ? 0 : -1"
        @click="emit('update:modelValue', n)"
        @mouseenter="hovered = n"
        @keydown="onKey($event, n)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.4l7-.9z"
            stroke-width="1.1"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <p class="caption" :class="{ chosen: modelValue !== null && hovered === null }" aria-live="polite">
      {{ caption }}
    </p>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
}

.row {
  display: flex;
  /*
   * No gap. The stars butt together so the row reads as one control, and each
   * button's own padding still gives a 48px touch target.
   */
  gap: 0;
}

.star {
  display: grid;
  place-items: center;
  /* 48px minimum touch target, per WCAG 2.5.5. */
  padding: var(--sp-2);
  border-radius: var(--radius-sm, 10px);
  transition: transform 0.16s var(--ease);
  -webkit-tap-highlight-color: transparent;
}

.star svg {
  width: clamp(38px, 11vw, 52px);
  height: clamp(38px, 11vw, 52px);
}

.star path {
  fill: var(--star-empty);
  stroke: var(--star-empty-edge);
  transition: fill 0.18s var(--ease), stroke 0.18s var(--ease);
}

.star.lit path {
  fill: var(--star);
  stroke: var(--star-edge);
}

/* A small lift on the star actually chosen, so the selection survives a glance. */
.star.picked { transform: scale(1.12); }

.star:active { transform: scale(0.94); }

.star:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}

.caption {
  font-size: var(--t-meta);
  color: var(--ink-3);
  letter-spacing: 0.02em;
  min-height: 1.4em;
}

/* Once picked, the label stops being a hint and becomes the answer. */
.caption.chosen {
  color: var(--ink);
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .star, .star.picked, .star:active { transform: none; }
}
</style>
