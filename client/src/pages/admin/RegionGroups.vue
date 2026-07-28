<script setup>
import { ref, onMounted, reactive } from 'vue'
import { listAdminRegionGroups, createRegionGroup, updateRegionGroup, deleteRegionGroup } from '../../api/regionGroups.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseFileInput from '../../components/ui/BaseFileInput.vue'
import BaseModal from '../../components/ui/BaseModal.vue'

const regionGroups = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const errorMsg = ref('')
const editingId = ref(null)
const formModalOpen = ref(false)
const deleteTarget = ref(null)
const uploadingImage = ref(false)

const emptyForm = () => ({ name: '', image_url: '', sort_order: 0, is_active: true })
const form = reactive(emptyForm())

async function load() {
  loading.value = true
  regionGroups.value = await listAdminRegionGroups()
  loading.value = false
}

onMounted(load)

function startCreate() {
  editingId.value = 'new'
  errorMsg.value = ''
  Object.assign(form, emptyForm())
  formModalOpen.value = true
}

function startEdit(r) {
  editingId.value = r.id
  errorMsg.value = ''
  Object.assign(form, {
    name: r.name,
    image_url: r.image_url || '',
    sort_order: r.sort_order,
    is_active: r.is_active,
  })
  formModalOpen.value = true
}

async function onSave() {
  errorMsg.value = ''
  if (!form.name) {
    errorMsg.value = 'Nama wilayah wajib diisi.'
    return
  }
  if (uploadingImage.value) {
    errorMsg.value = 'Tunggu gambar selesai diunggah terlebih dahulu.'
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.name,
      image_url: form.image_url || undefined,
      sort_order: Number(form.sort_order) || 0,
      is_active: Boolean(form.is_active),
    }
    if (editingId.value === 'new') {
      await createRegionGroup(payload)
    } else {
      await updateRegionGroup(editingId.value, payload)
    }
    formModalOpen.value = false
    await load()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal menyimpan wilayah.'
  } finally {
    saving.value = false
  }
}

async function onToggleActive(r) {
  await updateRegionGroup(r.id, { is_active: !r.is_active })
  await load()
}

function confirmDelete(r) {
  deleteTarget.value = r
}

async function onDeleteConfirmed() {
  deleting.value = true
  try {
    await deleteRegionGroup(deleteTarget.value.id)
    deleteTarget.value = null
    await load()
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Wilayah Pengiriman</h1>
        <p class="mt-1 text-sm text-slate-500">
          Dipakai sebagai pilihan tujuan kirim di tampilan awal landing page. Produk bisa ditandai ke salah satu
          wilayah ini di menu Produk / Etalase.
        </p>
      </div>
      <BaseButton @click="startCreate">+ Tambah Wilayah</BaseButton>
    </div>

    <BaseCard class="mt-6 !p-0">
      <p v-if="loading" class="p-6 text-center text-sm text-slate-500">Memuat...</p>
      <p v-else-if="!regionGroups.length" class="p-6 text-center text-sm text-slate-500">Belum ada wilayah.</p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th class="px-4 py-3 font-medium">Wilayah</th>
              <th class="px-4 py-3 font-medium">Urutan</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="r in regionGroups" :key="r.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="r.image_url"
                    :src="r.image_url"
                    :alt="r.name"
                    class="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div v-else class="h-10 w-10 shrink-0 rounded-lg bg-emerald-50" />
                  <span class="font-medium text-slate-900">{{ r.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ r.sort_order }}</td>
              <td class="px-4 py-3">
                <span :class="r.is_active ? 'text-emerald-600' : 'text-slate-400'" class="text-xs font-medium">
                  {{ r.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <BaseButton variant="secondary" @click="startEdit(r)">Edit</BaseButton>
                  <BaseButton variant="secondary" @click="onToggleActive(r)">
                    {{ r.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                  </BaseButton>
                  <BaseButton variant="danger" @click="confirmDelete(r)">Hapus</BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <BaseModal
      v-model="formModalOpen"
      :title="editingId === 'new' ? 'Wilayah Baru' : 'Edit Wilayah'"
      max-width="max-w-lg"
    >
      <div class="space-y-4">
        <BaseInput v-model="form.name" label="Nama Wilayah" placeholder="mis. Jabodetabek" required />
        <BaseInput v-model="form.sort_order" label="Urutan Tampil" type="number" />

        <div>
          <BaseFileInput
            label="Gambar/Ikon (opsional)"
            @uploaded="(url) => (form.image_url = url)"
            @uploading="(v) => (uploadingImage = v)"
          />
          <div v-if="form.image_url" class="mt-2 flex items-center gap-3">
            <img :src="form.image_url" class="h-24 w-24 rounded-lg object-cover" />
            <button
              type="button"
              class="text-xs font-medium text-rose-600 hover:underline"
              @click="form.image_url = ''"
            >
              Hapus gambar
            </button>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input v-model="form.is_active" type="checkbox" class="rounded border-slate-300" />
          Tampilkan sebagai pilihan wilayah di landing page
        </label>
        <p v-if="errorMsg" class="text-sm text-rose-600">{{ errorMsg }}</p>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="formModalOpen = false">Batal</BaseButton>
        <BaseButton :loading="saving" :disabled="uploadingImage" @click="onSave">
          {{ uploadingImage ? 'Menunggu upload...' : 'Simpan' }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal :model-value="Boolean(deleteTarget)" title="Hapus Wilayah?" @update:model-value="deleteTarget = null">
      <p class="text-sm text-slate-600">
        Yakin ingin menghapus wilayah "<strong>{{ deleteTarget?.name }}</strong>"? Produk yang ditandai ke wilayah
        ini akan menjadi tampil untuk semua wilayah.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="deleteTarget = null">Batal</BaseButton>
        <BaseButton variant="danger" :loading="deleting" @click="onDeleteConfirmed">Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
