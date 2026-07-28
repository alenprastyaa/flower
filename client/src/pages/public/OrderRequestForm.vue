<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { submitOrder } from '../../api/orders.api'
import { listPublicProducts } from '../../api/products.api'
import { listPublicRegionGroups } from '../../api/regionGroups.api'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import RegionSelect from '../../components/domain/RegionSelect.vue'

const route = useRoute()
const router = useRouter()

const product = ref(null)
const loadingProduct = ref(true)
const notFound = ref(false)

const form = reactive({
  buyer_name: '',
  buyer_phone: '',
  buyer_email: '',
  occasion: '',
  needed_by_date: '',
  description: '',
  delivery_address: '',
})

const region = ref({ province: '', city: '', district: '', village: '' })

const error = ref('')
const loading = ref(false)

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

onMounted(async () => {
  const productId = Number(route.params.productId)
  const products = await listPublicProducts()
  product.value = products.find((p) => p.id === productId) || null
  notFound.value = !product.value

  // If the buyer already picked a region on the landing page and that
  // region maps to a single official province, pre-fill it here — the
  // RegionSelect below only reads `region.value` once, on its own mount,
  // so this must be set before `loadingProduct` flips the form into view.
  const regionGroupId = Number(route.query.regionGroupId)
  if (product.value && regionGroupId) {
    const regionGroups = await listPublicRegionGroups()
    const matched = regionGroups.find((r) => r.id === regionGroupId)
    if (matched?.province_name) {
      region.value = { ...region.value, province: matched.province_name }
    }
  }

  loadingProduct.value = false
})

const canSubmit = computed(() => Boolean(product.value))

async function onSubmit() {
  if (!product.value) return
  error.value = ''

  if (!region.value.province || !region.value.city || !region.value.district || !region.value.village) {
    error.value = 'Lengkapi Provinsi, Kota/Kabupaten, Kecamatan, dan Kelurahan/Desa terlebih dahulu.'
    return
  }

  loading.value = true
  try {
    const payload = {
      ...form,
      delivery_province: region.value.province,
      delivery_city: region.value.city,
      delivery_district: region.value.district,
      delivery_village: region.value.village,
      product_id: product.value.id,
      buyer_email: form.buyer_email || undefined,
    }
    const { trackingToken } = await submitOrder(payload)
    router.push(`/pesan/sukses/${trackingToken}`)
  } catch (err) {
    error.value = err.response?.data?.error || 'Gagal mengirim pesanan, coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-12">
    <p v-if="loadingProduct" class="text-sm text-slate-500">Memuat...</p>

    <div v-else-if="notFound" class="text-center">
      <p class="text-sm text-rose-600">Produk tidak ditemukan atau sudah tidak tersedia.</p>
      <router-link to="/" class="mt-4 inline-block text-sm text-emerald-700 hover:underline">
        Kembali ke etalase
      </router-link>
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold text-slate-900">Lengkapi Pesanan</h1>
      <p class="mt-1 text-sm text-slate-500">
        Pesanan Anda akan ditinjau oleh admin, lalu dipublikasikan agar pengrajin dapat mengerjakannya.
      </p>

      <BaseCard class="mt-6 flex items-center gap-4">
        <img
          v-if="product.image_url"
          :src="product.image_url"
          :alt="product.name"
          class="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
        <div class="min-w-0">
          <p class="truncate font-semibold text-slate-900">{{ product.name }}</p>
          <p v-if="product.subtitle" class="truncate text-sm text-slate-500">{{ product.subtitle }}</p>
          <p class="font-semibold text-emerald-700">{{ formatPrice(product.price) }}</p>
        </div>
      </BaseCard>

      <BaseCard class="mt-4">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BaseInput v-model="form.buyer_name" label="Nama Anda" required />
            <BaseInput v-model="form.buyer_phone" label="No. HP" required />
          </div>
          <BaseInput v-model="form.buyer_email" label="Email (opsional)" type="email" />

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BaseInput v-model="form.occasion" label="Acara/Keperluan (opsional)" placeholder="mis. pernikahan, duka cita" />
            <BaseInput v-model="form.needed_by_date" label="Dibutuhkan Tanggal" type="date" required />
          </div>

          <BaseInput
            v-model="form.description"
            label="Teks Ucapan pada Karangan"
            placeholder='mis. "Turut Berduka Cita" atau "Selamat & Sukses"'
            as="textarea"
            :rows="3"
            required
          />

          <div class="border-t border-slate-100 pt-4">
            <p class="mb-3 text-sm font-semibold text-slate-700">Alamat Pengiriman</p>
            <RegionSelect v-model="region" />
            <BaseInput
              v-model="form.delivery_address"
              label="Alamat Lengkap (Jalan, No. Rumah, RT/RW, Patokan)"
              as="textarea"
              :rows="3"
              class="mt-4"
              required
            />
          </div>

          <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
          <BaseButton type="submit" class="w-full" :loading="loading" :disabled="!canSubmit">Kirim Pesanan</BaseButton>
        </form>
      </BaseCard>
    </template>
  </div>
</template>
