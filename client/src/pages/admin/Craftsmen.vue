<script setup>
import { ref, onMounted } from 'vue'
import { listCraftsmen, approveCraftsman, suspendCraftsman } from '../../api/admin.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'

const craftsmen = ref([])
const loading = ref(true)
const busyId = ref(null)
const suspendTarget = ref(null)
const suspending = ref(false)

async function load() {
  loading.value = true
  craftsmen.value = await listCraftsmen()
  loading.value = false
}

onMounted(load)

async function onApprove(c) {
  busyId.value = c.id
  try {
    await approveCraftsman(c.id)
    await load()
  } finally {
    busyId.value = null
  }
}

async function onConfirmSuspend() {
  suspending.value = true
  try {
    await suspendCraftsman(suspendTarget.value.id)
    suspendTarget.value = null
    await load()
  } finally {
    suspending.value = false
  }
}
</script>

<template>
  <div>
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">Pengrajin</h1>
      <p class="mt-1 text-sm text-slate-500">{{ craftsmen.length }} pengrajin terdaftar</p>
    </div>

    <BaseCard class="mt-6 !p-0">
      <p v-if="loading" class="p-6 text-center text-sm text-slate-500">Memuat...</p>
      <p v-else-if="!craftsmen.length" class="p-6 text-center text-sm text-slate-500">Belum ada pengrajin.</p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th class="px-4 py-3 font-medium">Toko</th>
              <th class="px-4 py-3 font-medium">Kota</th>
              <th class="px-4 py-3 font-medium">Rating</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in craftsmen" :key="c.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <p class="font-medium text-slate-900">{{ c.store_name }}</p>
                <p class="text-xs text-slate-500">{{ c.user?.email }}</p>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ c.city || '-' }}</td>
              <td class="px-4 py-3 text-slate-500">
                <span v-if="c.rating_count">★ {{ Number(c.rating_avg).toFixed(1) }} ({{ c.rating_count }})</span>
                <span v-else class="text-slate-300">Belum ada</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1.5 text-xs font-medium">
                  <span :class="c.user?.is_approved ? 'text-emerald-600' : 'text-amber-600'">
                    {{ c.user?.is_approved ? 'Disetujui' : 'Menunggu' }}
                  </span>
                  <span class="text-slate-300">·</span>
                  <span :class="c.user?.is_active ? 'text-emerald-600' : 'text-rose-600'">
                    {{ c.user?.is_active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <BaseButton v-if="!c.user?.is_approved" :loading="busyId === c.id" @click="onApprove(c)">
                    Setujui
                  </BaseButton>
                  <BaseButton v-if="c.user?.is_active" variant="danger" @click="suspendTarget = c">
                    Nonaktifkan
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <BaseModal :model-value="Boolean(suspendTarget)" title="Nonaktifkan Pengrajin?" @update:model-value="suspendTarget = null">
      <p class="text-sm text-slate-600">
        Yakin ingin menonaktifkan toko "<strong>{{ suspendTarget?.store_name }}</strong>"? Pengrajin ini tidak akan
        bisa masuk atau mengklaim campaign sampai diaktifkan kembali.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="suspendTarget = null">Batal</BaseButton>
        <BaseButton variant="danger" :loading="suspending" @click="onConfirmSuspend">Nonaktifkan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
