<script setup>
import { ref, watch, nextTick } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  messages: { type: Array, required: true },
  isOwnMessage: { type: Function, required: true },
  showSenderName: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  sending: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Tulis pesan...' },
  emptyText: { type: String, default: 'Belum ada pesan. Mulai percakapan!' },
})
const emit = defineEmits(['send'])

const draft = ref('')
const scrollEl = ref(null)

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  })
}

watch(() => props.messages.length, scrollToBottom)
watch(
  () => props.loading,
  (loading) => {
    if (!loading) scrollToBottom()
  }
)

function onSend() {
  const body = draft.value.trim()
  if (!body || props.sending) return
  emit('send', body)
  draft.value = ''
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    onSend()
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div ref="scrollEl" class="flex-1 space-y-3 overflow-y-auto p-4">
      <p v-if="loading" class="text-center text-sm text-slate-400">Memuat...</p>
      <p v-else-if="!messages.length" class="text-center text-sm text-slate-400">{{ emptyText }}</p>

      <div
        v-for="m in messages"
        :key="m.id"
        class="flex flex-col"
        :class="isOwnMessage(m) ? 'items-end' : 'items-start'"
      >
        <span v-if="showSenderName && !isOwnMessage(m)" class="mb-0.5 px-1 text-xs font-medium text-slate-500">
          {{ m.senderName }}
        </span>
        <div
          class="max-w-[80%] rounded-2xl px-3.5 py-2 text-sm"
          :class="
            isOwnMessage(m)
              ? 'rounded-br-sm bg-emerald-600 text-white'
              : 'rounded-bl-sm bg-slate-100 text-slate-800'
          "
        >
          {{ m.body }}
        </div>
        <span class="mt-0.5 px-1 text-[11px] text-slate-400">{{ formatTime(m.createdAt) }}</span>
      </div>
    </div>

    <div class="flex items-end gap-2 border-t border-slate-100 p-3">
      <textarea
        v-model="draft"
        :placeholder="placeholder"
        rows="1"
        class="max-h-24 flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        @keydown="onKeydown"
      />
      <BaseButton :loading="sending" :disabled="!draft.trim()" @click="onSend">Kirim</BaseButton>
    </div>
  </div>
</template>
