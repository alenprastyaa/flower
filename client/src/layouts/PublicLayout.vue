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

const footerExploreLinks = [
  { to: '/#etalase', label: 'Etalase Bunga' },
  { to: '/toko', label: 'Pengrajin Kami' },
  { to: '/campaigns', label: 'Campaign Terbuka' },
  { to: '/#cara-kerja', label: 'Cara Kerja' },
]

const year = new Date().getFullYear()
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

    <!-- Footer -->
    <footer class="relative mt-16 overflow-hidden rounded-t-[2.5rem] bg-gradient-to-b from-emerald-800 to-emerald-950 text-emerald-50 sm:mt-20">
      <!-- decorative flower silhouette, purely ornamental -->
      <svg
        class="pointer-events-none absolute -right-10 -top-16 h-64 w-64 text-emerald-700/40 sm:h-80 sm:w-80"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <g fill="currentColor">
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" />
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(72 12 12)" />
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(144 12 12)" />
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(216 12 12)" />
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(288 12 12)" />
        </g>
      </svg>
      <svg
        class="pointer-events-none absolute -bottom-10 -left-8 h-40 w-40 text-emerald-700/30 sm:h-52 sm:w-52"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <g fill="currentColor">
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" />
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(72 12 12)" />
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(144 12 12)" />
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(216 12 12)" />
          <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(288 12 12)" />
        </g>
      </svg>

      <div class="relative mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div class="sm:col-span-2 lg:col-span-2">
            <div class="flex items-center gap-2.5">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <svg class="h-5 w-5 text-emerald-100" viewBox="0 0 24 24" aria-hidden="true">
                  <g fill="currentColor">
                    <ellipse cx="12" cy="6.5" rx="3.4" ry="5" />
                    <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(72 12 12)" />
                    <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(144 12 12)" />
                    <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(216 12 12)" />
                    <ellipse cx="12" cy="6.5" rx="3.4" ry="5" transform="rotate(288 12 12)" />
                  </g>
                  <circle cx="12" cy="12" r="2.3" fill="#fbbf24" />
                </svg>
              </span>
              <span class="text-xl font-semibold tracking-tight text-white">Karangan Bunga</span>
            </div>
            <p class="mt-4 max-w-sm text-sm italic leading-relaxed text-emerald-200/90">
              "Setiap rangkaian punya cerita — kami rangkaikan Anda dengan pengrajin bunga terbaik di sekitar."
            </p>
            <p class="mt-3 max-w-sm text-sm leading-relaxed text-emerald-100/70">
              Wadah resmi komunitas pengrajin karangan bunga. Pesan mudah, harga transparan, dikerjakan oleh
              tangan-tangan terpercaya.
            </p>
          </div>

          <div>
            <h3 class="text-xs font-semibold uppercase tracking-widest text-emerald-300">Jelajahi</h3>
            <ul class="mt-4 space-y-2.5 text-sm">
              <li v-for="l in footerExploreLinks" :key="l.to">
                <router-link :to="l.to" class="text-emerald-100/80 transition-colors hover:text-white">
                  {{ l.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-xs font-semibold uppercase tracking-widest text-emerald-300">Bantuan</h3>
            <ul class="mt-4 space-y-2.5 text-sm text-emerald-100/80">
              <li>
                <router-link to="/daftar-pengrajin" class="transition-colors hover:text-white">
                  Jadi Pengrajin
                </router-link>
              </li>
              <li>Punya pertanyaan? Klik ikon chat di pojok kanan bawah.</li>
            </ul>
          </div>
        </div>

        <div class="mt-12 flex flex-col items-center gap-2 border-t border-emerald-700/50 pt-6 text-center text-xs text-emerald-300/70 sm:flex-row sm:justify-between">
          <p>&copy; {{ year }} Karangan Bunga. Dibuat dengan 🌸 untuk pecinta bunga.</p>
          <p>Setiap pengrajin di sini telah ditinjau &amp; disetujui admin.</p>
        </div>
      </div>
    </footer>

    <ContactWidget v-if="!auth.isAuthenticated" />
  </div>
</template>
