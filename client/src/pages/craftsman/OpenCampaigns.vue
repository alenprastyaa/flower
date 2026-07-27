<script setup>
import { ref, onMounted } from 'vue'
import { useCampaignsStore } from '../../stores/campaigns.store'
import { claimCampaign } from '../../api/campaigns.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

const store = useCampaignsStore()
const claimingId = ref(null)
const errorMsg = ref('')

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

onMounted(() => {
  store.fetchOpen()
  store.subscribeToSocket()
})

async function onClaim(campaign) {
  errorMsg.value = ''
  claimingId.value = campaign.id
  try {
    await claimCampaign(campaign.id)
    store.removeById(campaign.id)
  } catch (err) {
    if (err.response?.status === 409) {
      errorMsg.value = 'Campaign ini baru saja diklaim pengrajin lain.'
      store.removeById(campaign.id)
    } else {
      errorMsg.value = err.response?.data?.error || 'Gagal mengklaim campaign.'
    }
  } finally {
    claimingId.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold text-slate-900">Campaign Terbuka</h1>
      <BaseButton variant="secondary" :loading="store.loading" @click="store.fetchOpen()">Muat Ulang</BaseButton>
    </div>
    <p class="mt-1 text-xs text-slate-400">Daftar ini otomatis diperbarui secara real-time.</p>

    <p v-if="errorMsg" class="mt-4 text-sm text-rose-600">{{ errorMsg }}</p>

    <p v-if="!store.loading && !store.items.length" class="mt-6 text-sm text-slate-500">
      Belum ada campaign terbuka saat ini.
    </p>

    <div v-else class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <BaseCard v-for="c in store.items" :key="c.id">
        <p class="font-semibold text-slate-900">{{ c.title }}</p>
        <p class="mt-2 text-sm text-slate-600">{{ c.public_summary }}</p>
        <div class="mt-4 flex items-center justify-between text-sm">
          <span class="font-semibold text-emerald-700">{{ formatPrice(c.price) }}</span>
          <span class="text-slate-500">{{ c.city }}</span>
        </div>
        <p class="mt-1 text-xs text-slate-400">Dibutuhkan: {{ c.needed_by_date }}</p>
        <BaseButton class="mt-4 w-full" variant="danger" :loading="claimingId === c.id" @click="onClaim(c)">
          Klaim Sekarang
        </BaseButton>
      </BaseCard>
    </div>
  </div>
</template>
