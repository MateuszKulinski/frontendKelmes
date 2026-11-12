<template>
    <div>
        <h1>{{ t('manufacturer.create') }}</h1>
        <ManufacturerForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useManufacturerStore } from '@/core/stores/manufacturerStore';
import { useUiStore } from '@/core/stores/uiStore';
import ManufacturerForm from '../form/ManufacturerForm.vue';

const { t } = useI18n();
const router = useRouter();
const store   = useManufacturerStore();
const ui      = useUiStore();
const formRef = ref<any>(null);

const handleSubmit = async (payload: Record<string, any>) => {
    ui.showLoader();
    try {
        const manufacturer = await store.create(payload);
        if (manufacturer) {
            const pendingFile = formRef.value?.getPendingLogoFile();
            if (pendingFile) {
                await store.uploadLogo(manufacturer.id, pendingFile);
            }
        }
        router.push({ name: 'admin.manufacturers' });
    } catch (e: any) {
        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(e.response.data.errors);
        } else {
            alert(t('common.error_occurred'));
        }
    } finally {
        ui.hideLoader();
    }
};
</script>
