<script setup>
import { ref, onMounted, reactive } from 'vue'
import { listAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api/products.api'
import { listAdminRegionGroups } from '../../api/regionGroups.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseFileInput from '../../components/ui/BaseFileInput.vue'
import BaseModal from '../../components/ui/BaseModal.vue'

const products = ref([])
const regionGroups = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const errorMsg = ref('')
const editingId = ref(null)
const formModalOpen = ref(false)
const deleteTarget = ref(null)
const uploadingImage = ref(false)

const emptyForm = () => ({
  name: '',
  subtitle: '',
  price: '',
  category: '',
  region_group_id: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
})
const form = reactive(emptyForm())

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

function regionName(id) {
  return regionGroups.value.find((r) => r.id === id)?.name
}

async function load() {
  loading.value = true
  const [productList, regionList] = await Promise.all([listAdminProducts(), listAdminRegionGroups()])
  products.value = productList
  regionGroups.value = regionList
  loading.value = false
}

onMounted(load)

function startCreate() {
  editingId.value = 'new'
  errorMsg.value = ''
  Object.assign(form, emptyForm())
  formModalOpen.value = true
}

function startEdit(p) {
  editingId.value = p.id
  errorMsg.value = ''
  Object.assign(form, {
    name: p.name,
    subtitle: p.subtitle || '',
    price: p.price,
    category: p.category || '',
    region_group_id: p.region_group_id || '',
    image_url: p.image_url || '',
    sort_order: p.sort_order,
    is_active: p.is_active,
  })
  formModalOpen.value = true
}

async function onSave() {
  errorMsg.value = ''
  if (!form.name || !form.price) {
    errorMsg.value = 'Nama dan harga wajib diisi.'
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
      subtitle: form.subtitle || undefined,
      price: Number(form.price),
      category: form.category || undefined,
      region_group_id: form.region_group_id ? Number(form.region_group_id) : null,
      image_url: form.image_url || undefined,
      sort_order: Number(form.sort_order) || 0,
      is_active: Boolean(form.is_active),
    }
    if (editingId.value === 'new') {
      await createProduct(payload)
    } else {
      await updateProduct(editingId.value, payload)
    }
    formModalOpen.value = false
    await load()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal menyimpan produk.'
  } finally {
    saving.value = false
  }
}

async function onToggleActive(p) {
  await updateProduct(p.id, { is_active: !p.is_active })
  await load()
}

function confirmDelete(p) {
  deleteTarget.value = p
}

async function onDeleteConfirmed() {
  deleting.value = true
  try {
    await deleteProduct(deleteTarget.value.id)
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
        <h1 class="text-2xl font-semibold text-slate-900">Produk / Etalase</h1>
        <p class="mt-1 text-sm text-slate-500">{{ products.length }} produk</p>
      </div>
      <BaseButton @click="startCreate">+ Tambah Produk</BaseButton>
    </div>

    <BaseCard class="mt-6 !p-0">
      <p v-if="loading" class="p-6 text-center text-sm text-slate-500">Memuat...</p>
      <p v-else-if="!products.length" class="p-6 text-center text-sm text-slate-500">Belum ada produk.</p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th class="px-4 py-3 font-medium">Produk</th>
              <th class="px-4 py-3 font-medium">Harga</th>
              <th class="px-4 py-3 font-medium">Kategori</th>
              <th class="px-4 py-3 font-medium">Wilayah</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="p in products" :key="p.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="p.image_url"
                    :src="p.image_url"
                    :alt="p.name"
                    class="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div v-else class="h-10 w-10 shrink-0 rounded-lg bg-emerald-50" />
                  <span class="font-medium text-slate-900">{{ p.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 font-medium text-emerald-700">{{ formatPrice(p.price) }}</td>
              <td class="px-4 py-3 text-slate-500">{{ p.category || '-' }}</td>
              <td class="px-4 py-3 text-slate-500">{{ regionName(p.region_group_id) || 'Semua wilayah' }}</td>
              <td class="px-4 py-3">
                <span :class="p.is_active ? 'text-emerald-600' : 'text-slate-400'" class="text-xs font-medium">
                  {{ p.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <BaseButton variant="secondary" @click="startEdit(p)">Edit</BaseButton>
                  <BaseButton variant="secondary" @click="onToggleActive(p)">
                    {{ p.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                  </BaseButton>
                  <BaseButton variant="danger" @click="confirmDelete(p)">Hapus</BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <BaseModal
      v-model="formModalOpen"
      :title="editingId === 'new' ? 'Produk Baru' : 'Edit Produk'"
      max-width="max-w-lg"
    >
      <div class="space-y-4">
        <BaseInput v-model="form.name" label="Nama Produk" required />
        <BaseInput v-model="form.subtitle" label="Subjudul (opsional)" placeholder='mis. "Jambul 4 setengah papan"' />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.price" label="Harga (Rp)" type="number" required />
          <BaseInput v-model="form.sort_order" label="Urutan Tampil" type="number" />
        </div>
        <BaseInput v-model="form.category" label="Kategori (opsional)" placeholder="mis. Papan Bunga, Buket" />

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Wilayah Pengiriman (opsional)</label>
          <select
            v-model="form.region_group_id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Semua wilayah</option>
            <option v-for="r in regionGroups" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
          <p class="mt-1 text-xs text-slate-400">
            Kosongkan jika produk ini tersedia untuk semua wilayah (mis. buket, bukan papan bunga khusus daerah).
          </p>
        </div>

        <div>
          <BaseFileInput
            label="Gambar Produk"
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
          Tampilkan di etalase publik
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

    <BaseModal :model-value="Boolean(deleteTarget)" title="Hapus Produk?" @update:model-value="deleteTarget = null">
      <p class="text-sm text-slate-600">
        Yakin ingin menghapus produk "<strong>{{ deleteTarget?.name }}</strong>"? Tindakan ini tidak dapat dibatalkan.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="deleteTarget = null">Batal</BaseButton>
        <BaseButton variant="danger" :loading="deleting" @click="onDeleteConfirmed">Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
