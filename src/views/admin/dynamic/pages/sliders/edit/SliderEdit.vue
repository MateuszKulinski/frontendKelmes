<template>
    <div>
        <h1>{{ t('slider.edit') }}</h1>
        <SliderForm ref="formRef" :isEdit="true" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSliderAdminStore } from '@/core/stores/sliderAdminStore';
import { useUiStore } from '@/core/stores/uiStore';
import SliderForm from '../form/SliderForm.vue';

const { t } = useI18n();
const route  = useRoute();
const router = useRouter();
const store  = useSliderAdminStore();
const ui     = useUiStore();
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

const handleSubmit = async (formData: FormData) => {
    ui.showLoader();
    try {
        await store.update(id, formData);
        router.push({ name: 'admin.sliders' });
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
