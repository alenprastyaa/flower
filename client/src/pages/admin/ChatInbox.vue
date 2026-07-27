<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { listAdminConversations, getAdminConversation, sendAdminReply } from '../../api/chat.api'
import { getSocket } from '../../sockets/socket'
import { useAdminNotificationsStore } from '../../stores/adminNotifications.store'
import BaseCard from '../../components/ui/BaseCard.vue'
import ChatPanel from '../../components/domain/ChatPanel.vue'

const notifications = useAdminNotificationsStore()

const conversations = ref([])
const loadingList = ref(true)
const selected = ref(null)
const selectedMessages = ref([])
const loadingConversation = ref(false)
const sending = ref(false)

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function loadList() {
  loadingList.value = true
  conversations.value = await listAdminConversations()
  loadingList.value = false
}

async function openConversation(conv) {
  selected.value = conv
  conv.unread = false
  loadingConversation.value = true
  try {
    const data = await getAdminConversation(conv.id)
    selectedMessages.value = data.messages
    if (conv.order) {
      getSocket()?.emit('join-order-chat', { orderId: conv.order.id })
    } else if (conv.visitorId) {
      getSocket()?.emit('join-visitor-chat', { visitorId: conv.visitorId })
    }
  } finally {
    loadingConversation.value = false
  }
}

async function onSend(body) {
  sending.value = true
  try {
    const msg = await sendAdminReply(selected.value.id, body)
    selectedMessages.value.push(msg)
  } finally {
    sending.value = false
  }
}

function onSocketMessage(msg) {
  // Bump the conversation to the top of the list with a fresh preview.
  const conv = conversations.value.find((c) => c.id === msg.conversationId)
  if (conv) {
    conv.lastMessage = { body: msg.body, sender_type: msg.senderType, created_at: msg.createdAt }
    conv.updatedAt = msg.createdAt
    // Only flag as unread if it's not the conversation currently open —
    // being open already means the admin is looking right at it.
    if (msg.senderType === 'buyer' && selected.value?.id !== conv.id) conv.unread = true
    conversations.value = [conv, ...conversations.value.filter((c) => c.id !== conv.id)]
  } else {
    loadList()
  }

  if (selected.value?.id === msg.conversationId && msg.senderType === 'buyer') {
    selectedMessages.value.push(msg)
  }
}

onMounted(() => {
  loadList()
  notifications.clearBuyerChatUnread()
  getSocket()?.on('chat:order-message', onSocketMessage)
})

onBeforeUnmount(() => {
  getSocket()?.off('chat:order-message', onSocketMessage)
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Chat Pembeli</h1>
    <p class="mt-1 text-sm text-slate-500">Pertanyaan dari calon pembeli terkait pesanan mereka.</p>

    <BaseCard class="mt-6 !p-0">
      <div class="grid grid-cols-1 md:grid-cols-[280px_1fr]" style="height: 32rem">
        <div class="overflow-y-auto border-b border-slate-100 md:border-b-0 md:border-r">
          <p v-if="loadingList" class="p-4 text-center text-sm text-slate-400">Memuat...</p>
          <p v-else-if="!conversations.length" class="p-4 text-center text-sm text-slate-400">Belum ada percakapan.</p>
          <button
            v-for="c in conversations"
            :key="c.id"
            type="button"
            class="block w-full border-b border-slate-50 p-3 text-left hover:bg-slate-50"
            :class="selected?.id === c.id ? 'bg-emerald-50' : ''"
            @click="openConversation(c)"
          >
            <p class="flex items-center gap-1.5 truncate text-sm font-medium text-slate-900">
              <span v-if="c.unread" class="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
              {{ c.order?.buyer_name || c.visitorName || 'Pengunjung' }}
            </p>
            <p class="truncate text-xs text-slate-500">
              {{ c.order?.arrangement_type || 'Pertanyaan umum (belum ada pesanan)' }}
            </p>
            <p v-if="c.lastMessage" class="mt-1 truncate text-xs text-slate-400">
              {{ c.lastMessage.sender_type === 'user' ? 'Anda: ' : '' }}{{ c.lastMessage.body }}
            </p>
            <p class="mt-0.5 text-[11px] text-slate-300">{{ formatTime(c.updatedAt) }}</p>
          </button>
        </div>

        <div class="flex min-h-0 flex-col">
          <div v-if="!selected" class="flex h-full items-center justify-center text-sm text-slate-400">
            Pilih percakapan untuk mulai membalas.
          </div>
          <template v-else>
            <div class="border-b border-slate-100 px-4 py-2.5">
              <p class="text-sm font-medium text-slate-900">
                {{ selected.order?.buyer_name || selected.visitorName || 'Pengunjung' }}
              </p>
              <p class="text-xs text-slate-500">
                {{ selected.order ? `Pesanan: ${selected.order.arrangement_type}` : 'Pertanyaan umum (belum ada pesanan)' }}
              </p>
            </div>
            <div class="min-h-0 flex-1">
              <ChatPanel
                :messages="selectedMessages"
                :loading="loadingConversation"
                :sending="sending"
                show-sender-name
                :is-own-message="(m) => m.senderType === 'user'"
                placeholder="Balas..."
                @send="onSend"
              />
            </div>
          </template>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
