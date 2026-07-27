<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicCraftsmanBySlug } from '../../api/craftsmen.api'
import BaseCard from '../../components/ui/BaseCard.vue'

const route = useRoute()
const craftsman = ref(null)
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    craftsman.value = await getPublicCraftsmanBySlug(route.params.slug)
  } catch (err) {
    error.value = 'Toko tidak ditemukan.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="mx-auto max-w-4xl px-4 py-16 text-sm text-slate-500">Memuat...</div>
  <div v-else-if="error" class="mx-auto max-w-4xl px-4 py-16 text-sm text-rose-600">{{ error }}</div>

  <div v-else>
    <div
      class="h-32 w-full bg-slate-200 bg-cover bg-center sm:h-48"
      :style="craftsman.cover_image_url ? `background-image: url(${craftsman.cover_image_url})` : ''"
    />
    <div class="mx-auto max-w-4xl px-4">
      <div class="-mt-8 flex items-end gap-3 sm:-mt-12 sm:gap-4">
        <img
          v-if="craftsman.avatar_url"
          :src="craftsman.avatar_url"
          class="h-16 w-16 shrink-0 rounded-full border-4 border-white object-cover shadow sm:h-24 sm:w-24"
        />
        <div v-else class="h-16 w-16 shrink-0 rounded-full border-4 border-white bg-emerald-100 shadow sm:h-24 sm:w-24" />
        <div class="min-w-0 pb-2">
          <h1 class="truncate text-xl font-bold text-slate-900 sm:text-2xl">{{ craftsman.store_name }}</h1>
          <p class="text-sm text-slate-500">{{ craftsman.city }}</p>
        </div>
      </div>

      <p class="mt-2 text-amber-500">
        ★ {{ Number(craftsman.rating_avg).toFixed(1) }} ({{ craftsman.rating_count }} ulasan)
      </p>

      <BaseCard v-if="craftsman.bio" class="mt-6">
        <p class="text-sm text-slate-700">{{ craftsman.bio }}</p>
      </BaseCard>

      <h2 class="mt-8 text-lg font-semibold text-slate-900">Portofolio</h2>
      <p v-if="!craftsman.portfolioItems?.length" class="mt-2 text-sm text-slate-500">Belum ada karya ditampilkan.</p>
      <div v-else class="mt-4 grid grid-cols-2 gap-3 pb-12 sm:grid-cols-3">
        <div v-for="item in craftsman.portfolioItems" :key="item.id" class="overflow-hidden rounded-xl bg-slate-100">
          <img :src="item.image_url" :alt="item.caption" class="aspect-square w-full object-cover" />
        </div>
      </div>
    </div>
  </div>
</template>
