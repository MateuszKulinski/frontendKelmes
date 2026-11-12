<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div class="content-container">
    <h1>404</h1>
    <p>{{ t("errors.notFound") }}</p>
  </div>
</template>