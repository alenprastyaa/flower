<script setup>
import { ref, onMounted, watch } from 'vue'
import { listPublicCraftsmen } from '../../api/craftsmen.api'
import BaseCard from '../../components/ui/BaseCard.vue'

const craftsmen = ref([])
const city = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  craftsmen.value = await listPublicCraftsmen(city.value ? { city: city.value } : {})
  loading.value = false
}

onMounted(load)
let debounceTimer
watch(city, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 300)
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12">
    <h1 class="text-2xl font-bold text-slate-900">Direktori Pengrajin</h1>
    <input
      v-model="city"
      placeholder="Cari berdasarkan kota..."
      class="mt-4 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
    />

    <p v-if="loading" class="mt-8 text-sm text-slate-500">Memuat...</p>
    <p v-else-if="!craftsmen.length" class="mt-8 text-sm text-slate-500">Tidak ada pengrajin ditemukan.</p>

    <div v-else class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <router-link v-for="c in craftsmen" :key="c.id" :to="`/toko/${c.slug}`">
        <BaseCard class="h-full transition-shadow hover:shadow-md">
          <div
            class="h-32 w-full rounded-lg bg-slate-100 bg-cover bg-center"
            :style="c.cover_image_url ? `background-image: url(${c.cover_image_url})` : ''"
          />
          <p class="mt-3 font-semibold text-slate-900">{{ c.store_name }}</p>
          <p class="text-sm text-slate-500">{{ c.city }}</p>
          <p class="mt-1 text-sm text-amber-500">
            ★ {{ Number(c.rating_avg).toFixed(1) }} ({{ c.rating_count }} ulasan)
          </p>
        </BaseCard>
      </router-link>
    </div>
  </div>
</template>
