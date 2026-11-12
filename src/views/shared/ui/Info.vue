<template>
  <div class="col-12 col-md-6 col-lg-4">
    <div class="h-100 view-container">
      <div class="text-muted small view-label">{{ label }}</div>
      <div class="view-value">
        {{ value || "-" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value?: string | number | null;
}>();
</script>

<style>
.view-container {
  position: relative;
}

.view-label {
  position: absolute;
  top: -8px;
  left: 10px;
  font-size: var(--font-size-sm);
  padding: 0 var(--padding-ex-sm);
  background: #fff;
  color: var(--text-secondary);
  pointer-events: none;
}

.view-value {
  width: 100%;
  padding: var(--padding-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  font-size: var(--font-size-md);
}
</style>