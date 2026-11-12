<template>
    <div>
        <h1>{{ t('banner.create') }}</h1>
        <BannerForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/core/api/axios';
import BannerForm from '../form/BannerForm.vue';
import { useUiStore } from '@/core/stores/uiStore';
import { useI18n } from 'vue-i18n';

const { t }  = useI18n();
const router = useRouter();
const ui     = useUiStore();
const formRef = ref<any>(null);

const handleSubmit = async (formData: FormData) => {
    ui.showLoader();
    try {
        await api.post('/settings/banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        router.push({ name: 'admin.banners' });
    } catch (e: any) {
        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(e.response.data.errors);
        }
    } finally {
        ui.hideLoader();
    }
};
</script>
