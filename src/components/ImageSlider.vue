<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const slides = [
  { src: '/images/growub (1).webp', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growub (2).avif', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growub (5).avif', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growub (1).avif', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growub (1).jpg', alt: 'Chickato Crispy Fried Chicken' },
]

const current = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function startAuto() {
  clearInterval(timer)
  timer = setInterval(() => {
    if (!paused.value) next()
  }, 4000)
}

function goTo(i: number) {
  current.value = i
  startAuto()
}

function next() { goTo((current.value + 1) % slides.length) }
function prev() { goTo((current.value - 1 + slides.length) % slides.length) }

// Calculate shortest path offset for smooth looping
function getOffset(i: number) {
  const n = slides.length
  let diff = i - current.value
  
  if (diff < -Math.floor(n / 2)) diff += n
  if (diff > Math.floor(n / 2)) diff -= n
  
  return diff
}

function getStyle(i: number) {
  const offset = getOffset(i)
  const absOffset = Math.abs(offset)
  
  // 3D Orbit transformations
  const translateX = offset * 50 // Move left/right by 50% of card width
  const translateZ = absOffset * -160 // Push side cards back in 3D space
  const rotateY = offset * -35 // Rotate side cards inward
  const scale = 1 - (absOffset * 0.05) // Slightly scale down the far back items
  const opacity = absOffset > 2 ? 0 : 1 // Show up to 5 items (offset -2 to +2)
  const zIndex = 10 - absOffset
  
  return {
    transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
    zIndex,
    opacity,
  }
}

onMounted(startAuto)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div
    class="slider"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <!-- 3D Viewport -->
    <div class="viewport">
      <div class="orbit">
        <div
          v-for="(s, i) in slides"
          :key="i"
          class="slide"
          :style="getStyle(i)"
          @click="goTo(i)"
        >
          <img :src="s.src" :alt="s.alt" loading="lazy" decoding="async" />
        </div>
      </div>

      <!-- Prev / Next arrows -->
      <button class="arrow left" type="button" aria-label="Previous image" @click.stop="prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button class="arrow right" type="button" aria-label="Next image" @click.stop="next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <!-- Dot indicators -->
    <div class="dots" role="tablist" aria-label="Image slider">
      <button
        v-for="(s, i) in slides"
        :key="i"
        class="dot"
        :class="{ on: i === current }"
        type="button"
        role="tab"
        :aria-selected="i === current"
        :aria-label="`Image ${i + 1} of ${slides.length}`"
        @click="goTo(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.slider {
  width: 100%;
  max-width: 800px; /* Slightly wider to accommodate 3D side cards */
  margin: 0 auto var(--sp-5);
  overflow: visible; /* Let the side cards bleed out nicely */
}

.viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Perspective gives the 3D depth effect */
  perspective: 1200px;
}

.orbit {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}

.slide {
  position: absolute;
  /* The card is smaller than the viewport so side cards fit within the container */
  width: 55%;
  height: 85%;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-lg), 0 20px 40px rgba(0,0,0,0.4);
  /* Smoothly transition all 3D transforms */
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), 
              opacity 0.6s var(--ease), 
              z-index 0.6s step-end;
  cursor: pointer;
  background: var(--bg-elev);
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Dim side cards slightly for focus on the center */
.slide::after {
  content: '';
  position: absolute;
  inset: 0;
  background: black;
  opacity: 0;
  transition: opacity 0.6s var(--ease);
  pointer-events: none;
}

.slide[style*="translateZ(-150px)"]::after,
.slide[style*="translateZ(-300px)"]::after {
  opacity: 0.4;
}

/* ---------- Arrows ---------- */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 0.2s var(--ease), background 0.2s var(--ease), transform 0.2s var(--ease);
  z-index: 20;
}

.arrow svg { width: 22px; height: 22px; }

.viewport:hover .arrow { opacity: 1; }

.arrow:hover {
  background: var(--c-orange);
  border-color: var(--c-orange);
}

.arrow:active { transform: translateY(-50%) scale(0.93); }

/* Moved arrows outside slightly so they don't cover the central card too much */
.left { left: 0px; }
.right { right: 0px; }

/* ---------- Dots ---------- */
.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: var(--sp-4);
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0;
  transition: background 0.25s var(--ease), transform 0.25s var(--ease), width 0.25s var(--ease);
  cursor: pointer;
}

.dot.on {
  background: var(--c-orange);
  width: 26px;
  box-shadow: 0 0 8px rgba(255, 106, 0, 0.45);
}

.dot:hover:not(.on) { background: var(--teal); }

@media (max-width: 640px) {
  .slider { max-width: 100%; overflow: hidden; }
  .viewport { border-radius: 14px; aspect-ratio: 1/1; perspective: 800px; }
  .slide { width: 65%; height: 80%; }
  .arrow { width: 36px; height: 36px; }
  .arrow svg { width: 18px; height: 18px; }
  .left { left: 5px; }
  .right { right: 5px; }
}

@media (prefers-reduced-motion: reduce) {
  .slide { transition-duration: 0.01ms; }
}
</style>
