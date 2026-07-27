<script setup>
import { ref, onMounted } from 'vue'
import { isNotificationSupported, getPermission, requestNotificationPermission, registerServiceWorker } from '../../services/notifications'

const supported = isNotificationSupported()
const permission = ref(getPermission())

onMounted(() => {
  if (supported) registerServiceWorker()
})

async function onClick() {
  if (!supported || permission.value !== 'default') return
  permission.value = await requestNotificationPermission()
}
</script>

<template>
  <button
    v-if="supported"
    type="button"
    class="relative rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
    :class="{ 'cursor-default': permission !== 'default' }"
    :title="
      permission === 'granted'
        ? 'Notifikasi aktif'
        : permission === 'denied'
          ? 'Notifikasi diblokir di pengaturan browser'
          : 'Aktifkan notifikasi'
    "
    @click="onClick"
  >
    <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9ZM10.3 21a1.94 1.94 0 0 0 3.4 0"
      />
    </svg>
    <span
      v-if="permission === 'granted'"
      class="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500"
    />
  </button>
</template>
