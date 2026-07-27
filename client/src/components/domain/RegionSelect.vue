<script setup>
import { ref, onMounted, watch } from 'vue'
import { listProvinces, listRegencies, listDistricts, listVillages } from '../../api/regions.api'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ province: '', city: '', district: '', village: '' }),
  },
  // 2 = Provinsi + Kota/Kabupaten only (e.g. business/profile location).
  // 4 = full cascade down to Kelurahan/Desa (e.g. delivery address).
  levels: { type: Number, default: 4 },
})
const emit = defineEmits(['update:modelValue'])

const provinces = ref([])
const regencies = ref([])
const districts = ref([])
const villages = ref([])

const provinceCode = ref('')
const regencyCode = ref('')
const districtCode = ref('')
const villageCode = ref('')

const loadingProvinces = ref(true)
const loadingRegencies = ref(false)
const loadingDistricts = ref(false)
const loadingVillages = ref(false)
const loadError = ref('')
const initializing = ref(false)

function emitValue(overrides = {}) {
  const findName = (list, code) => list.find((x) => x.code === code)?.name || ''
  emit('update:modelValue', {
    province: findName(provinces.value, provinceCode.value),
    city: findName(regencies.value, regencyCode.value),
    district: findName(districts.value, districtCode.value),
    village: findName(villages.value, villageCode.value),
    ...overrides,
  })
}

async function initFromModelValue() {
  const mv = props.modelValue
  if (!mv?.province) return
  initializing.value = true
  try {
    const matchedProvince = provinces.value.find((p) => p.name.toLowerCase() === mv.province.toLowerCase())
    if (!matchedProvince) return
    provinceCode.value = matchedProvince.code
    loadingRegencies.value = true
    regencies.value = await listRegencies(matchedProvince.code)
    loadingRegencies.value = false
    if (!mv.city) return

    const matchedRegency = regencies.value.find((r) => r.name.toLowerCase() === mv.city.toLowerCase())
    if (!matchedRegency) return
    regencyCode.value = matchedRegency.code
    if (props.levels < 4) return

    loadingDistricts.value = true
    districts.value = await listDistricts(matchedRegency.code)
    loadingDistricts.value = false
    if (!mv.district) return

    const matchedDistrict = districts.value.find((d) => d.name.toLowerCase() === mv.district.toLowerCase())
    if (!matchedDistrict) return
    districtCode.value = matchedDistrict.code

    loadingVillages.value = true
    villages.value = await listVillages(matchedDistrict.code)
    loadingVillages.value = false
    if (!mv.village) return

    const matchedVillage = villages.value.find((v) => v.name.toLowerCase() === mv.village.toLowerCase())
    if (matchedVillage) villageCode.value = matchedVillage.code
  } finally {
    initializing.value = false
  }
}

onMounted(async () => {
  try {
    provinces.value = await listProvinces()
    await initFromModelValue()
  } catch (err) {
    loadError.value = 'Gagal memuat daftar provinsi. Coba muat ulang halaman.'
  } finally {
    loadingProvinces.value = false
  }
})

watch(provinceCode, async (code) => {
  if (initializing.value) return
  regencyCode.value = ''
  districtCode.value = ''
  villageCode.value = ''
  regencies.value = []
  districts.value = []
  villages.value = []
  emitValue({ city: '', district: '', village: '' })
  if (!code) return

  loadingRegencies.value = true
  loadError.value = ''
  try {
    regencies.value = await listRegencies(code)
  } catch (err) {
    loadError.value = 'Gagal memuat daftar kota/kabupaten.'
  } finally {
    loadingRegencies.value = false
  }
})

watch(regencyCode, async (code) => {
  if (initializing.value) return
  districtCode.value = ''
  villageCode.value = ''
  districts.value = []
  villages.value = []
  emitValue({ district: '', village: '' })
  if (!code || props.levels < 4) return

  loadingDistricts.value = true
  loadError.value = ''
  try {
    districts.value = await listDistricts(code)
  } catch (err) {
    loadError.value = 'Gagal memuat daftar kecamatan.'
  } finally {
    loadingDistricts.value = false
  }
})

watch(districtCode, async (code) => {
  if (initializing.value) return
  villageCode.value = ''
  villages.value = []
  emitValue({ village: '' })
  if (!code) return

  loadingVillages.value = true
  loadError.value = ''
  try {
    villages.value = await listVillages(code)
  } catch (err) {
    loadError.value = 'Gagal memuat daftar kelurahan/desa.'
  } finally {
    loadingVillages.value = false
  }
})

watch(villageCode, () => {
  if (!initializing.value) emitValue()
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Provinsi <span class="text-rose-500">*</span></span>
      <select
        v-model="provinceCode"
        :disabled="loadingProvinces"
        required
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
      >
        <option value="" disabled>{{ loadingProvinces ? 'Memuat...' : 'Pilih provinsi' }}</option>
        <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
      </select>
    </label>

    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Kota/Kabupaten <span class="text-rose-500">*</span></span>
      <select
        v-model="regencyCode"
        :disabled="!provinceCode || loadingRegencies"
        required
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
      >
        <option value="" disabled>{{ loadingRegencies ? 'Memuat...' : 'Pilih kota/kabupaten' }}</option>
        <option v-for="r in regencies" :key="r.code" :value="r.code">{{ r.name }}</option>
      </select>
    </label>

    <template v-if="levels >= 4">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700">Kecamatan <span class="text-rose-500">*</span></span>
        <select
          v-model="districtCode"
          :disabled="!regencyCode || loadingDistricts"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
        >
          <option value="" disabled>{{ loadingDistricts ? 'Memuat...' : 'Pilih kecamatan' }}</option>
          <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
        </select>
      </label>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700">Kelurahan/Desa <span class="text-rose-500">*</span></span>
        <select
          v-model="villageCode"
          :disabled="!districtCode || loadingVillages"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
        >
          <option value="" disabled>{{ loadingVillages ? 'Memuat...' : 'Pilih kelurahan/desa' }}</option>
          <option v-for="v in villages" :key="v.code" :value="v.code">{{ v.name }}</option>
        </select>
      </label>
    </template>

    <p v-if="loadError" class="text-sm text-rose-600 sm:col-span-2">{{ loadError }}</p>
  </div>
</template>
