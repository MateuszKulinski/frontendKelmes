<template>
  <div class="pagination d-flex align-items-center justify-content-center">
    <div class="controls">
      <!-- PREV -->
      <button class="paggination-btn" :disabled="disabled || page === 1" @click="emitChange(page - 1)">
        <BaseIcon name="chLeft" />
      </button>

      <!-- PAGES -->
      <button v-for="p in pages" :key="p" class="paggination-btn" :class="{ active: p === page, dots: p === '...' }"
        :disabled="disabled || p === '...'" @click="typeof p === 'number' && emitChange(p)">
        {{ p }}
      </button>

      <!-- NEXT -->
      <button class="paggination-btn" :disabled="disabled || page === lastPage" @click="emitChange(page + 1)">
        <BaseIcon name="chRight" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./CategoryPagination.css";
import { useCategoryPagination } from "./CategoryPagination";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

const props = defineProps<{
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  disabled?: boolean;
}>();

const emit = defineEmits(["change"]);

const {
  pages,
  emitChange
} = useCategoryPagination(props, emit);
</script>