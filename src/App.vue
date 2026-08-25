<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { stores, storeBySlug } from './data/stores'
import type { Review } from './types'
import { useClipboard } from './composables/useClipboard'
import { useRoute } from './composables/useRoute'
import { useUsedReviews } from './composables/useUsedReviews'
import { useAdmin } from './composables/useAdmin'
import { usePublicStore } from './composables/usePublicStore'
import { bestReviewTarget } from './data/mapsLinks'
import SiteHeader from './components/SiteHeader.vue'
import HomeView from './components/HomeView.vue'
import StoreView from './components/StoreView.vue'
import CopyToast from './components/CopyToast.vue'
import AdminLogin from './components/AdminLogin.vue'

const { path, navigate } = useRoute()
const { copy, copiedId } = useClipboard()
const { markUsed } = useUsedReviews()
const { isAdmin, signOut } = useAdmin()

/** The single listing the public sees at '/'; admins get the directory there. */
const { publicStore, publicSlug, setPublicStore } = usePublicStore()

/** Transient confirmation after an admin changes the live store. */
const notice = ref('')
let noticeTimer: ReturnType<typeof setTimeout> | undefined

/** Picking a store from the directory makes it the site's public listing. */
function handleSelectPublic(slug: string) {
  setPublicStore(slug)
  notice.value = `${publicStore.value.name} is now the live public site.`
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 4000)
}

const activeStore = computed(() => {
  const m = path.value.match(/^store\/(.+)$/)
  if (!m) return undefined
  const store = storeBySlug(m[1])
  if (!store) return undefined
  // Visitors may only open the public listing, so guessing another slug in the
  // URL does not expose the rest of the directory.
  return isAdmin.value || store.slug === publicSlug.value ? store : undefined
})

const onAdminRoute = computed(() => path.value === 'admin')

/** The directory only ever renders for a signed-in admin. */
const showDirectory = computed(() => isAdmin.value && !onAdminRoute.value)

function handleSignOut() {
  signOut()
  navigate('')
}

const toast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | undefined

/** Delay before a copied card is retired, so its "Copied" tick is seen first. */
const RETIRE_DELAY = 700
let retireTimer: ReturnType<typeof setTimeout> | undefined

async function handleCopy(review: Review) {
  const ok = await copy(review.text, review.id)
  if (!ok) return

  toast.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = false }, 4200)

  // Retire it only once the text is actually on the clipboard, so a failed
  // copy never silently burns a review. The pause lets the confirmation land.
  clearTimeout(retireTimer)
  retireTimer = setTimeout(() => markUsed(review.id), RETIRE_DELAY)
}

onUnmounted(() => {
  clearTimeout(toastTimer)
  clearTimeout(retireTimer)
  clearTimeout(noticeTimer)
})

/** Hide a lingering toast when the user changes page. */
watch(path, () => {
  toast.value = false
  clearTimeout(toastTimer)
})

/** Where the toast's action button should point for the current store. */
const reviewTarget = computed(() => {
  const store = activeStore.value ?? (showDirectory.value ? null : publicStore.value)
  return store ? bestReviewTarget(store) : null
})

const year = new Date().getFullYear()
</script>

<template>
  <SiteHeader
    :is-admin="isAdmin"
    :show-nav="showDirectory"
    @home="navigate('')"
    @sign-out="handleSignOut"
  />

  <p v-if="notice" class="notice" role="status">{{ notice }}</p>

  <main>
    <StoreView
      v-if="activeStore"
      :key="activeStore.slug"
      :store="activeStore"
      :copied-id="copiedId"
      @copy="handleCopy"
      @back="navigate('')"
    />

    <div v-else-if="path.startsWith('store/')" class="missing container">
      <h1 class="display">Store not found</h1>
      <p>That listing doesn't exist. Head back and pick one from the directory.</p>
      <button class="btn btn-primary" type="button" @click="navigate('')">Browse stores</button>
    </div>

    <AdminLogin
      v-else-if="onAdminRoute && !isAdmin"
      @success="navigate('')"
      @back="navigate('')"
    />

    <!-- Admins land on the full directory; visitors on the single listing. -->
    <HomeView
      v-else-if="showDirectory"
      :public-slug="publicSlug"
      @open="navigate(`store/${$event}`)"
      @select-public="handleSelectPublic"
    />

    <StoreView
      v-else
      :key="publicStore.slug"
      :store="publicStore"
      :copied-id="copiedId"
      :single="true"
      @copy="handleCopy"
    />
  </main>

  <footer class="footer">
    <div class="container inner">
      <p class="mark">Digital<em>Fam</em></p>
      <p class="fine">
        <template v-if="showDirectory">{{ stores.length }} businesses · </template>Reviews are
        templates meant to be edited to match your real experience.
      </p>
      <p class="fine">
        © {{ year }} Digital Fam
        <button v-if="!isAdmin" class="admin-link" type="button" @click="navigate('admin')">
          Admin
        </button>
      </p>
    </div>
  </footer>

  <CopyToast
    :show="toast"
    :maps-url="reviewTarget?.url"
    :direct="reviewTarget?.direct"
  />
</template>

<style scoped>
.notice {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 80;
  transform: translateX(-50%);
  max-width: min(92vw, 460px);
  padding: 12px 20px;
  border-radius: 999px;
  font-size: var(--t-meta);
  font-weight: 500;
  text-align: center;
  color: var(--ink);
  background: var(--bg-elev);
  border: 1px solid color-mix(in srgb, var(--ok) 40%, transparent);
  box-shadow: var(--shadow-lg);
  animation: rise 0.4s var(--ease) both;
}

.missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  padding: 110px 0;
  text-align: center;
}

.missing h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); }
.missing p { color: var(--ink-2); max-width: 44ch; }

.footer {
  padding: 40px 0;
  border-top: 1px solid var(--line);
  background: var(--bg-sunken);
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
}

.mark {
  font-family: var(--font-display);
  font-size: var(--t-lead);
  font-weight: 700;
}

.mark em { font-style: normal; font-weight: 500; color: var(--ink-3); }

.fine {
  font-size: var(--t-caption);
  color: var(--ink-3);
  max-width: 52ch;
}

/* Deliberately quiet — a way in for the owner, not a call to action. */
.admin-link {
  margin-left: 10px;
  font-size: inherit;
  color: var(--ink-3);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-2);
  transition: color 0.2s var(--ease);
}

.admin-link:hover { color: var(--ink); }
</style>
