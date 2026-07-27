<script setup>
import { computed } from 'vue'

// Horizontal bar chart for magnitude comparisons (order counts, earnings
// rankings). Mark spec per dataviz skill: bar ≤24px thick, 4px rounded data-end
// square at the baseline, value labeled at the tip (always visible, so no
// separate tooltip is needed — the label IS the readout).
const props = defineProps({
  bars: { type: Array, required: true }, // [{ label, value, color }]
  formatValue: { type: Function, default: (v) => v.toLocaleString('id-ID') },
  emptyText: { type: String, default: 'Belum ada data.' },
})

const maxValue = computed(() => Math.max(1, ...props.bars.map((b) => b.value)))
</script>

<template>
  <div v-if="!bars.length" class="py-6 text-center text-sm text-slate-400">{{ emptyText }}</div>
  <div v-else class="space-y-3">
    <div v-for="bar in bars" :key="bar.label" class="group">
      <div class="mb-1 flex items-center justify-between text-xs">
        <span class="truncate font-medium text-slate-600">{{ bar.label }}</span>
        <span class="ml-2 shrink-0 font-semibold text-slate-900">{{ formatValue(bar.value) }}</span>
      </div>
      <div class="h-2.5 w-full rounded-full bg-slate-100">
        <div
          class="h-2.5 rounded-full transition-all duration-300 group-hover:brightness-110"
          :style="{ width: `${(bar.value / maxValue) * 100}%`, backgroundColor: bar.color || '#059669' }"
        />
      </div>
    </div>
  </div>
</template>
