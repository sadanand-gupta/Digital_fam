<script setup lang="ts">
/**
 * Ambient colour orbs drifting behind the page.
 *
 * Three heavily-blurred ellipses on long, mismatched loops so the motion never
 * visibly repeats. Fixed to the viewport and pointer-events:none, so it sits
 * under everything and intercepts nothing.
 *
 * Performance: transform/opacity only — both composite on the GPU and never
 * trigger layout or paint. `will-change` promotes each orb to its own layer so
 * the blur is rasterised once instead of every frame.
 */
</script>

<template>
  <div class="backdrop" aria-hidden="true">
    <span class="orb o1" />
    <span class="orb o2" />
    <span class="orb o3" />
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  opacity: var(--orb-alpha);
  /* Large blur is what turns a circle into ambient light. */
  filter: blur(90px);
  will-change: transform;
}

.o1 {
  width: 46vw;
  height: 46vw;
  min-width: 340px;
  min-height: 340px;
  top: -12vw;
  left: -8vw;
  background: var(--orb-1);
  animation: drift-1 34s ease-in-out infinite alternate;
}

.o2 {
  width: 38vw;
  height: 38vw;
  min-width: 280px;
  min-height: 280px;
  top: 32vh;
  right: -10vw;
  background: var(--orb-2);
  animation: drift-2 43s ease-in-out infinite alternate;
}

.o3 {
  width: 42vw;
  height: 42vw;
  min-width: 300px;
  min-height: 300px;
  bottom: -14vw;
  left: 28vw;
  background: var(--orb-3);
  animation: drift-3 52s ease-in-out infinite alternate;
}

/* Mismatched durations and paths so the three never fall into lockstep. */
@keyframes drift-1 {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(7vw, 9vh, 0) scale(1.14); }
}

@keyframes drift-2 {
  from { transform: translate3d(0, 0, 0) scale(1.08); }
  to { transform: translate3d(-9vw, -7vh, 0) scale(0.94); }
}

@keyframes drift-3 {
  from { transform: translate3d(0, 0, 0) scale(0.96); }
  to { transform: translate3d(5vw, -10vh, 0) scale(1.12); }
}

@media (prefers-reduced-motion: reduce) {
  .orb { animation: none; }
}

@media (max-width: 640px) {
  /* Cheaper blur on phones, where fill-rate is the bottleneck. */
  .orb { filter: blur(64px); }
}
</style>
