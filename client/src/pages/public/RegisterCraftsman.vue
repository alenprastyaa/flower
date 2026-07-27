<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import RegionSelect from '../../components/domain/RegionSelect.vue'

const form = reactive({
  full_name: '',
  email: '',
  password: '',
  phone: '',
  store_name: '',
  bio: '',
})
const region = ref({ province: '', city: '' })
const error = ref('')
const success = ref(false)
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function onSubmit() {
  error.value = ''
  if (!region.value.province || !region.value.city) {
    error.value = 'Pilih Provinsi dan Kota/Kabupaten terlebih dahulu.'
    return
  }
  loading.value = true
  try {
    await auth.register({ ...form, province: region.value.province, city: region.value.city })
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.error || 'Pendaftaran gagal, coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-16">
    <BaseCard>
      <h1 class="text-xl font-semibold text-slate-900">Daftar Sebagai Pengrajin</h1>
      <p class="mt-1 text-sm text-slate-500">Akun akan aktif setelah disetujui admin.</p>

      <div v-if="success" class="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        Pendaftaran berhasil! Silakan tunggu persetujuan admin, lalu
        <router-link to="/masuk" class="font-medium underline">masuk di sini</router-link>.
      </div>

      <form v-else class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <BaseInput v-model="form.full_name" label="Nama Lengkap" required />
        <BaseInput v-model="form.email" label="Email" type="email" required />
        <BaseInput v-model="form.password" label="Password" type="password" required />
        <BaseInput v-model="form.phone" label="No. HP" required />
        <BaseInput v-model="form.store_name" label="Nama Toko/Etalase" required />

        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">Lokasi Toko</p>
          <RegionSelect v-model="region" :levels="2" />
        </div>

        <BaseInput v-model="form.bio" label="Deskripsi Singkat" as="textarea" />
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        <BaseButton type="submit" class="w-full" :loading="loading">Daftar</BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
