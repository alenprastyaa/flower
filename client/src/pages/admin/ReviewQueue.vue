<script setup>
import { ref, onMounted } from 'vue'
import { listOrders, approveOrder, rejectOrder } from '../../api/admin.api'
import { useAdminNotificationsStore } from '../../stores/adminNotifications.store'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseModal from '../../components/ui/BaseModal.vue'

const notifications = useAdminNotificationsStore()
const orders = ref([])
const loading = ref(true)
const busyId = ref(null)
const errorMsg = ref('')

const rejectTarget = ref(null)
const rejectReason = ref('')
const rejectError = ref('')
const rejecting = ref(false)

function formatPrice(price) {
  if (!price) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

async function load() {
  loading.value = true
  const res = await listOrders({ status: 'submitted' })
  orders.value = res.data
  loading.value = false
}

onMounted(load)

async function onApprove(order) {
  errorMsg.value = ''
  busyId.value = order.id
  try {
    await approveOrder(order.id, {})
    notifications.decrement()
    await load()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal menyetujui pesanan.'
  } finally {
    busyId.value = null
  }
}

function openReject(order) {
  rejectTarget.value = order
  rejectReason.value = ''
  rejectError.value = ''
}

async function onConfirmReject() {
  if (!rejectReason.value.trim()) {
    rejectError.value = 'Alasan penolakan wajib diisi.'
    return
  }
  rejecting.value = true
  try {
    await rejectOrder(rejectTarget.value.id, { admin_notes: rejectReason.value })
    notifications.decrement()
    rejectTarget.value = null
    await load()
  } catch (err) {
    rejectError.value = err.response?.data?.error || 'Gagal menolak pesanan.'
  } finally {
    rejecting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Review Pesanan Masuk</h1>
    <p v-if="errorMsg" class="mt-2 text-sm text-rose-600">{{ errorMsg }}</p>

    <p v-if="loading" class="mt-6 text-sm text-slate-500">Memuat...</p>
    <p v-else-if="!orders.length" class="mt-6 text-sm text-slate-500">Tidak ada pesanan menunggu review.</p>

    <div v-else class="mt-6 space-y-4">
      <BaseCard v-for="order in orders" :key="order.id">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex min-w-0 gap-3">
            <img
              v-if="order.product_image_snapshot"
              :src="order.product_image_snapshot"
              :alt="order.arrangement_type"
              class="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
            <div class="min-w-0">
              <p class="font-medium text-slate-900">{{ order.arrangement_type }}</p>
              <p class="text-sm font-semibold text-emerald-700">{{ formatPrice(order.final_price) }}</p>
              <p class="mt-1 text-sm text-slate-600">"{{ order.description }}"</p>
              <p class="mt-2 text-xs text-slate-500">
                Dibutuhkan: {{ order.needed_by_date }}<span v-if="order.occasion"> · {{ order.occasion }}</span>
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Pemesan: {{ order.buyer_name }} ({{ order.buyer_phone }}) · {{ order.delivery_city }}
              </p>
            </div>
          </div>
          <div class="flex w-full gap-2 sm:w-auto sm:shrink-0">
            <BaseButton class="flex-1 sm:flex-none" :loading="busyId === order.id" @click="onApprove(order)">Setujui</BaseButton>
            <BaseButton class="flex-1 sm:flex-none" variant="danger" :disabled="busyId === order.id" @click="openReject(order)">Tolak</BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseModal :model-value="Boolean(rejectTarget)" title="Tolak Pesanan" @update:model-value="rejectTarget = null">
      <p class="text-sm text-slate-600">
        Tolak pesanan "<strong>{{ rejectTarget?.arrangement_type }}</strong>" dari {{ rejectTarget?.buyer_name }}?
      </p>
      <BaseInput v-model="rejectReason" label="Alasan Penolakan" as="textarea" class="mt-4" required />
      <p v-if="rejectError" class="mt-2 text-sm text-rose-600">{{ rejectError }}</p>

      <template #footer>
        <BaseButton variant="secondary" @click="rejectTarget = null">Batal</BaseButton>
        <BaseButton variant="danger" :loading="rejecting" @click="onConfirmReject">Tolak Pesanan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
