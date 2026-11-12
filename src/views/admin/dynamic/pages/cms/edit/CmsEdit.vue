<template>
    <div>
        <h1>{{ t('cms.edit') }}</h1>
        <CmsForm ref="formRef" :isEdit="true" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCmsStore } from '@/core/stores/cmsStore';
import { useUiStore } from '@/core/stores/uiStore';
import CmsForm from '../form/CmsForm.vue';

const { t } = useI18n();
const route  = useRoute();
const router = useRouter();
const store  = useCmsStore();
const ui     = useUiStore();
const formRef = ref<any>(null);
const id = Number(route.params.id);

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
