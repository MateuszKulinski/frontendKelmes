<template>
    <div>
        <h1>{{ t('cms.create') }}</h1>
        <CmsForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCmsStore } from '@/core/stores/cmsStore';
import { useUiStore } from '@/core/stores/uiStore';
import CmsForm from '../form/CmsForm.vue';

const { t } = useI18n();
const router = useRouter();
const store  = useCmsStore();
const ui     = useUiStore();
const formRef = ref<any>(null);

const handleSubmit = async (payload: Record<string, any>) => {
    ui.showLoader();
    try {
        await store.create(payload);
        router.push({ name: 'admin.cms' });
    } catch (e: any) {
        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(e.response.data.errors);
        }
    } finally {
        ui.hideLoader();
    }
};
</script>
