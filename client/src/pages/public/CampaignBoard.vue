<script setup>
import { ref, onMounted } from 'vue'
import { listPublicCampaigns } from '../../api/campaigns.api'
import BaseCard from '../../components/ui/BaseCard.vue'

const campaigns = ref([])
const loading = ref(true)

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

onMounted(async () => {
  campaigns.value = await listPublicCampaigns()
  loading.value = false
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12">
    <h1 class="text-2xl font-bold text-slate-900">Campaign Pesanan Terbuka</h1>
    <p class="mt-1 text-sm text-slate-500">Daftar pesanan yang sudah disetujui admin dan siap dikerjakan pengrajin.</p>

    <p v-if="loading" class="mt-8 text-sm text-slate-500">Memuat...</p>
    <p v-else-if="!campaigns.length" class="mt-8 text-sm text-slate-500">Belum ada campaign terbuka saat ini.</p>

    <div v-else class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <BaseCard v-for="c in campaigns" :key="c.id">
        <p class="font-semibold text-slate-900">{{ c.title }}</p>
        <p class="mt-2 text-sm text-slate-600">{{ c.public_summary }}</p>
        <div class="mt-4 flex items-center justify-between text-sm">
          <span class="text-emerald-700 font-semibold">{{ formatPrice(c.price) }}</span>
          <span class="text-slate-500">{{ c.city }}</span>
        </div>
        <p class="mt-1 text-xs text-slate-400">Dibutuhkan: {{ c.needed_by_date }}</p>
      </BaseCard>
    </div>
  </div>
</template>
