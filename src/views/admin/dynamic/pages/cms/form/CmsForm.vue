<template>
    <form class="admin-form" @submit.prevent="submit">

        <div class="section">
            <h3>{{ t('common.basic') }}</h3>
            <BaseCheckbox v-model="form.is_active">
                {{ t('common.active') }}
            </BaseCheckbox>
        </div>

        <div class="section full">
            <TranslationFields :items="form.langs" :errors="errors" v-slot="{ item: lang, index }">
                <div class="user-grid">
                    <div class="form-group floating">
                        <BaseLabel>{{ t('cms.title') }}</BaseLabel>
                        <BaseInput v-model="lang.title" />
                        <div class="error" v-if="errors[`langs.${index}.title`]">
                            {{ errors[`langs.${index}.title`] }}
                        </div>
                    </div>

                    <div class="form-group floating">
                        <BaseLabel>{{ t('cms.slug') }}</BaseLabel>
                        <BaseInput v-model="lang.slug" />
                        <div class="error" v-if="errors[`langs.${index}.slug`]">
                            {{ errors[`langs.${index}.slug`] }}
                        </div>
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>{{ t('cms.content') }}</BaseLabel>
                    <RichTextEditor v-model="lang.content" />
                </div>
            </TranslationFields>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{ props.isEdit ? t('cms.save') : t('cms.create') }}
            </BaseButton>
        </div>

    </form>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseInput from '@shared/ui/BaseInput.vue';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseCheckbox from '@shared/components/BaseCheckbox/BaseCheckbox.vue';
import BaseLabel from '@shared/ui/BaseLabel.vue';
import RichTextEditor from '@shared/ui/RichTextEditor.vue';
import { useLangStore } from '@/core/stores/langStore';
import { useCmsForm } from './CmsForm';

const emit = defineEmits(['submit']);
const props = defineProps<{ isEdit?: boolean }>();

const { t } = useI18n();
const langStore = useLangStore();

const {
    form,
    errors,
    ensureLangs,
    setFormData,
    handleValidationError,
    submit,
} = useCmsForm(emit);

onMounted(async () => {
    if (!langStore.langs.length) await langStore.fetchLangs();
    ensureLangs();
});

defineExpose({ setFormData, handleValidationError });
</script>
