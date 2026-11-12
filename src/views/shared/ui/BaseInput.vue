<template>
  <input v-bind="$attrs" :id="id" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="onInput"
    :class="[
      'form-control',
      sizeClass,
      error ? 'is-invalid' : '',
      disabled ? 'bg-light' : '',
    ]" />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    id?: string;
    placeholder?: string;
    error?: boolean;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    size: "md",
    placeholder: "",
  }
);

const emit = defineEmits(["update:modelValue"]);

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "form-control-sm";
    case "lg":
      return "form-control-lg";
    default:
      return "";
  }
});
</script>