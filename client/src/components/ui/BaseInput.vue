<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  as: { type: String, default: 'input' }, // input | textarea
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block text-sm">
    <span v-if="label" class="mb-1 block font-medium text-slate-700">
      {{ label }}<span v-if="required" class="text-rose-500"> *</span>
    </span>
    <textarea
      v-if="as === 'textarea'"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :required="required"
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="mt-1 block text-xs text-rose-600">{{ error }}</span>
  </label>
</template>
