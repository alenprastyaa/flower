<script setup>
import { reactive, ref, onMounted } from 'vue'
import {
  getMyProfile,
  updateMyProfile,
  listMyPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
} from '../../api/craftsmen.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseFileInput from '../../components/ui/BaseFileInput.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import RegionSelect from '../../components/domain/RegionSelect.vue'

const form = reactive({ store_name: '', bio: '', avatar_url: '', cover_image_url: '' })
const region = ref({ province: '', city: '' })
const portfolio = ref([])
const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')
const uploadingAvatar = ref(false)
const uploadingCover = ref(false)

const addModalOpen = ref(false)
const newCaption = ref('')
const newImageUrl = ref('')
const adding = ref(false)
const uploadingPortfolioImage = ref(false)

const deleteTarget = ref(null)
const deleting = ref(false)

async function load() {
  loading.value = true
  const [profile, items] = await Promise.all([getMyProfile(), listMyPortfolio()])
  Object.assign(form, {
    store_name: profile.store_name || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    cover_image_url: profile.cover_image_url || '',
  })
  region.value = { province: profile.province || '', city: profile.city || '' }
  portfolio.value = items
  loading.value = false
}

onMounted(load)

async function onSaveProfile() {
  errorMsg.value = ''
  if (uploadingAvatar.value || uploadingCover.value) {
    errorMsg.value = 'Tunggu gambar selesai diunggah terlebih dahulu.'
    return
  }
  if (!region.value.province || !region.value.city) {
    errorMsg.value = 'Pilih Provinsi dan Kota/Kabupaten terlebih dahulu.'
    return
  }
  saving.value = true
  try {
    await updateMyProfile({ ...form, province: region.value.province, city: region.value.city })
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal menyimpan profil.'
  } finally {
    saving.value = false
  }
}

async function onAvatarUploaded(url) {
  form.avatar_url = url
}
async function onCoverUploaded(url) {
  form.cover_image_url = url
}

function openAddModal() {
  newCaption.value = ''
  newImageUrl.value = ''
  addModalOpen.value = true
}

async function onSaveNewPortfolioItem() {
  if (!newImageUrl.value || uploadingPortfolioImage.value) return
  adding.value = true
  try {
    await addPortfolioItem({ image_url: newImageUrl.value, caption: newCaption.value || undefined })
    portfolio.value = await listMyPortfolio()
    addModalOpen.value = false
  } finally {
    adding.value = false
  }
}

async function onConfirmDeletePortfolioItem() {
  deleting.value = true
  try {
    await deletePortfolioItem(deleteTarget.value.id)
    portfolio.value = portfolio.value.filter((p) => p.id !== deleteTarget.value.id)
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-900">Etalase Saya</h1>

    <p v-if="loading" class="mt-6 text-sm text-slate-500">Memuat...</p>

    <template v-else>
      <BaseCard class="mt-6 max-w-xl">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Profil Toko</h2>
        <div class="mt-4 space-y-4">
          <BaseInput v-model="form.store_name" label="Nama Toko" />

          <div>
            <p class="mb-2 text-sm font-medium text-slate-700">Lokasi Toko</p>
            <RegionSelect v-model="region" :levels="2" />
          </div>

          <BaseInput v-model="form.bio" label="Bio" as="textarea" />

          <div>
            <BaseFileInput label="Foto Profil" @uploaded="onAvatarUploaded" @uploading="(v) => (uploadingAvatar = v)" />
            <div v-if="form.avatar_url" class="mt-2 flex items-center gap-3">
              <img :src="form.avatar_url" class="h-16 w-16 rounded-full object-cover" />
              <button type="button" class="text-xs font-medium text-rose-600 hover:underline" @click="form.avatar_url = ''">
                Hapus
              </button>
            </div>
          </div>

          <div>
            <BaseFileInput label="Foto Sampul" @uploaded="onCoverUploaded" @uploading="(v) => (uploadingCover = v)" />
            <div v-if="form.cover_image_url" class="mt-2 space-y-2">
              <img :src="form.cover_image_url" class="h-24 w-full rounded-lg object-cover" />
              <button type="button" class="text-xs font-medium text-rose-600 hover:underline" @click="form.cover_image_url = ''">
                Hapus
              </button>
            </div>
          </div>

          <p v-if="errorMsg" class="text-sm text-rose-600">{{ errorMsg }}</p>
          <BaseButton :loading="saving" :disabled="uploadingAvatar || uploadingCover" @click="onSaveProfile">
            {{ uploadingAvatar || uploadingCover ? 'Menunggu upload...' : 'Simpan Profil' }}
          </BaseButton>
        </div>
      </BaseCard>

      <div class="mt-8 flex items-center justify-between">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Portofolio Saya</h2>
        <BaseButton @click="openAddModal">+ Tambah Karya</BaseButton>
      </div>

      <div v-if="!portfolio.length" class="mt-3 text-sm text-slate-500">Belum ada karya diunggah.</div>
      <div v-else class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div v-for="item in portfolio" :key="item.id" class="group relative overflow-hidden rounded-xl bg-slate-100">
          <img :src="item.image_url" :alt="item.caption" class="aspect-square w-full object-cover" />
          <button
            class="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-xs text-rose-600 shadow sm:opacity-0 sm:group-hover:opacity-100"
            @click="deleteTarget = item"
          >
            Hapus
          </button>
        </div>
      </div>
    </template>

    <BaseModal v-model="addModalOpen" title="Tambah Karya Portofolio">
      <div class="space-y-3">
        <BaseInput v-model="newCaption" label="Keterangan (opsional)" />
        <BaseFileInput
          label="Unggah Foto Karya"
          @uploaded="(url) => (newImageUrl = url)"
          @uploading="(v) => (uploadingPortfolioImage = v)"
        />
        <img v-if="newImageUrl" :src="newImageUrl" class="h-32 w-32 rounded-lg object-cover" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="addModalOpen = false">Batal</BaseButton>
        <BaseButton :loading="adding" :disabled="!newImageUrl || uploadingPortfolioImage" @click="onSaveNewPortfolioItem">
          Simpan
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal :model-value="Boolean(deleteTarget)" title="Hapus Karya?" @update:model-value="deleteTarget = null">
      <p class="text-sm text-slate-600">Yakin ingin menghapus karya ini dari portofolio Anda?</p>
      <img v-if="deleteTarget" :src="deleteTarget.image_url" class="mt-3 h-24 w-24 rounded-lg object-cover" />
      <template #footer>
        <BaseButton variant="secondary" @click="deleteTarget = null">Batal</BaseButton>
        <BaseButton variant="danger" :loading="deleting" @click="onConfirmDeletePortfolioItem">Hapus</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
