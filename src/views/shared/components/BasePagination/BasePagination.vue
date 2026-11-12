<template>
  <div class="pagination">
    <div class="info">
      Wyświetlanie
      <strong>{{ from }}</strong>–<strong>{{ to }}</strong> z <strong>{{ total }}</strong>
    </div>

    <div class="controls">
      <!-- FIRST -->
      <button class="btn" :disabled="disabled || page === 1" @click="emitChange(1)">
        <BaseIcon name="aLeft" />
      </button>

      <!-- PREV -->
      <button class="btn" :disabled="disabled || page === 1" @click="emitChange(page - 1)">
        <BaseIcon name="chLeft" />
      </button>

      <!-- PAGES -->
      <button v-for="p in pages" :key="p" class="btn" :class="{ active: p === page, dots: p === '...' }"
        :disabled="disabled || p === '...'" @click="typeof p === 'number' && emitChange(p)">
        {{ p }}
      </button>

      <!-- NEXT -->
      <button class="btn" :disabled="disabled || page === lastPage" @click="emitChange(page + 1)">
        <BaseIcon name="chRight" />
      </button>

      <!-- LAST -->
      <button class="btn" :disabled="disabled || page === lastPage" @click="emitChange(lastPage)">
        <BaseIcon name="aRight" />
      </button>

      <!-- INPUT -->
      <div class="jump">
        <span>Idź do</span>

        <input type="number" v-model="inputPage" :min="1" :max="lastPage" :disabled="disabled"
          @keydown.enter="goToInputPage" @blur="normalizeInput" />

        <span>/ {{ lastPage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./BasePagination.css";
import { useBasePagination } from "./BasePagination";
import BaseIcon from "../../ui/BaseIcon.vue";

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
  from,
  to,
  inputPage,
  emitChange,
  goToInputPage,
  normalizeInput,
} = useBasePagination(props, emit);
</script>