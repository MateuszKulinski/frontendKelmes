<template>
  <label :for="forId" :class="[
    'form-label',
    'd-block',
    error ? 'text-danger' : 'text-body',
    disabled ? 'opacity-50' : '',
    className,
  ]">
    <span>
      <slot />
    </span>

    <span v-if="required" class="text-danger ms-1">*</span>

    <small v-if="hint" class="text-muted ms-2">
      {{ hint }}
    </small>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  forId?: string;
  required?: boolean;
  hint?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}>();
</script>