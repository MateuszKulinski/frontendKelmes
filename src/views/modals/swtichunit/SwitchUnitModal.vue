<template>
  <div class="unit-modal">
    <div class="unit-modal-search">
      <input v-model="query" @input="onSearch" :placeholder="t('changeUnit.searchPlaceholder')" class="form-control" />
    </div>

    <div v-if="loading" class="unit-modal-loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="unit-modal-list">
      <button v-for="u in units" :key="u.id" type="button" class="unit-modal-item" :class="{
        'is-selected': u.id === auth.currentUnitId,
        'is-switching': switchingId === u.id,
      }" :disabled="!!switchingId" @click="select(u)">
        <div class="unit-modal-item-content">
          <div class="unit-modal-item-main">
            <div class="unit-modal-item-name">
              {{ u.name }}
            </div>

            <div class="unit-modal-item-number">
              {{ u.number }}
            </div>
          </div>

          <div v-if="switchingId === u.id" class="item-spinner"></div>

          <div v-else-if="u.id === auth.currentUnitId" class="unit-modal-item-check" aria-hidden="true">
            ✓
          </div>
        </div>
      </button>

      <div v-if="!units.length" class="unit-modal-empty">
        {{ t("changeUnit.noResults") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSwitchUnitModal } from "./SwitchUnitModal";

const {
  t,
  query,
  units,
  loading,
  switchingId,
  onSearch,
  select,
  auth,
} = useSwitchUnitModal();
</script>

<style scoped src="./SwitchUnitModal.css"></style>