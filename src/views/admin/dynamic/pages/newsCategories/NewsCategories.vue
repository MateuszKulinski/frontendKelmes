<template>
    <div>
        <h1>{{ t('news.title_list_categories') }}</h1>
        <BaseButton @click="router.push({ name: 'admin.news-categories.create' })">
            <BaseIcon name="plus" /> {{ t('common.add') }}
        </BaseButton>
        <NewsCategoriesList />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseIcon from '@/views/shared/ui/BaseIcon.vue';
import NewsCategoriesList from './list/NewsCategoriesList.vue';

const { t } = useI18n();
const router = useRouter();
</script>
