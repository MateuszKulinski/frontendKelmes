<template>
    <form class="admin-form-one-column" @submit.prevent="submit" enctype="multipart/form-data">

        <div class="section">
            <h3>{{ t("common.basic") }}</h3>

            <BaseCheckbox v-model="form.is_active">
                {{ t("common.active") }}
            </BaseCheckbox>
        </div>

        <div class="section full">
            <TranslationFields :items="form.langs" :errors="errors" v-slot="{ item: lang, index }">
                <div class="user-grid">
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("common.name") }}
                        </BaseLabel>

                        <BaseInput v-model="lang.title" />

                        <div v-if="errors[`langs.${index}.title`]" class="error">
                            {{ errors[`langs.${index}.title`] }}
                        </div>
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>
                        {{ t("news.short_description") }}
                    </BaseLabel>

                    <RichTextEditor v-model="lang.short_description" />

                    <div v-if="errors[`langs.${index}.short_description`]" class="error">
                        {{ errors[`langs.${index}.short_description`] }}
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>
                        {{ t("news.image") }}
                    </BaseLabel>

                    <input type="file" accept="image/*" class="form-control"
                        @change="onLangImageChange($event, lang)" />

                    <div v-if="errors[`langs.${index}.image`]" class="error">
                        {{ errors[`langs.${index}.image`] }}
                    </div>

                    <!-- <img v-if="lang.imagePreview" :src="lang.imagePreview" alt="preview"
                        style="max-height:160px;object-fit:contain;margin-top:8px;" /> -->
                </div>
            </TranslationFields>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{
                    props.isEdit
                        ? t("common.save")
                        : t("common.create")
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
import RichTextEditor from '@shared/ui/RichTextEditor.vue';
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";


import { useNewsCategoryForm } from "./NewsCategoriesForm";

import type { NewsCategoryPayload } from "@/composables/types/newsCategories";

const props = defineProps<{
    isEdit?: boolean;
}>();

const emit = defineEmits<{
    (e: "submit", payload: NewsCategoryPayload): void;
}>();

const { t } = useI18n();


const {
    form,
    errors,
    ensureLangs,
    submit,
    setFormData,
    onLangImageChange,
    handleValidationError,
} = useNewsCategoryForm(emit);

onMounted(() => {
    ensureLangs();
});

defineExpose({
    setFormData,
    handleValidationError,
});
</script>


<style scoped src="@admin/assets/Form.css"></style>