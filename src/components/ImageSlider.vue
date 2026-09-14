<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const slides = [
  { src: '/images/growup1.png', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growup2.png', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growup3.png', alt: 'Chickato Crispy Fried Chicken' },
  { src: '/images/growup4.png', alt: 'Chickato Crispy Fried Chicken' },
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
function prev() { goTo((current.value - 1 + slides.length) % slides.length) }

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
  max-width: 800px;
  margin: 0 auto var(--sp-5);
  overflow: visible;
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  background: radial-gradient(circle, rgba(201, 168, 104, 0.12) 0%, transparent 60%);
  pointer-events: none;
  z-index: -1;
}

.viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: visible;
  perspective: 1200px;
  transform-style: preserve-3d;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  /* Entering state: pushed back and slightly rotated */
  transform: translateZ(-150px) rotateY(15deg) scale(0.95);
  transition: opacity 0.9s cubic-bezier(0.25, 1, 0.5, 1),
              transform 0.9s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 1;
  transform-style: preserve-3d;
}

.slide.active {
  opacity: 1;
  transform: translateZ(0) rotateY(0) scale(1);
  z-index: 2;
}

@keyframes float-3d {
  0% {
    transform: translateY(0) rotateX(2deg) rotateY(-2deg);
    filter: drop-shadow(0 20px 25px rgba(0, 0, 0, 0.6)) drop-shadow(0 10px 10px rgba(0, 0, 0, 0.4)) brightness(1);
  }
  50% {
    transform: translateY(-16px) rotateX(-2deg) rotateY(2deg);
    filter: drop-shadow(0 35px 35px rgba(0, 0, 0, 0.3)) drop-shadow(0 15px 15px rgba(0, 0, 0, 0.2)) brightness(1.08);
  }
  100% {
    transform: translateY(0) rotateX(2deg) rotateY(-2deg);
    filter: drop-shadow(0 20px 25px rgba(0, 0, 0, 0.6)) drop-shadow(0 10px 10px rgba(0, 0, 0, 0.4)) brightness(1);
  }
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: center center;
  animation: float-3d 8s ease-in-out infinite;
  /* Ensure images in inactive slides still animate but are ready for transition */
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
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(201, 168, 104, 0.3);
  color: #fff;
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 0.2s var(--ease), background 0.2s var(--ease), transform 0.2s var(--ease);
  z-index: 20;
}

.arrow svg { width: 22px; height: 22px; }

.viewport:hover .arrow { opacity: 1; }

.arrow:hover {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--on-fill);
}

.arrow:active { transform: translateY(-50%) scale(0.93); }

.left { left: 12px; }
.right { right: 12px; }

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
  .viewport { border-radius: 14px; aspect-ratio: 1/1; }
  .arrow { width: 36px; height: 36px; }
  .arrow svg { width: 18px; height: 18px; }
  .left { left: 8px; }
  .right { right: 8px; }
}

@media (prefers-reduced-motion: reduce) {
  .slide img { animation: none; transform: none; filter: none; }
  .progress-fill { animation: none; width: 100%; }
}
</style>
