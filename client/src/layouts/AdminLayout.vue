<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { useAdminNotificationsStore } from '../stores/adminNotifications.store'
import { useGroupChatStore } from '../stores/groupChat.store'
import NotificationBell from '../components/domain/NotificationBell.vue'

const auth = useAuthStore()
const notifications = useAdminNotificationsStore()
const groupChat = useGroupChatStore()
const router = useRouter()
const mobileOpen = ref(false)

const nav = computed(() => [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  },
  {
    to: '/admin/produk',
    label: 'Produk',
    icon: 'M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z',
    dot: true,
  },
  {
    to: '/admin/wilayah',
    label: 'Wilayah Pengiriman',
    icon: 'M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  },
  {
    to: '/admin/tinjau',
    label: 'Review Pesanan',
    icon: 'M9 5h6M4 4h16v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4Zm5 10 2 2 4-4',
    badge: notifications.pendingReviewCount,
  },
  {
    to: '/admin/kampanye',
    label: 'Campaign',
    icon: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9ZM10.3 21a1.94 1.94 0 0 0 3.4 0',
  },
  {
    to: '/admin/pesanan',
    label: 'Semua Pesanan',
    icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  },
  {
    to: '/admin/pengrajin',
    label: 'Pengrajin',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    to: '/admin/komisi',
    label: 'Komisi',
    icon: 'M19 5 5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  },
  {
    to: '/admin/chat-pembeli',
    label: 'Chat Pembeli',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    badge: notifications.unreadBuyerChatCount,
  },
  {
    to: '/admin/komunitas',
    label: 'Chat Komunitas',
    icon: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
    badge: groupChat.unreadCount,
  },
])

onMounted(() => {
  notifications.fetchCount()
  notifications.subscribeToSocket()
  groupChat.subscribeToSocket()
})

function logout() {
  auth.logout()
  router.push('/masuk')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 md:flex">
    <!-- Mobile top bar -->
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
      <span class="font-semibold text-emerald-700">Karangan Bunga · Admin</span>
      <div class="flex items-center gap-1">
        <NotificationBell />
        <button
          class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Buka menu"
          @click="mobileOpen = !mobileOpen"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Mobile off-canvas backdrop -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0"
      :class="{ 'translate-x-0': mobileOpen }"
    >
      <div class="flex items-center gap-2 px-5 py-5">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
          KB
        </span>
        <span class="font-semibold text-slate-900">Karangan Bunga</span>
        <div class="ml-auto hidden md:block">
          <NotificationBell />
        </div>
      </div>

      <nav class="flex-1 space-y-0.5 px-3">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          active-class="!bg-emerald-50 !text-emerald-700"
          @click="mobileOpen = false"
        >
          <svg class="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            <circle v-if="item.dot" cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span class="flex-1">{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>

      <div class="border-t border-slate-100 px-5 py-4">
        <p class="truncate text-sm font-medium text-slate-900">{{ auth.user?.full_name }}</p>
        <p class="truncate text-xs text-slate-500">Superadmin</p>
        <button
          class="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600"
          @click="logout"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Keluar
        </button>
      </div>
    </aside>

    <main class="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div class="max-w-7xl">
        <router-view />
      </div>
    </main>
  </div>
</template>
