<script setup lang="ts">
import GoogleMapsIcon from './GoogleMapsIcon.vue'
defineProps<{ show: boolean; mapsUrl?: string; direct?: boolean }>()
</script>

<template>
  <Transition name="toast">
    <div v-if="show" class="toast" role="status" aria-live="polite">
      <span class="icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <div class="body">
        <strong>Review copied</strong>
        <span v-if="direct">Opens the Google Maps review box — just paste and post.</span>
        <span v-else>Open Maps and paste it in — that's it.</span>
      </div>
      <a v-if="mapsUrl" :href="mapsUrl" target="_blank" rel="noopener noreferrer" class="go">
        <GoogleMapsIcon :size="15" />
        {{ direct ? 'Write review' : 'Open listing' }}
      </a>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  z-index: 90;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  max-width: calc(100vw - 32px);
  padding: 13px 16px;
  border-radius: 16px;
  background: var(--bg-elev);
  border: 1px solid var(--line-2);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
}

.icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--on-fill);
  background: var(--ok);
}

.body {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.body strong { font-size: var(--t-meta); font-weight: 600; }
.body span { font-size: var(--t-caption); color: var(--ink-3); }

.go {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: var(--t-caption);
  font-weight: 600;
  color: var(--on-fill);
  background: var(--brand);
  transition: transform 0.18s var(--ease);
}

.go:hover { transform: translateY(-1px); }

.toast-enter-active { transition: all 0.4s var(--ease); }
.toast-leave-active { transition: all 0.25s ease-in; }

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(18px) scale(0.96);
}

@media (max-width: 560px) {
  .toast { bottom: 16px; gap: var(--sp-3); padding: 11px 13px; }
  .body span { display: none; }
}
</style>
