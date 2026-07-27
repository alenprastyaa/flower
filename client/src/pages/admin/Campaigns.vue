<script setup>
import { ref, onMounted, reactive } from 'vue'
import { listOrders } from '../../api/admin.api'
import { publishOrder, listCampaignsOverview } from '../../api/campaigns.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import StatusPill from '../../components/domain/StatusPill.vue'

const approvedOrders = ref([])
const campaigns = ref([])
const loading = ref(true)
const busyId = ref(null)
const errorMsg = ref('')

const publishTarget = ref(null)
const publishForm = reactive({ title: '', public_summary: '' })
const publishError = ref('')
const publishing = ref(false)

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

async function load() {
  loading.value = true
  const [ordersRes, campaignsRes] = await Promise.all([
    listOrders({ status: 'approved' }),
    listCampaignsOverview(),
  ])
  approvedOrders.value = ordersRes.data
  campaigns.value = campaignsRes
  loading.value = false
}

onMounted(load)

function openPublish(order) {
  publishTarget.value = order
  publishForm.title = `${order.arrangement_type} - ${order.delivery_city || ''}`.trim()
  publishForm.public_summary = order.description || ''
  publishError.value = ''
}

async function onConfirmPublish() {
  if (!publishForm.title || !publishForm.public_summary) {
    publishError.value = 'Isi judul & ringkasan publik terlebih dahulu.'
    return
  }
  publishError.value = ''
  publishing.value = true
  try {
    await publishOrder(publishTarget.value.id, { title: publishForm.title, public_summary: publishForm.public_summary })
    publishTarget.value = null
    await load()
  } catch (err) {
    publishError.value = err.response?.data?.error || 'Gagal mempublikasikan.'
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Campaign</h1>
    <p v-if="errorMsg" class="mt-2 text-sm text-rose-600">{{ errorMsg }}</p>

    <section class="mt-6">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Siap Dipublikasikan</h2>
      <p v-if="!loading && !approvedOrders.length" class="mt-3 text-sm text-slate-500">Tidak ada order yang siap dipublikasikan.</p>
      <div v-else class="mt-3 space-y-3">
        <BaseCard v-for="order in approvedOrders" :key="order.id">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <p class="text-sm text-slate-500">{{ order.arrangement_type }} · {{ order.occasion }} · {{ order.delivery_city }}</p>
              <p class="mt-1 text-sm text-slate-700">{{ order.description }}</p>
              <p class="mt-2 text-sm font-semibold text-emerald-700">{{ formatPrice(order.final_price) }}</p>
            </div>
            <BaseButton class="sm:shrink-0" :loading="busyId === order.id" @click="openPublish(order)">Publikasikan</BaseButton>
          </div>
        </BaseCard>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Semua Campaign</h2>
      <div class="mt-3 space-y-2">
        <BaseCard v-for="c in campaigns" :key="c.id">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-medium text-slate-900">{{ c.title }}</p>
              <p class="text-xs text-slate-500">{{ c.city }} · {{ formatPrice(c.price) }}</p>
            </div>
            <StatusPill class="shrink-0" :status="c.status" />
          </div>
        </BaseCard>
      </div>
    </section>

    <BaseModal :model-value="Boolean(publishTarget)" title="Publikasikan Campaign" max-width="max-w-lg" @update:model-value="publishTarget = null">
      <div class="space-y-4">
        <p class="text-sm text-slate-500">
          {{ publishTarget?.arrangement_type }} · {{ formatPrice(publishTarget?.final_price) }}
        </p>
        <BaseInput v-model="publishForm.title" label="Judul Publik" required />
        <BaseInput v-model="publishForm.public_summary" label="Ringkasan Publik" as="textarea" required />
        <p v-if="publishError" class="text-sm text-rose-600">{{ publishError }}</p>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="publishTarget = null">Batal</BaseButton>
        <BaseButton :loading="publishing" @click="onConfirmPublish">Publikasikan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
