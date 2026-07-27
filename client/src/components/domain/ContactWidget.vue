<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { getVisitorChat, sendVisitorChatMessage } from '../../api/chat.api'
import { getVisitorId, getVisitorName, setVisitorName, getLastReadAt, setLastReadAt } from '../../services/visitorIdentity'
import ChatPanel from './ChatPanel.vue'

const visitorId = getVisitorId()
const open = ref(false)
const nameDraft = ref(getVisitorName())
const hasName = ref(Boolean(getVisitorName()))
const messages = ref([])
const loading = ref(true)
const sending = ref(false)
const unreadCount = ref(0)
let socket = null

function connectSocket() {
  socket = io({ auth: {} })
  socket.on('connect', () => socket.emit('join-visitor-chat', { visitorId }))
  socket.on('chat:order-message', (msg) => {
    if (msg.senderType === 'buyer') return // our own message, appended optimistically already
    messages.value.push(msg)
    if (!open.value) unreadCount.value += 1
  })
}

// Catch up on admin replies that arrived while the widget was closed or the
// page wasn't even loaded — compare stored history against the last time
// this visitor actually opened the panel, not just live socket events.
async function loadExisting() {
  loading.value = true
  try {
    const data = await getVisitorChat(visitorId)
    messages.value = data.messages
    const lastReadAt = getLastReadAt()
    unreadCount.value = messages.value.filter(
      (m) => m.senderType === 'user' && (!lastReadAt || new Date(m.createdAt) > new Date(lastReadAt))
    ).length
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  connectSocket()
  if (hasName.value) loadExisting()
  else loading.value = false
})

onBeforeUnmount(() => {
  socket?.disconnect()
})

function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    unreadCount.value = 0
    setLastReadAt(new Date().toISOString())
  }
}

function onStartChat() {
  const name = nameDraft.value.trim()
  if (!name) return
  setVisitorName(name)
  hasName.value = true
}

async function onSend(body) {
  sending.value = true
  try {
    const name = getVisitorName()
    const msg = await sendVisitorChatMessage(visitorId, body, name)
    messages.value.push(msg)
  } finally {
    sending.value = false
  }
}

const panelHeight = computed(() => (hasName.value ? '28rem' : 'auto'))
</script>

<template>
  <div class="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
    <div
      v-if="open"
      class="flex w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96"
      :style="{ maxHeight: '80vh' }"
    >
      <div class="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
        <div>
          <p class="text-sm font-semibold">Tanya Kami</p>
          <p class="text-xs text-emerald-100">Biasanya balas dalam beberapa menit</p>
        </div>
        <button class="rounded-md p-1 hover:bg-emerald-700" aria-label="Tutup" @click="toggleOpen">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="!hasName" class="space-y-3 p-4">
        <p class="text-sm text-slate-600">Siapa nama Anda? Supaya admin tahu harus memanggil siapa.</p>
        <input
          v-model="nameDraft"
          type="text"
          placeholder="Nama Anda"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          @keydown.enter="onStartChat"
        />
        <button
          type="button"
          class="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          :disabled="!nameDraft.trim()"
          @click="onStartChat"
        >
          Mulai Chat
        </button>
      </div>

      <div v-else :style="{ height: panelHeight }">
        <ChatPanel
          :messages="messages"
          :loading="loading"
          :sending="sending"
          :is-own-message="(m) => m.senderType === 'buyer'"
          placeholder="Tulis pertanyaan Anda..."
          empty-text="Ada yang ingin ditanyakan? Kami siap membantu."
          @send="onSend"
        />
      </div>
    </div>

    <button
      type="button"
      class="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
      aria-label="Buka chat"
      @click="toggleOpen"
    >
      <svg v-if="!open" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        />
      </svg>
      <svg v-else class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white ring-2 ring-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>
  </div>
</template>
