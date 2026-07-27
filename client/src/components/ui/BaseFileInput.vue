<script setup>
import { ref } from 'vue'
import { uploadFile } from '../../api/upload.api'

const props = defineProps({
  label: { type: String, default: '' },
})
// `uploading` lets the parent disable its Save button while a file is still
// in flight — without this, clicking Save mid-upload silently submits the
// old image_url and the just-picked image is lost (looks like it "reverted").
const emit = defineEmits(['uploaded', 'uploading'])

const uploading = ref(false)
const error = ref('')

async function onChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  error.value = ''
  uploading.value = true
  emit('uploading', true)
  try {
    const url = await uploadFile(file)
    emit('uploaded', url)
  } catch (err) {
    error.value = err.response?.data?.error || 'Gagal mengunggah gambar.'
  } finally {
    uploading.value = false
    emit('uploading', false)
    e.target.value = ''
  }
}
</script>

<template>
  <label class="block text-sm">
    <span v-if="label" class="mb-1 block font-medium text-slate-700">{{ label }}</span>
    <input
      type="file"
      accept="image/*"
      :disabled="uploading"
      class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-emerald-700 hover:file:bg-emerald-100"
      @change="onChange"
    />
    <span v-if="uploading" class="mt-1 block text-xs text-slate-400">Mengunggah...</span>
    <span v-if="error" class="mt-1 block text-xs text-rose-600">{{ error }}</span>
  </label>
</template>
