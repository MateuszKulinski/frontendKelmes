<template>
  <label class="checkbox-wrapper" :class="{ 'is-disabled': disabled }">
    <input type="checkbox" :checked="modelValue" :disabled="disabled" @change="onChange" />

    <span class="checkmark"></span>

    <span class="label">
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
};
</script>

<style scoped src="./BaseCheckbox.css"></style>