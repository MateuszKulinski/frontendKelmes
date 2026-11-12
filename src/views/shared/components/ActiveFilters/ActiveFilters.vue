<template>
  <div v-if="filters.length" class="active-filters">
    <span v-for="tag in filters" :key="tag.key" class="filter-tag">
      {{ tag.label }}: {{ tag.value }}

      <BaseIcon name="remove" role="button" @click="$emit('remove', tag.key)" />
    </span>

    <BaseButton variant="secondary" size="sm" @click="$emit('removeAll')">
      <BaseIcon name="remove" />
      Wyczyść filtry
    </BaseButton>
  </div>
</template>

<script setup>
import BaseIcon from "../../ui/BaseIcon.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
defineProps({
  filters: {
    type: Array,
    required: true,
  },
});
</script>

<style src="./ActiveFilters.css" scoped></style>