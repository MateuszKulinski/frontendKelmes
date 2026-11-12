<template>
    <div>
        <h1>{{ t('banner.edit') }}</h1>
        <BannerForm ref="formRef" :isEdit="true" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/core/api/axios';
import BannerForm from '../form/BannerForm.vue';
import { useUiStore } from '@/core/stores/uiStore';
import { useI18n } from 'vue-i18n';

const { t }   = useI18n();
const route   = useRoute();
const router  = useRouter();
const ui      = useUiStore();
const formRef = ref<any>(null);
const id      = Number(route.params.id);

onMounted(async () => {
    ui.showLoader();
    try {
        const { data } = await api.get(`/settings/banners/${id}`);
        formRef.value?.setFormData(data.data);
    } finally {
        ui.hideLoader();
    }
});

const handleSubmit = async (formData: FormData) => {
    ui.showLoader();
    try {
        await api.post(`/settings/banners/${id}`, formData, {
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
