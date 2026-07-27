<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import ContactWidget from '../components/domain/ContactWidget.vue'

const auth = useAuthStore()
const menuOpen = ref(false)

const links = [
  { to: '/#etalase', label: 'Pilih Bunga' },
  { to: '/toko', label: 'Pengrajin' },
  { to: '/campaigns', label: 'Campaign' },
  { to: '/daftar-pengrajin', label: 'Jadi Pengrajin' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <router-link to="/" class="text-lg font-semibold text-emerald-700" @click="menuOpen = false">
          Karangan Bunga
        </router-link>

        <nav class="hidden items-center gap-5 text-sm text-slate-600 md:flex">
          <router-link v-for="l in links" :key="l.to" :to="l.to" class="hover:text-emerald-700">
            {{ l.label }}
          </router-link>
          <router-link
            v-if="!auth.isAuthenticated"
            to="/masuk"
            class="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            Masuk
          </router-link>
          <router-link
            v-else
            :to="auth.role === 'superadmin' ? '/admin/dashboard' : '/pengrajin/dashboard'"
            class="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            Dashboard
          </router-link>
        </nav>

        <div class="flex items-center gap-2 md:hidden">
          <router-link
            v-if="!auth.isAuthenticated"
            to="/masuk"
            class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            Masuk
          </router-link>
          <router-link
            v-else
            :to="auth.role === 'superadmin' ? '/admin/dashboard' : '/pengrajin/dashboard'"
            class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            Dashboard
          </router-link>
          <button
            class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Buka menu"
            @click="menuOpen = !menuOpen"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <nav v-if="menuOpen" class="flex flex-col gap-1 border-t border-slate-100 px-4 py-2 text-sm md:hidden">
        <router-link
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100"
          @click="menuOpen = false"
        >
          {{ l.label }}
        </router-link>
      </nav>
    </header>
    <main class="flex-1">
      <router-view />
    </main>

    <ContactWidget v-if="!auth.isAuthenticated" />
  </div>
</template>
