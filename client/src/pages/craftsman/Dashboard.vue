<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.store'
import { fetchDashboardSummary } from '../../api/craftsmanOrders.api'
import BaseCard from '../../components/ui/BaseCard.vue'

const auth = useAuthStore()
const summary = ref(null)

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

onMounted(async () => {
  summary.value = await fetchDashboardSummary()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">
      Halo, {{ auth.user?.craftsmanProfile?.storeName || auth.user?.full_name }}
    </h1>

    <div v-if="summary" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">Diklaim</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ summary.claimedCount }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">Dikerjakan</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ summary.inProgressCount }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">Selesai</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ summary.completedCount }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">Total Pendapatan</p>
        <p class="mt-1 text-2xl font-semibold text-emerald-700">{{ formatPrice(summary.totalEarnings) }}</p>
      </BaseCard>
    </div>
  </div>
</template>
