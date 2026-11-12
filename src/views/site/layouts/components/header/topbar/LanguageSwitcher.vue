<template>
  <div ref="containerRef" class="position-relative" style="width: 180px">
    <!-- BUTTON -->
    <button @click="toggle" class="btn btn-light w-100 d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <span :class="`fi fi-${flagCode(current)}`"></span>
        <span>{{ current.toUpperCase() }}</span>
      </div>
      <BaseIcon name="chDown" />
    </button>

    <!-- DROPDOWN -->
    <div v-if="open" class="dropdown-menu show w-100 mt-1"
      style="position: absolute; top: 100%; left: 0; z-index: 1050">
      <button v-for="lang in langs" :key="lang.code" @click="select(lang.code)"
        class="dropdown-item d-flex align-items-center gap-2">
        <span :class="`fi fi-${flagCode(lang.code)}`"></span>
        <span>{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguageSwitcher } from "./LanguageSwitcher.ts";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

const { containerRef, open, langs, current, toggle, select, flagCode } =
  useLanguageSwitcher();
void containerRef;
</script>