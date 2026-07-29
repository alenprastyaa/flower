<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listPublicProducts, listPublicProductTaxonomy } from '../../api/products.api'
import { listPublicRegionGroups } from '../../api/regionGroups.api'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

const router = useRouter()
const products = ref([]) // active products only, full fields
const taxonomy = ref([]) // ALL products (active + inactive), minimal fields — drives nav structure
const regionGroups = ref([])
const loading = ref(true)
const zoomProduct = ref(null)

// Navigation is a 3-step funnel, each step conditional on whether there's
// actually a choice to make: group -> sub-category (only if the group has
// more than one) -> region (only if the resolved category has region-tagged
// products) -> product grid. `undefined` means "not yet chosen"; `null` is a
// valid explicit choice ("Semua Wilayah") and must stay distinguishable.
const selectedGroup = ref(null)
const selectedSubCategory = ref(undefined)
const selectedRegionId = ref(undefined)

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

function openZoom(product) {
  zoomProduct.value = product
}

function chooseProduct(product) {
  zoomProduct.value = null
  // Carry the product's own region tag along (not just UI nav state) so it
  // works regardless of how the buyer got here — grid, zoom modal, or the
  // featured teaser that skips region selection entirely.
  const query = product.region_group_id ? { regionGroupId: product.region_group_id } : {}
  router.push({ path: `/pesan/${product.id}`, query })
}

onMounted(async () => {
  loading.value = true
  const [productList, taxonomyList, regionList] = await Promise.all([
    listPublicProducts(),
    listPublicProductTaxonomy(),
    listPublicRegionGroups(),
  ])
  products.value = productList
  taxonomy.value = taxonomyList
  regionGroups.value = regionList
  loading.value = false
})

// Top-level groups: a product's own category_group, or its category when
// ungrouped (so standalone categories like "Papan Bunga" surface directly).
const groups = computed(() => {
  const set = new Set(taxonomy.value.map((p) => p.category_group || p.category).filter(Boolean))
  return [...set]
})

// Sub-categories that exist under a given group — empty for ungrouped
// categories, so that step is skipped entirely for them.
function subCategoriesFor(group) {
  const set = new Set(taxonomy.value.filter((p) => p.category_group === group).map((p) => p.category))
  return [...set]
}

const subCategoriesForGroup = computed(() => (selectedGroup.value ? subCategoriesFor(selectedGroup.value) : []))
const awaitingSubCategoryChoice = computed(
  () => subCategoriesForGroup.value.length > 0 && selectedSubCategory.value === undefined
)

// The actual leaf category once group (+ sub-category, if any) is resolved.
const resolvedCategory = computed(() => {
  if (!selectedGroup.value) return null
  if (subCategoriesForGroup.value.length > 0) return selectedSubCategory.value || null
  return selectedGroup.value
})

function selectGroup(group) {
  selectedGroup.value = group
  selectedSubCategory.value = undefined
  selectedRegionId.value = undefined
}

function backToGroups() {
  selectedGroup.value = null
  selectedSubCategory.value = undefined
  selectedRegionId.value = undefined
}

function selectSubCategory(cat) {
  selectedSubCategory.value = cat
  selectedRegionId.value = undefined
}

function backToSubCategories() {
  selectedSubCategory.value = undefined
  selectedRegionId.value = undefined
}

function selectRegion(id) {
  selectedRegionId.value = id
}

function backToRegions() {
  selectedRegionId.value = undefined
}

// Regions with an ACTIVE product tagged under the resolved category — only
// active products define a meaningful region choice; a category still fully
// in placeholder form skips straight to "belum ada produk" instead.
const regionsForCategory = computed(() => {
  if (!resolvedCategory.value) return []
  const ids = new Set(
    products.value
      .filter((p) => p.category === resolvedCategory.value && p.region_group_id)
      .map((p) => p.region_group_id)
  )
  return regionGroups.value.filter((r) => ids.has(r.id))
})

const awaitingRegionChoice = computed(
  () => !awaitingSubCategoryChoice.value && regionsForCategory.value.length > 0 && selectedRegionId.value === undefined
)

const filteredProducts = computed(() => {
  if (!resolvedCategory.value) return []
  let list = products.value.filter((p) => p.category === resolvedCategory.value)
  if (regionsForCategory.value.length && selectedRegionId.value !== undefined && selectedRegionId.value !== null) {
    list = list.filter((p) => p.region_group_id === selectedRegionId.value || !p.region_group_id)
  }
  return list
})

const showingProducts = computed(
  () => Boolean(selectedGroup.value) && !awaitingSubCategoryChoice.value && !awaitingRegionChoice.value
)

// Quick-pick teaser on the first screen — top 4 by admin's own sort order,
// so visitors see real products before even choosing a category. Opens the
// same zoom modal; ordering from there skips category/region picking.
const featuredProducts = computed(() => products.value.slice(0, 4))

const steps = [
  {
    title: 'Pilih Bunga',
    desc: 'Pilih karangan bunga yang Anda mau dari etalase di bawah — harga sudah pasti, tanpa nego.',
    icon: 'M9 5l7 7-7 7',
  },
  {
    title: 'Ditinjau Admin',
    desc: 'Tim kami meninjau kelengkapan pesanan Anda sebelum diteruskan ke pengrajin.',
    icon: 'M5 13l4 4L19 7',
  },
  {
    title: 'Dikerjakan Pengrajin Terpercaya',
    desc: 'Pengrajin komunitas kami yang tersedia akan membuat & mengirimkan pesanan Anda.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
]

const trustPoints = [
  { title: 'Pengrajin Terverifikasi', desc: 'Setiap pengrajin ditinjau & disetujui admin sebelum aktif.' },
  { title: 'Harga Transparan', desc: 'Harga tertera jelas di etalase, tanpa biaya tersembunyi.' },
  { title: 'Update Real-time', desc: 'Pantau status pesanan Anda dari dipesan sampai selesai.' },
]
</script>

<template>
  <div>
    <!-- Etalase (first thing a visitor sees) -->
    <section id="etalase" class="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50">
      <div class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl"></div>
      <div class="pointer-events-none absolute -top-10 right-0 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl"></div>

      <div class="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:pt-12">
        <!-- Step 1: pilih kategori -->
        <div v-if="!selectedGroup">
          <div class="text-center">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100">
              🌸 Wadah Resmi Komunitas Pengrajin Bunga
            </span>
            <h1 class="mx-auto mt-4 max-w-2xl text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Mau Pesan Bunga Apa?
            </h1>
            <p class="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
              Pilih jenisnya dulu — harga sudah pasti, tanpa nego.
            </p>
          </div>

          <p v-if="loading" class="mt-10 text-center text-sm text-slate-500">Memuat...</p>
          <div v-else class="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="g in groups"
              :key="g"
              type="button"
              class="flex flex-col items-center gap-2 rounded-2xl border-2 border-transparent bg-white p-5 text-center ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md"
              @click="selectGroup(g)"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  />
                </svg>
              </span>
              <span class="text-sm font-semibold leading-snug text-slate-900">{{ g }}</span>
            </button>
          </div>

          <!-- Produk pilihan -->
          <div v-if="!loading && featuredProducts.length" class="mx-auto mt-14 max-w-6xl">
            <h2 class="text-center text-lg font-bold text-slate-900 sm:text-xl">Produk Pilihan</h2>
            <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div
                v-for="p in featuredProducts"
                :key="p.id"
                class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                role="button"
                tabindex="0"
                @click="openZoom(p)"
                @keydown.enter="openZoom(p)"
              >
                <div class="relative aspect-[4/3] w-full overflow-hidden bg-emerald-50">
                  <img
                    v-if="p.image_url"
                    :src="p.image_url"
                    :alt="p.name"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span
                    v-if="p.category"
                    class="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-emerald-700 shadow-sm"
                  >
                    {{ p.category }}
                  </span>
                </div>
                <div class="flex flex-1 flex-col p-3 sm:p-4">
                  <p class="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">{{ p.name }}</p>
                  <span class="mt-auto pt-3 text-sm font-bold text-emerald-700 sm:text-base">{{ formatPrice(p.price) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2 (kalau grup ini punya sub-jenis): pilih sub-jenis -->
        <div v-else-if="awaitingSubCategoryChoice">
          <button
            type="button"
            class="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            @click="backToGroups"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Kategori lain
          </button>

          <div class="mt-4 text-center">
            <h1 class="mx-auto max-w-2xl text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {{ selectedGroup }} — Pilih Jenisnya
            </h1>
          </div>

          <div class="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="c in subCategoriesForGroup"
              :key="c"
              type="button"
              class="flex flex-col items-center gap-2 rounded-2xl border-2 border-transparent bg-white p-5 text-center ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md"
              @click="selectSubCategory(c)"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 21s-4.5-3-4.5-7.5S12 3 12 3s4.5 6 4.5 10.5S12 21 12 21Z"
                  />
                </svg>
              </span>
              <span class="text-sm font-semibold leading-snug text-slate-900">{{ c }}</span>
            </button>
          </div>
        </div>

        <!-- Step 3 (kalau kategori ini punya variasi wilayah): pilih wilayah -->
        <div v-else-if="awaitingRegionChoice">
          <button
            type="button"
            class="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            @click="subCategoriesForGroup.length ? backToSubCategories() : backToGroups()"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {{ subCategoriesForGroup.length ? 'Jenis lain' : 'Kategori lain' }}
          </button>

          <div class="mt-4 text-center">
            <h1 class="mx-auto max-w-2xl text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {{ resolvedCategory }} — Mau Kirim ke Mana?
            </h1>
            <p class="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
              Pilih wilayah tujuan pengiriman untuk melihat pilihan yang tersedia.
            </p>
          </div>

          <div class="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              v-for="r in regionsForCategory"
              :key="r.id"
              type="button"
              class="flex flex-col items-center gap-2 rounded-2xl border-2 border-transparent bg-white p-4 text-center ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md"
              @click="selectRegion(r.id)"
            >
              <span class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-emerald-700">
                <img v-if="r.image_url" :src="r.image_url" :alt="r.name" class="h-full w-full object-cover" />
                <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  />
                </svg>
              </span>
              <span class="text-xs font-semibold leading-snug text-slate-900 sm:text-sm">{{ r.name }}</span>
            </button>

            <button
              type="button"
              class="flex flex-col items-center gap-2 rounded-2xl border-2 border-transparent bg-white p-4 text-center ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md"
              @click="selectRegion(null)"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </span>
              <span class="text-xs font-semibold leading-snug text-slate-900 sm:text-sm">Semua Wilayah</span>
            </button>
          </div>
        </div>

        <!-- Step 4: produk -->
        <div v-else-if="showingProducts">
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-if="regionsForCategory.length"
              type="button"
              class="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              @click="backToRegions"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Ganti Wilayah
            </button>
            <button
              v-if="subCategoriesForGroup.length"
              type="button"
              class="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              @click="backToSubCategories"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Jenis Lain
            </button>
            <button
              type="button"
              class="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              @click="backToGroups"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kategori Lain
            </button>
          </div>

          <h1 class="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            {{ resolvedCategory }}
          </h1>

          <p v-if="!filteredProducts.length" class="mt-10 text-center text-sm text-slate-500">
            Belum ada produk tersedia untuk pilihan ini.
          </p>

          <div v-else class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="p in filteredProducts"
              :key="p.id"
              class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              role="button"
              tabindex="0"
              @click="openZoom(p)"
              @keydown.enter="openZoom(p)"
            >
              <div class="relative aspect-[4/3] w-full overflow-hidden bg-emerald-50">
                <img
                  v-if="p.image_url"
                  :src="p.image_url"
                  :alt="p.name"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  v-if="p.category"
                  class="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-emerald-700 shadow-sm"
                >
                  {{ p.category }}
                </span>
                <span
                  class="absolute inset-0 flex items-center justify-center bg-slate-900/0 text-transparent transition-colors group-hover:bg-slate-900/20 group-hover:text-white"
                >
                  <span class="text-xs font-medium">🔍 Lihat</span>
                </span>
              </div>

              <div class="flex flex-1 flex-col p-3 sm:p-4">
                <p class="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">{{ p.name }}</p>
                <p v-if="p.subtitle" class="mt-0.5 line-clamp-1 text-xs text-slate-500 sm:text-sm">{{ p.subtitle }}</p>

                <div class="mt-auto flex items-center justify-between pt-3">
                  <span class="text-sm font-bold text-emerald-700 sm:text-base">{{ formatPrice(p.price) }}</span>
                  <button
                    type="button"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                    aria-label="Pesan produk ini"
                    @click.stop="chooseProduct(p)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Zoom / Review Modal -->
    <BaseModal
      :model-value="Boolean(zoomProduct)"
      max-width="max-w-lg"
      @update:model-value="zoomProduct = null"
    >
      <template v-if="zoomProduct">
        <div class="overflow-hidden rounded-xl bg-emerald-50">
          <img
            v-if="zoomProduct.image_url"
            :src="zoomProduct.image_url"
            :alt="zoomProduct.name"
            class="max-h-[55vh] w-full object-contain"
          />
        </div>
        <div class="pt-4">
          <span
            v-if="zoomProduct.category"
            class="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
          >
            {{ zoomProduct.category }}
          </span>
          <h3 class="mt-2 text-lg font-semibold text-slate-900">{{ zoomProduct.name }}</h3>
          <p v-if="zoomProduct.subtitle" class="mt-1 text-sm text-slate-500">{{ zoomProduct.subtitle }}</p>
          <p class="mt-3 text-xl font-bold text-emerald-700">{{ formatPrice(zoomProduct.price) }}</p>
        </div>
      </template>

      <template #footer>
        <BaseButton variant="secondary" @click="zoomProduct = null">Tutup</BaseButton>
        <BaseButton @click="chooseProduct(zoomProduct)">Pesan Sekarang</BaseButton>
      </template>
    </BaseModal>

    <!-- Trust points -->
    <section class="border-t border-slate-100 bg-slate-50/60 py-10">
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-3">
        <div v-for="t in trustPoints" :key="t.title" class="rounded-xl bg-white p-4 text-left ring-1 ring-slate-200">
          <p class="text-sm font-semibold text-slate-900">{{ t.title }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ t.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Cara Kerja -->
    <section id="cara-kerja" class="scroll-mt-4 bg-white py-16">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="text-center text-2xl font-bold text-slate-900 sm:text-3xl">Cara Kerja</h2>
        <div class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div v-for="(s, i) in steps" :key="s.title" class="relative text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="s.icon" />
              </svg>
            </div>
            <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-600">Langkah {{ i + 1 }}</p>
            <p class="mt-1 font-semibold text-slate-900">{{ s.title }}</p>
            <p class="mx-auto mt-2 max-w-xs text-sm text-slate-600">{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="bg-gradient-to-r from-emerald-700 to-emerald-600">
      <div class="mx-auto max-w-6xl px-4 py-12 text-center sm:py-16">
        <h2 class="text-2xl font-bold text-white sm:text-3xl">Punya Usaha Karangan Bunga?</h2>
        <p class="mx-auto mt-2 max-w-md text-sm text-emerald-50">
          Bergabung jadi pengrajin di platform kami dan dapatkan pesanan dari komunitas pembeli kami.
        </p>
        <router-link
          to="/daftar-pengrajin"
          class="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          Daftar Sebagai Pengrajin
        </router-link>
      </div>
    </section>
  </div>
</template>
