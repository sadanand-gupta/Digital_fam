<script setup lang="ts">
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
        <span v-if="direct">Opens the review box — just paste and post.</span>
        <span v-else>Open Maps and paste it in — that's it.</span>
      </div>
      <a v-if="mapsUrl" :href="mapsUrl" target="_blank" rel="noopener noreferrer" class="go">
        {{ direct ? 'Write review' : 'Open Maps' }}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 17L17 7M8 7h9v9" />
        </svg>
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
  gap: 14px;
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
  color: #fff;
  background: var(--ok);
}

.body {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.body strong { font-size: 0.87rem; font-weight: 600; }
.body span { font-size: 0.78rem; color: var(--ink-3); }

.go {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
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
  .toast { bottom: 16px; gap: 10px; padding: 11px 13px; }
  .body span { display: none; }
}
</style>
