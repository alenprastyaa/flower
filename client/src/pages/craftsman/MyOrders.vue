<script setup>
import { ref, onMounted } from 'vue'
import { listMyOrders, updateOrderStatus } from '../../api/craftsmanOrders.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import StatusPill from '../../components/domain/StatusPill.vue'

const orders = ref([])
const loading = ref(true)
const busyId = ref(null)
const errorMsg = ref('')
const imageUrlDrafts = ref({})

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

async function load() {
  loading.value = true
  orders.value = await listMyOrders()
  loading.value = false
}

onMounted(load)

async function startProgress(order) {
  errorMsg.value = ''
  busyId.value = order.id
  try {
    await updateOrderStatus(order.id, { status: 'in_progress' })
    await load()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal memperbarui status.'
  } finally {
    busyId.value = null
  }
}

async function markCompleted(order) {
  errorMsg.value = ''
  busyId.value = order.id
  try {
    const imageUrl = imageUrlDrafts.value[order.id]
    await updateOrderStatus(order.id, {
      status: 'completed',
      completion_image_url: imageUrl || undefined,
    })
    await load()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal menyelesaikan pesanan.'
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Pesanan Saya</h1>
    <p v-if="errorMsg" class="mt-2 text-sm text-rose-600">{{ errorMsg }}</p>

    <p v-if="loading" class="mt-6 text-sm text-slate-500">Memuat...</p>
    <p v-else-if="!orders.length" class="mt-6 text-sm text-slate-500">Belum ada pesanan yang diklaim.</p>

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
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-medium text-slate-900">{{ order.arrangement_type }}</p>
                <StatusPill :status="order.status" />
              </div>
              <p class="mt-1 text-sm text-slate-600">"{{ order.description }}"</p>
              <p class="mt-2 text-xs text-slate-500">
                Kirim ke: {{ order.delivery_address }}, {{ order.delivery_city }}
              </p>
              <p class="mt-1 text-sm font-semibold text-emerald-700">
                Pendapatan: {{ formatPrice(order.craftsman_earning) }}
              </p>
            </div>
          </div>

          <div class="w-full space-y-2 sm:w-64 sm:shrink-0">
            <BaseButton
              v-if="order.status === 'claimed'"
              class="w-full"
              :loading="busyId === order.id"
              @click="startProgress(order)"
            >
              Mulai Dikerjakan
            </BaseButton>

            <template v-if="order.status === 'in_progress'">
              <BaseInput
                v-model="imageUrlDrafts[order.id]"
                label="URL Foto Hasil (opsional)"
                placeholder="https://..."
              />
              <BaseButton class="w-full" :loading="busyId === order.id" @click="markCompleted(order)">
                Tandai Selesai
              </BaseButton>
            </template>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
