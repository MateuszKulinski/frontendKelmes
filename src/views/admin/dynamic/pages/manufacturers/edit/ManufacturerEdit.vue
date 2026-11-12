<template>
    <div>
        <h1>{{ t('manufacturer.edit') }}</h1>
        <ManufacturerForm ref="formRef" :isEdit="true" :manufacturerId="id" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useManufacturerStore } from '@/core/stores/manufacturerStore';
import { useUiStore } from '@/core/stores/uiStore';
import ManufacturerForm from '../form/ManufacturerForm.vue';

const { t } = useI18n();
const route  = useRoute();
const router = useRouter();
const store   = useManufacturerStore();
const ui      = useUiStore();
const formRef = ref<any>(null);
const id      = Number(route.params.id);

onMounted(async () => {
    ui.showLoader();
    try {
        const data = await store.fetchOne(id);
        if (data) formRef.value?.setFormData(data);
    } finally {
        ui.hideLoader();
    }
});

const handleSubmit = async (payload: Record<string, any>) => {
    ui.showLoader();
    try {
        await store.update(id, payload);
        router.push({ name: 'admin.manufacturers' });
    } catch (e: any) {
        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(e.response.data.errors);
        }
    } finally {
        ui.hideLoader();
    }
};
</script>
