<script setup>
import { ref, onMounted, watch } from 'vue'
import { listOrders, markPayment, cancelOrder } from '../../api/admin.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import StatusPill from '../../components/domain/StatusPill.vue'

const orders = ref([])
const loading = ref(true)
const statusFilter = ref('')
const busyId = ref(null)
const cancelTarget = ref(null)
const cancelling = ref(false)

const STATUSES = ['submitted', 'approved', 'published', 'claimed', 'in_progress', 'completed', 'rejected', 'cancelled', 'expired']

function formatPrice(price) {
  if (!price) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

async function load() {
  loading.value = true
  const res = await listOrders(statusFilter.value ? { status: statusFilter.value } : {})
  orders.value = res.data
  loading.value = false
}

onMounted(load)
watch(statusFilter, load)

async function onMarkPaid(order) {
  busyId.value = order.id
  try {
    await markPayment(order.id, 'paid')
    await load()
  } finally {
    busyId.value = null
  }
}

async function onConfirmCancel() {
  cancelling.value = true
  try {
    await cancelOrder(cancelTarget.value.id, {})
    cancelTarget.value = null
    await load()
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Semua Pesanan</h1>
        <p class="mt-1 text-sm text-slate-500">{{ orders.length }} pesanan ditemukan</p>
      </div>
      <select v-model="statusFilter" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
        <option value="">Semua Status</option>
        <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <BaseCard class="mt-6 !p-0">
      <p v-if="loading" class="p-6 text-center text-sm text-slate-500">Memuat...</p>
      <p v-else-if="!orders.length" class="p-6 text-center text-sm text-slate-500">Tidak ada pesanan.</p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th class="px-4 py-3 font-medium">Pesanan</th>
              <th class="px-4 py-3 font-medium">Pemesan</th>
              <th class="px-4 py-3 font-medium">Harga</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <p class="font-medium text-slate-900">#{{ order.id }} {{ order.arrangement_type }}</p>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ order.buyer_name }} · {{ order.delivery_city }}</td>
              <td class="px-4 py-3 font-medium text-emerald-700">{{ formatPrice(order.final_price) }}</td>
              <td class="px-4 py-3"><StatusPill :status="order.status" /></td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <BaseButton
                    v-if="order.final_price && ['approved', 'published', 'claimed', 'in_progress', 'completed'].includes(order.status)"
                    variant="secondary"
                    :loading="busyId === order.id"
                    @click="onMarkPaid(order)"
                  >
                    Tandai Lunas
                  </BaseButton>
                  <BaseButton
                    v-if="['approved', 'published', 'claimed'].includes(order.status)"
                    variant="danger"
                    :loading="busyId === order.id"
                    @click="cancelTarget = order"
                  >
                    Batalkan
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <BaseModal :model-value="Boolean(cancelTarget)" title="Batalkan Pesanan?" @update:model-value="cancelTarget = null">
      <p class="text-sm text-slate-600">
        Yakin ingin membatalkan pesanan "<strong>#{{ cancelTarget?.id }} {{ cancelTarget?.arrangement_type }}</strong>"?
        Tindakan ini tidak dapat dibatalkan.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="cancelTarget = null">Tutup</BaseButton>
        <BaseButton variant="danger" :loading="cancelling" @click="onConfirmCancel">Batalkan Pesanan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
