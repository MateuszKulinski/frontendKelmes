<template>
  <div class="view-type products-view-toggle" role="group" :aria-label="t('products.view_type')">
    <button type="button" class="view-type-button grid" :class="{ active: modelValue === 'grid' }"
      :aria-label="t('products.grid_view')" :aria-pressed="modelValue === 'grid'" @click="emit('update:modelValue', 'grid')">
      <span class="products-view-toggle__grid" aria-hidden="true"><span v-for="dot in 9" :key="dot"></span></span>
    </button>
    <button type="button" class="view-type-button list" :class="{ active: modelValue === 'list' }"
      :aria-label="t('products.list_view')" :aria-pressed="modelValue === 'list'" @click="emit('update:modelValue', 'list')">
      <span class="products-view-toggle__list" aria-hidden="true"><span v-for="row in 3" :key="row"></span></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ProductsViewType } from './productListOptions';
import './ProductsViewToggle.css';

defineProps<{ modelValue: ProductsViewType }>();
const emit = defineEmits<{ 'update:modelValue': [value: ProductsViewType] }>();
const { t } = useI18n();
</script>
