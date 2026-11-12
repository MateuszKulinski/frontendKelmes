<template>
  <div class="content-container">
    <h1>{{ data.title }}</h1>
    <div v-html="data.content"></div>
    <!-- Banery CMS -->
    <BannerBlock type="cms" :context-id="data.id" />
  </div>
</template>

<script setup lang="ts">
import BannerBlock from '@/views/shared/components/BannerBlock.vue';
defineProps<{ data: any }>();
</script>
