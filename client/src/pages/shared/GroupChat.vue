<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getGroupChat, sendGroupMessage } from '../../api/chat.api'
import { getSocket } from '../../sockets/socket'
import { useAuthStore } from '../../stores/auth.store'
import { useGroupChatStore } from '../../stores/groupChat.store'
import BaseCard from '../../components/ui/BaseCard.vue'
import ChatPanel from '../../components/domain/ChatPanel.vue'

const auth = useAuthStore()
const groupChatStore = useGroupChatStore()
const messages = ref([])
const loading = ref(true)
const sending = ref(false)

function onSocketMessage(msg) {
  messages.value.push(msg)
}

async function load() {
  loading.value = true
  try {
    const data = await getGroupChat()
    messages.value = data.messages
  } finally {
    loading.value = false
  }
}

async function onSend(body) {
  sending.value = true
  try {
    await sendGroupMessage(body)
    // The server broadcasts to the whole 'group-chat' room including us, so
    // the message will arrive via the socket listener — no local push here.
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  load()
  groupChatStore.clearUnread()
  getSocket()?.on('chat:group-message', onSocketMessage)
})

onBeforeUnmount(() => {
  getSocket()?.off('chat:group-message', onSocketMessage)
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Chat Komunitas</h1>
    <p class="mt-1 text-sm text-slate-500">Ruang obrolan bersama untuk semua pengrajin & admin.</p>

    <BaseCard class="mt-6 !p-0">
      <div style="height: 32rem">
        <ChatPanel
          :messages="messages"
          :loading="loading"
          :sending="sending"
          show-sender-name
          :is-own-message="(m) => m.senderUserId === auth.user?.id"
          placeholder="Tulis pesan ke komunitas..."
          empty-text="Belum ada obrolan. Sapa komunitas pengrajin!"
          @send="onSend"
        />
      </div>
    </BaseCard>
  </div>
</template>
