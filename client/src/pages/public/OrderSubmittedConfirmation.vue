<script setup>
import { useRoute } from 'vue-router'
import BaseCard from '../../components/ui/BaseCard.vue'

const route = useRoute()
const token = route.params.token
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-16 text-center">
    <BaseCard>
      <h1 class="text-xl font-semibold text-emerald-700">Pesanan Terkirim!</h1>
      <p class="mt-2 text-sm text-slate-600">
        Pesanan Anda akan ditinjau oleh admin kami. Simpan tautan berikut untuk melacak status pesanan:
      </p>
      <router-link
        :to="`/lacak/${token}`"
        class="mt-4 block break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-emerald-700 hover:underline"
      >
        /lacak/{{ token }}
      </router-link>
    </BaseCard>
  </div>
</template>
