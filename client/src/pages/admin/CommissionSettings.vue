<script setup>
import { ref, onMounted } from 'vue'
import { getCommissionConfig, setCommissionRate } from '../../api/admin.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

const active = ref(null)
const history = ref([])
const draftRate = ref('')
const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')

async function load() {
  loading.value = true
  const data = await getCommissionConfig()
  active.value = data.active
  history.value = data.history
  draftRate.value = data.active?.rate_percent || ''
  loading.value = false
}

onMounted(load)

async function onSave() {
  errorMsg.value = ''
  const rate = Number(draftRate.value)
  if (!rate || rate <= 0 || rate > 100) {
    errorMsg.value = 'Masukkan persentase komisi yang valid (0-100).'
    return
  }
  saving.value = true
  try {
    await setCommissionRate(rate)
    await load()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal menyimpan.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Pengaturan Komisi</h1>
    <p class="mt-1 text-sm text-slate-500">
      Perubahan hanya berlaku untuk order yang diklaim setelahnya — order yang sudah diklaim tidak berubah.
    </p>

    <BaseCard class="mt-6 max-w-sm">
      <p class="text-xs uppercase tracking-wide text-slate-500">Rate Aktif Saat Ini</p>
      <p class="mt-1 text-3xl font-bold text-emerald-700">{{ active?.rate_percent }}%</p>

      <div class="mt-4 flex items-end gap-2">
        <BaseInput v-model="draftRate" label="Rate Baru (%)" type="number" class="flex-1" />
        <BaseButton :loading="saving" @click="onSave">Simpan</BaseButton>
      </div>
      <p v-if="errorMsg" class="mt-2 text-sm text-rose-600">{{ errorMsg }}</p>
    </BaseCard>

    <h2 class="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">Riwayat</h2>
    <div class="mt-3 space-y-2">
      <BaseCard v-for="h in history" :key="h.id">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <span class="font-medium text-slate-900">{{ h.rate_percent }}%</span>
          <span class="text-slate-500">{{ new Date(h.effective_from).toLocaleString('id-ID') }}</span>
          <span :class="h.is_active ? 'text-emerald-600' : 'text-slate-400'">
            {{ h.is_active ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
