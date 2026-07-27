<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { useCampaignsStore } from '../stores/campaigns.store'
import { useGroupChatStore } from '../stores/groupChat.store'
import NotificationBell from '../components/domain/NotificationBell.vue'

const auth = useAuthStore()
const campaignsStore = useCampaignsStore()
const groupChat = useGroupChatStore()
const router = useRouter()
const menuOpen = ref(false)

const nav = computed(() => [
  { to: '/pengrajin/dashboard', label: 'Dashboard' },
  { to: '/pengrajin/kampanye', label: 'Campaign Terbuka', badge: campaignsStore.items.length },
  { to: '/pengrajin/pesanan', label: 'Pesanan Saya' },
  { to: '/pengrajin/etalase', label: 'Etalase' },
  { to: '/pengrajin/komunitas', label: 'Chat Komunitas', badge: groupChat.unreadCount },
])

onMounted(() => {
  campaignsStore.fetchOpen()
  campaignsStore.subscribeToSocket()
  groupChat.subscribeToSocket()
})

function logout() {
  auth.logout()
  router.push('/masuk')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span class="truncate font-semibold text-emerald-700">
          <span class="sm:hidden">Karangan Bunga</span>
          <span class="hidden sm:inline">Karangan Bunga · Pengrajin</span>
        </span>
        <div class="flex items-center gap-2 text-sm">
          <NotificationBell />
          <span class="hidden text-slate-600 sm:inline">{{ auth.user?.full_name }}</span>
          <button class="text-slate-500 hover:text-slate-800" @click="logout">Keluar</button>
          <button
            class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Buka menu"
            @click="menuOpen = !menuOpen"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <nav class="mx-auto hidden max-w-6xl gap-2 px-4 pb-2 text-sm md:flex">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
          active-class="bg-emerald-50 text-emerald-700 font-medium"
        >
          {{ item.label }}
          <span
            v-if="item.badge"
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>
      <nav v-if="menuOpen" class="flex flex-col gap-1 border-t border-slate-100 px-4 py-2 text-sm md:hidden">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-1.5 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100"
          active-class="bg-emerald-50 text-emerald-700 font-medium"
          @click="menuOpen = false"
        >
          {{ item.label }}
          <span
            v-if="item.badge"
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <router-view />
    </main>
  </div>
</template>
