<template>
    <div>
        <h1>{{ t('cms.title_list') }}</h1>
        <BaseButton @click="router.push({ name: 'admin.cms.create' })">
            <BaseIcon name="plus" /> {{ t('common.add') }}
        </BaseButton>
        <CmsList />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseIcon from '@/views/shared/ui/BaseIcon.vue';
import CmsList from './list/CmsList.vue';

const { t } = useI18n();
const router = useRouter();
</script>
