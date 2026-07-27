<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const STYLES = {
  submitted: 'bg-amber-100 text-amber-800',
  approved: 'bg-sky-100 text-sky-800',
  published: 'bg-sky-100 text-sky-800',
  open: 'bg-sky-100 text-sky-800',
  claimed: 'bg-emerald-100 text-emerald-800',
  in_progress: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-600 text-white',
  paid: 'bg-emerald-600 text-white',
  unpaid: 'bg-amber-100 text-amber-800',
  rejected: 'bg-slate-200 text-slate-600',
  cancelled: 'bg-slate-200 text-slate-600',
  expired: 'bg-slate-100 text-slate-500 border border-dashed border-slate-300',
}

const LABELS = {
  submitted: 'Menunggu Review',
  approved: 'Disetujui',
  published: 'Dipublikasikan',
  open: 'Terbuka',
  claimed: 'Diklaim',
  in_progress: 'Dikerjakan',
  completed: 'Selesai',
  paid: 'Lunas',
  unpaid: 'Belum Bayar',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

const classes = computed(() => STYLES[props.status] || 'bg-slate-100 text-slate-600')
const label = computed(() => LABELS[props.status] || props.status)
</script>

<template>
  <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', classes]">
    {{ label }}
  </span>
</template>
