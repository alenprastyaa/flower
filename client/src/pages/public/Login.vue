<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import BaseCard from '../../components/ui/BaseCard.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isDev = import.meta.env.DEV

// Guarded behind a literal import.meta.env.DEV check (not just the `isDev`
// variable) so Vite's build-time replacement + minifier dead-code-eliminate
// this whole block, including the credential strings, out of the production
// bundle entirely — not just hide it in the UI.
const demoAccounts = import.meta.env.DEV
  ? [
      { label: 'Superadmin', email: 'admin@flowermarket.local', password: 'ChangeMe123!' },
      { label: 'Pengrajin (Siti)', email: 'siti@pengrajin.local', password: 'Pengrajin123!' },
      { label: 'Pengrajin (Budi)', email: 'budi@pengrajin.local', password: 'Pengrajin123!' },
      { label: 'Pengrajin (Dewi)', email: 'dewi@pengrajin.local', password: 'Pengrajin123!' },
    ]
  : []

async function doLogin(loginEmail, loginPassword) {
  error.value = ''
  loading.value = true
  try {
    const user = await auth.login(loginEmail, loginPassword)
    const redirect = route.query.redirect
    if (redirect) {
      router.push(redirect)
    } else if (user.role === 'superadmin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/pengrajin/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Gagal masuk, periksa email/password.'
  } finally {
    loading.value = false
  }
}

function onSubmit() {
  return doLogin(email.value, password.value)
}

function onQuickLogin(account) {
  email.value = account.email
  password.value = account.password
  return doLogin(account.email, account.password)
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-16">
    <BaseCard>
      <h1 class="text-xl font-semibold text-slate-900">Masuk</h1>
      <p class="mt-1 text-sm text-slate-500">Untuk pengrajin & admin.</p>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <BaseInput v-model="email" label="Email" type="email" required />
        <BaseInput v-model="password" label="Password" type="password" required />
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        <BaseButton type="submit" class="w-full" :loading="loading">Masuk</BaseButton>
      </form>

      <p class="mt-4 text-center text-sm text-slate-500">
        Belum punya akun pengrajin?
        <router-link to="/daftar-pengrajin" class="font-medium text-emerald-700 hover:underline">Daftar di sini</router-link>
      </p>

      <div v-if="isDev" class="mt-6 border-t border-dashed border-slate-200 pt-4">
        <p class="text-center text-xs font-medium uppercase tracking-wide text-slate-400">
          Login Cepat (dev only)
        </p>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            v-for="acc in demoAccounts"
            :key="acc.email"
            type="button"
            :disabled="loading"
            class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            @click="onQuickLogin(acc)"
          >
            {{ acc.label }}
          </button>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
