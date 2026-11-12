<template>
    <NewsList :data="relatedData" carousel />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NewsItem } from '@/composables/indexStore';
import NewsList from './NewsList.vue';

const props = defineProps<{ items: NewsItem[] }>();
const { t } = useI18n();

const relatedData = computed(() => ({
    title: t('news.related_articles'),
    short_description: '',
    articles: props.items,
}));
</script>
