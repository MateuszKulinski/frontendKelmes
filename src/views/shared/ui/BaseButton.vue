<template>
  <button :disabled="disabled || loading" :class="[
    'btn',
    variantClass,
    sizeClass,
    disabled || loading ? 'is-disabled' : '',
  ]" v-bind="$attrs">
    <span :class="{ 'opacity-75': loading }" class="d-flex align-items-center justify-content-center">
      <slot />
    </span>
  </button>
</template>
f
<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "dropdown" | "secondary-bg" | "danger" | "o-danger";
    disabled?: boolean;
    loading?: boolean;
    size?: "sm" | "md" | "lg" | "wide";
  }>(),
  {
    size: "md",
  }
);

const variantClass = computed(() => {
  switch (props.variant) {
    case "secondary":
      return "btn-secondary";
    case "danger":
      return "btn-danger";
    case "o-danger":
      return "btn-outline-danger";
    case "dropdown":
      return "btn-dropdown";
    case "secondary-bg":
      return "btn-secondary-bg";
    default:
      return "btn-primary";
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "btn-sm";
    case "lg":
      return "btn-lg";
    case "wide":
      return "btn-wide";
    default:
      return "";
  }
});
</script>