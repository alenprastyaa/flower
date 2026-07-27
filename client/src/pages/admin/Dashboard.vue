<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.store'
import { fetchDashboardSummary, fetchDashboardCharts } from '../../api/admin.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BarChart from '../../components/charts/BarChart.vue'
import TrendChart from '../../components/charts/TrendChart.vue'

const auth = useAuthStore()
const summary = ref(null)
const charts = ref(null)
const loadingCharts = ref(true)

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}
function formatCompact(value) {
  return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

// Order status carries real state meaning (good/neutral/critical), so it uses
// the app's existing status color language (same as StatusPill) rather than a
// generic categorical palette — per dataviz skill, status is a reserved job.
const STATUS_META = {
  submitted: { label: 'Menunggu Review', color: '#d97706' },
  approved: { label: 'Disetujui', color: '#0284c7' },
  published: { label: 'Dipublikasikan', color: '#0284c7' },
  claimed: { label: 'Diklaim', color: '#059669' },
  in_progress: { label: 'Dikerjakan', color: '#059669' },
  completed: { label: 'Selesai', color: '#047857' },
  rejected: { label: 'Ditolak', color: '#94a3b8' },
  cancelled: { label: 'Dibatalkan', color: '#94a3b8' },
  expired: { label: 'Kedaluwarsa', color: '#cbd5e1' },
}

const statusBars = computed(() => {
  if (!charts.value) return []
  return charts.value.ordersByStatus
    .map((s) => ({
      label: STATUS_META[s.status]?.label || s.status,
      value: s.count,
      color: STATUS_META[s.status]?.color || '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value)
})

const craftsmenBars = computed(() => {
  if (!charts.value) return []
  return charts.value.topCraftsmen.map((c) => ({ label: c.storeName, value: c.earnings, color: '#059669' }))
})

const trendPoints = computed(() => {
  if (!charts.value) return []
  return charts.value.revenueTrend.map((d) => ({
    date: d.date,
    values: [
      { label: 'GMV', value: d.gmv, color: '#059669' },
      { label: 'Komisi', value: d.commission, color: '#94a3b8' },
    ],
  }))
})

onMounted(async () => {
  summary.value = await fetchDashboardSummary()
  charts.value = await fetchDashboardCharts()
  loadingCharts.value = false
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Halo, {{ auth.user?.full_name }}</h1>
    <p class="mt-1 text-sm text-slate-500">Ringkasan performa platform Anda.</p>

    <div v-if="summary" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">Menunggu Review</p>
        <p class="mt-1 text-2xl font-semibold text-amber-600">{{ summary.pendingReviewCount }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">Campaign Terbuka</p>
        <p class="mt-1 text-2xl font-semibold text-sky-600">{{ summary.openCampaignsCount }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">Pengrajin Aktif</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ summary.activeCraftsmenCount }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">GMV Berjalan</p>
        <p class="mt-1 text-2xl font-semibold text-emerald-700">{{ formatPrice(summary.gmv) }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs uppercase tracking-wide text-slate-500">Total Komisi</p>
        <p class="mt-1 text-2xl font-semibold text-emerald-700">{{ formatPrice(summary.totalCommission) }}</p>
      </BaseCard>
    </div>

    <BaseCard class="mt-6">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900">Tren Pendapatan</h2>
        <span class="text-xs text-slate-400">14 hari terakhir</span>
      </div>
      <p v-if="loadingCharts" class="py-10 text-center text-sm text-slate-400">Memuat...</p>
      <TrendChart v-else class="mt-4" :points="trendPoints" :format-value="formatCompact" />
    </BaseCard>

    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <BaseCard>
        <h2 class="text-sm font-semibold text-slate-900">Pesanan per Status</h2>
        <p v-if="loadingCharts" class="py-10 text-center text-sm text-slate-400">Memuat...</p>
        <BarChart v-else class="mt-4" :bars="statusBars" />
      </BaseCard>

      <BaseCard>
        <h2 class="text-sm font-semibold text-slate-900">Pengrajin Teratas</h2>
        <p class="text-xs text-slate-400">Berdasarkan total pendapatan (pesanan selesai)</p>
        <p v-if="loadingCharts" class="py-10 text-center text-sm text-slate-400">Memuat...</p>
        <BarChart v-else class="mt-4" :bars="craftsmenBars" :format-value="formatPrice" empty-text="Belum ada pesanan selesai." />
      </BaseCard>
    </div>
  </div>
</template>
