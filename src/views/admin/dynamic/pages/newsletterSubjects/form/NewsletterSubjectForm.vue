<template>
    <form class="admin-form" @submit.prevent="submit">

        <div class="section full">
            <TranslationFields :items="form.langs" :title="t('newsletter.subject_translations')" :errors="errors" v-slot="{ item: lang, index }">
                <div class="form-group floating">
                    <BaseLabel>{{ t("newsletter.subject") }}</BaseLabel>

                    <BaseInput v-model="lang.name" />

                    <div class="error" v-if="errors[`langs.${index}.name`]">
                        {{ errors[`langs.${index}.name`] }}
                    </div>
                </div>
            </TranslationFields>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{
                    props.isEdit
                        ? t("newsletter.save_subject")
                        : t("newsletter.create_subject")
                }}
            </BaseButton>
        </div>

    </form>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";

import { useLangStore } from "@/core/stores/langStore";
import { useNewsletterSubjectForm } from "./NewsletterSubjectForm";

const emit = defineEmits(["submit"]);

const props = defineProps<{
    isEdit?: boolean;
}>();

const { t } = useI18n();

const langStore = useLangStore();

const {
    form,
    errors,
    ensureLangs,
    submit,
    setFormData,
    handleValidationError,
} = useNewsletterSubjectForm(emit);

onMounted(async () => {
    if (!langStore.langs.length) {
        await langStore.fetchLangs();
    }

    ensureLangs();
});

defineExpose({
    setFormData,
    handleValidationError,
});
</script>

<style scoped src="@admin/assets/Form.css"></style>