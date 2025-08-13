<template>
  <v-select
    :items="items"
    :label="label"
    :loading="loading"
    :disabled="disabled || loading || items.length === 0"
    item-title="label"
    item-value="value"
    variant="outlined"
    density="comfortable"
    clearable
    v-model="model"
  />
  <div
    v-if="showHint && selected"
    class="text-caption text-medium-emphasis mt-1"
  >
    目前餘額：NT$ {{ Number(selected.balance).toLocaleString() }}
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number, null], default: null },
  // 期待陣列：[{ label, value, balance }]
  items: { type: Array, default: () => [] },
  label: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  showHint: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue ?? null,
  set: (v) => emit("update:modelValue", v),
});

const selected = computed(() =>
  props.items.find((i) => i.value === props.modelValue)
);
</script>
