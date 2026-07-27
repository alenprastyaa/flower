<script setup>
import { ref, computed } from 'vue'

// Line trend chart, "emphasis" color job (one accent series is the point,
// the rest is context) — 2px lines, >=8px end-dot with a 2px surface ring,
// crosshair + one tooltip listing every series at that x. Mark specs per
// the dataviz skill.
const props = defineProps({
  points: { type: Array, required: true }, // [{ date, values: [{label,value,color}] }]
  formatValue: { type: Function, default: (v) => v.toLocaleString('id-ID') },
  formatDate: { type: Function, default: (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) },
})

const W = 640
const H = 220
const PAD_L = 8
const PAD_R = 8
const PAD_T = 16
const PAD_B = 28

const seriesLabels = computed(() => props.points[0]?.values.map((v) => ({ label: v.label, color: v.color })) || [])

const maxValue = computed(() => {
  const all = props.points.flatMap((p) => p.values.map((v) => v.value))
  return Math.max(1, ...all)
})

function xFor(i) {
  const n = props.points.length - 1 || 1
  return PAD_L + (i / n) * (W - PAD_L - PAD_R)
}
function yFor(value) {
  const usable = H - PAD_T - PAD_B
  return PAD_T + usable - (value / maxValue.value) * usable
}

const linePaths = computed(() => {
  if (!seriesLabels.value.length) return []
  return seriesLabels.value.map((s, si) => {
    const d = props.points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.values[si].value)}`)
      .join(' ')
    return { ...s, d }
  })
})

const gridLines = computed(() => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => {
    const value = (maxValue.value / steps) * i
    return { y: yFor(value), value }
  })
})

const hoverIndex = ref(null)

function onMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const relX = ((e.clientX - rect.left) / rect.width) * W
  const n = props.points.length - 1 || 1
  const idx = Math.round(((relX - PAD_L) / (W - PAD_L - PAD_R)) * n)
  hoverIndex.value = Math.min(Math.max(idx, 0), props.points.length - 1)
}
function onLeave() {
  hoverIndex.value = null
}

const hoverPoint = computed(() => (hoverIndex.value === null ? null : props.points[hoverIndex.value]))
const hoverX = computed(() => (hoverIndex.value === null ? 0 : xFor(hoverIndex.value)))
</script>

<template>
  <div>
    <div v-if="seriesLabels.length > 1" class="mb-2 flex items-center gap-4 text-xs">
      <span v-for="s in seriesLabels" :key="s.label" class="flex items-center gap-1.5 text-slate-600">
        <span class="h-0.5 w-3 rounded" :style="{ backgroundColor: s.color }" />
        {{ s.label }}
      </span>
    </div>

    <div class="relative">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        class="w-full touch-none"
        @mousemove="onMove"
        @mouseleave="onLeave"
      >
        <line
          v-for="g in gridLines"
          :key="g.value"
          :x1="PAD_L"
          :x2="W - PAD_R"
          :y1="g.y"
          :y2="g.y"
          stroke="#e1e0d9"
          stroke-width="1"
        />
        <text v-for="g in gridLines" :key="`label-${g.value}`" :x="0" :y="g.y + 3" font-size="9" fill="#898781">
          {{ formatValue(Math.round(g.value)) }}
        </text>

        <line
          v-if="hoverPoint"
          :x1="hoverX"
          :x2="hoverX"
          :y1="PAD_T"
          :y2="H - PAD_B"
          stroke="#c3c2b7"
          stroke-width="1"
        />

        <path
          v-for="s in linePaths"
          :key="s.label"
          :d="s.d"
          fill="none"
          :stroke="s.color"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <template v-if="hoverPoint">
          <circle
            v-for="(v, i) in hoverPoint.values"
            :key="i"
            :cx="hoverX"
            :cy="yFor(v.value)"
            r="5"
            :fill="v.color"
            stroke="#fcfcfb"
            stroke-width="2"
          />
        </template>

        <text
          v-for="(p, i) in points"
          :key="p.date"
          v-show="i === 0 || i === points.length - 1 || i === hoverIndex"
          :x="xFor(i)"
          :y="H - 8"
          font-size="9"
          fill="#898781"
          text-anchor="middle"
        >
          {{ formatDate(p.date) }}
        </text>
      </svg>

      <div
        v-if="hoverPoint"
        class="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
        :style="{ left: `${(hoverX / W) * 100}%` }"
      >
        <p class="font-medium text-slate-200">{{ formatDate(hoverPoint.date) }}</p>
        <p v-for="(v, i) in hoverPoint.values" :key="i" class="mt-0.5 flex items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: v.color }" />
          <span class="font-semibold">{{ formatValue(v.value) }}</span>
          <span class="text-slate-400">{{ v.label }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
