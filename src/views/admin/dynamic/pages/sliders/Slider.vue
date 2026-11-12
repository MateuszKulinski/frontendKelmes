<template>
    <div>
        <h1>{{ t('slider.title_list') }}</h1>
        <BaseButton @click="router.push({ name: 'admin.slider.create' })">
            <BaseIcon name="plus" /> {{ t('common.add') }}
        </BaseButton>
        <SliderList />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseIcon from '@/views/shared/ui/BaseIcon.vue';
import SliderList from './list/SliderList.vue';

const { t } = useI18n();
const router = useRouter();
</script>
