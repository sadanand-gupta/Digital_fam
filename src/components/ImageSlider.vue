<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const slides = [
  { src: '/images/growup1.webp', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growup2.webp', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growup3.webp', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growup4.webp', alt: 'Chickato Crispy Fried Chicken' },
]

const current = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const SLIDE_DURATION = 2000

function startAuto() {
  clearInterval(timer)
  timer = setInterval(() => {
    if (!paused.value) next()
  }, SLIDE_DURATION)
}

// Watch paused state to pause/resume the timer
watch(paused, (isPaused) => {
  if (isPaused) {
    clearInterval(timer)
  } else {
    startAuto()
  }
})

function goTo(i: number) {
  current.value = i
  startAuto()
}

function next() { goTo((current.value + 1) % slides.length) }

onMounted(startAuto)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div
    class="slider"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @touchstart="paused = true"
    @touchend="paused = false"
  >
    <div class="glow" aria-hidden="true"></div>
    
    <div class="viewport">
      <div
        v-for="(s, i) in slides"
        :key="i"
        class="slide"
        :class="{ active: i === current }"
      >
        <img :src="s.src" :alt="s.alt" loading="lazy" decoding="async" />
      </div>
    </div>

    <!-- Gold Progress Line -->
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :key="current" 
        :style="{ animationPlayState: paused ? 'paused' : 'running' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.slider {
  position: relative;
  width: 100%;
  max-width: 440px;
  margin: 0 auto var(--sp-4);
  overflow: hidden;
  border-radius: 16px;
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(201, 168, 104, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

.viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 14px;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1),
              transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 1;
}

.slide.active {
  opacity: 1;
  transform: scale(1);
  z-index: 2;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

/* ---------- Progress Line ---------- */
.progress-bar {
  position: absolute;
  bottom: -16px;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

@keyframes progress-fill-anim {
  from { width: 0%; }
  to { width: 100%; }
}

.progress-fill {
  height: 100%;
  background: var(--c-gold);
  width: 0%;
  animation: progress-fill-anim 2s linear forwards;
}

@media (max-width: 640px) {
  .slider { max-width: 340px; }
  .viewport { border-radius: 12px; aspect-ratio: 16 / 10; }
}

@media (prefers-reduced-motion: reduce) {
  .slide img { animation: none; transform: none; filter: none; }
  .progress-fill { animation: none; width: 100%; }
}
</style>
