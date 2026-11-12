<template>
    <form class="admin-form" @submit.prevent="handleSubmit" enctype="multipart/form-data">

        <div class="section">
            <h3>{{ t('common.basic') }}</h3>

            <div class="user-grid">
                <div class="form-group floating">
                    <BaseLabel>{{ t('slider.sort_order') }}</BaseLabel>
                    <BaseInput v-model.number="form.sort_order" type="number" min="0" />
                </div>
                <div class="form-group floating">
                    <BaseLabel>{{ t('slider.category_id') }}</BaseLabel>
                    <BaseInput :modelValue="form.category_id ?? ''" @update:modelValue="form.category_id = $event === '' ? null : Number($event)" type="number" />
                </div>
            </div>

            <BaseCheckbox v-model="form.is_active">
                {{ t('common.active') }}
            </BaseCheckbox>
        </div>

        <div class="section">
            <h3>{{ t('slider.image') }}</h3>
            <input type="file" accept="image/*" @change="onImageChange" class="form-control" />
            <div class="error" v-if="errors.image">{{ errors.image }}</div>
            <img v-if="imagePreview" :src="imagePreview" alt="preview" style="max-height: 160px; object-fit: contain; margin-top: 8px;" />
        </div>

        <div class="section full">
            <TranslationFields :items="form.langs" :errors="errors" v-slot="{ item: lang }">
                <div class="user-grid">
                    <div class="form-group floating">
                        <BaseLabel>{{ t('slider.title') }}</BaseLabel>
                        <BaseInput v-model="lang.title" />
                    </div>
                    <div class="form-group floating">
                        <BaseLabel>{{ t('slider.link') }}</BaseLabel>
                        <BaseInput v-model="lang.link" placeholder="https://..." />
                    </div>
                    <div class="form-group floating">
                        <BaseLabel>{{ t('slider.button_text') }}</BaseLabel>
                        <BaseInput v-model="lang.button_text" />
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>{{ t('slider.content') }}</BaseLabel>
                    <textarea v-model="lang.content" class="form-control" rows="3" />
                </div>
            </TranslationFields>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{ props.isEdit ? t('slider.save') : t('slider.create') }}
            </BaseButton>
        </div>

    </form>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseInput from '@shared/ui/BaseInput.vue';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseCheckbox from '@shared/components/BaseCheckbox/BaseCheckbox.vue';
import BaseLabel from '@shared/ui/BaseLabel.vue';
import { useLangStore } from '@/core/stores/langStore';
import { useSliderForm } from './SliderForm';
import type { SliderDetail } from '@/composables/types/slider';

const emit = defineEmits(['submit']);
const props = defineProps<{ isEdit?: boolean; currentImage?: string | null }>();

const { t } = useI18n();
const langStore = useLangStore();

const imageFile    = ref<File | null>(null);
const imagePreview = ref<string | null>(props.currentImage ?? null);

const onImageChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    imageFile.value    = file;
    imagePreview.value = file ? URL.createObjectURL(file) : (props.currentImage ?? null);
};

const {
    form,
    errors,
    ensureLangs,
    setFormData,
    handleValidationError,
    submit,
} = useSliderForm(emit);

const handleSubmit = () => submit(imageFile.value);

onMounted(async () => {
    if (!langStore.langs.length) await langStore.fetchLangs();
    ensureLangs();
});

defineExpose({
    setFormData: (data: SliderDetail) => {
        imagePreview.value = data.image ?? null;
        setFormData(data);
    },
    handleValidationError,
});
</script>
