<template>
    <div>
        <h1>{{ t('slider.create') }}</h1>
        <SliderForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSliderAdminStore } from '@/core/stores/sliderAdminStore';
import { useUiStore } from '@/core/stores/uiStore';
import SliderForm from '../form/SliderForm.vue';

const { t } = useI18n();
const router  = useRouter();
const store   = useSliderAdminStore();
const ui      = useUiStore();
const formRef = ref<any>(null);

const handleSubmit = async (formData: FormData) => {
    ui.showLoader();
    try {
        await store.create(formData);
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
