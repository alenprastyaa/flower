<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'
import { trackOrder, submitRating } from '../../api/orders.api'
import { getOrderChat, sendOrderChatMessage } from '../../api/chat.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import StatusPill from '../../components/domain/StatusPill.vue'
import ChatPanel from '../../components/domain/ChatPanel.vue'

const route = useRoute()
const order = ref(null)
const error = ref('')
const loading = ref(true)

const ratingStars = ref(5)
const ratingComment = ref('')
const ratingBusy = ref(false)
const ratingError = ref('')

const chatMessages = ref([])
const chatLoading = ref(true)
const chatSending = ref(false)
let socket = null

async function load() {
  try {
    order.value = await trackOrder(route.params.token)
  } catch (err) {
    error.value = 'Pesanan tidak ditemukan.'
  } finally {
    loading.value = false
  }
}

async function loadChat() {
  chatLoading.value = true
  try {
    const data = await getOrderChat(route.params.token)
    chatMessages.value = data.messages
  } finally {
    chatLoading.value = false
  }
}

function connectChatSocket() {
  // Anonymous connection — buyers have no account, so the tracking token
  // itself is what proves this socket may join this specific order's chat.
  socket = io({ auth: {} })
  socket.on('connect', () => {
    socket.emit('join-order-chat', { trackingToken: route.params.token })
  })
  socket.on('chat:order-message', (msg) => {
    if (msg.senderType === 'buyer') return // we already appended it optimistically
    chatMessages.value.push(msg)
  })
}

async function onSendChat(body) {
  chatSending.value = true
  try {
    const msg = await sendOrderChatMessage(route.params.token, body)
    chatMessages.value.push(msg)
  } finally {
    chatSending.value = false
  }
}

onMounted(async () => {
  await load()
  if (!error.value) {
    loadChat()
    connectChatSocket()
  }
})

onBeforeUnmount(() => {
  socket?.disconnect()
})

async function onSubmitRating() {
  ratingError.value = ''
  ratingBusy.value = true
  try {
    await submitRating(route.params.token, { stars: Number(ratingStars.value), comment: ratingComment.value || undefined })
    await load()
  } catch (err) {
    ratingError.value = err.response?.data?.error || 'Gagal mengirim rating.'
  } finally {
    ratingBusy.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-12">
    <h1 class="text-xl font-semibold text-slate-900">Lacak Pesanan</h1>

    <p v-if="loading" class="mt-4 text-sm text-slate-500">Memuat...</p>
    <p v-else-if="error" class="mt-4 text-sm text-rose-600">{{ error }}</p>

    <template v-else>
      <BaseCard class="mt-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <img
              v-if="order.productImage"
              :src="order.productImage"
              :alt="order.arrangementType"
              class="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
            <div class="min-w-0">
              <p class="truncate font-medium text-slate-900">{{ order.arrangementType || 'Karangan Bunga' }}</p>
              <p class="text-sm text-slate-500">{{ order.occasion }}</p>
            </div>
          </div>
          <StatusPill class="shrink-0" :status="order.status" />
        </div>

        <div v-if="order.claimedByCraftsman" class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Dikerjakan oleh <strong>{{ order.claimedByCraftsman.storeName }}</strong> ({{ order.claimedByCraftsman.city }})
        </div>

        <div v-if="order.adminNotes" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          Catatan admin: {{ order.adminNotes }}
        </div>

        <h2 class="mt-6 text-sm font-semibold text-slate-700">Riwayat Status</h2>
        <ul class="mt-2 space-y-2">
          <li v-for="(h, i) in order.history" :key="i" class="text-sm text-slate-600">
            <span class="font-mono text-xs text-slate-400">{{ new Date(h.at).toLocaleString('id-ID') }}</span>
            — {{ h.to }}<span v-if="h.note"> ({{ h.note }})</span>
          </li>
        </ul>

        <div v-if="order.status === 'completed'" class="mt-6 border-t border-slate-200 pt-6">
          <div v-if="order.rating">
            <h2 class="text-sm font-semibold text-slate-700">Rating Anda</h2>
            <p class="mt-1 text-amber-500">{{ '★'.repeat(order.rating.stars) }}{{ '☆'.repeat(5 - order.rating.stars) }}</p>
            <p v-if="order.rating.comment" class="mt-1 text-sm text-slate-600">{{ order.rating.comment }}</p>
          </div>
          <div v-else>
            <h2 class="text-sm font-semibold text-slate-700">Beri Rating Pesanan Ini</h2>
            <select v-model="ratingStars" class="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option v-for="n in [5, 4, 3, 2, 1]" :key="n" :value="n">{{ n }} Bintang</option>
            </select>
            <BaseInput v-model="ratingComment" label="Komentar (opsional)" as="textarea" class="mt-2" />
            <p v-if="ratingError" class="mt-2 text-sm text-rose-600">{{ ratingError }}</p>
            <BaseButton class="mt-2" :loading="ratingBusy" @click="onSubmitRating">Kirim Rating</BaseButton>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="mt-4 !p-0">
        <h2 class="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">Tanya Admin</h2>
        <div class="h-96">
          <ChatPanel
            :messages="chatMessages"
            :loading="chatLoading"
            :sending="chatSending"
            :is-own-message="(m) => m.senderType === 'buyer'"
            placeholder="Tulis pertanyaan Anda..."
            empty-text="Ada pertanyaan soal pesanan ini? Tulis di sini, admin akan segera membalas."
            @send="onSendChat"
          />
        </div>
      </BaseCard>
    </template>
  </div>
</template>
