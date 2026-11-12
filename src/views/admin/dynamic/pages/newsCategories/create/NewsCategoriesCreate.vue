<template>
    <div>
        <h1>{{ t("news.createCategory") }}</h1>

        <NewsCategoryForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";

import NewsCategoryForm from "../form/NewsCategoriesForm.vue";

import type {
    NewsCategoryPayload,
} from "@/composables/types/newsCategories";

const { t } = useI18n();

const router = useRouter();
const ui = useUiStore();

const formRef = ref<InstanceType<typeof NewsCategoryForm> | null>(null);

const handleSubmit = async (payload: NewsCategoryPayload) => {
    ui.showLoader();

    try {
        const formData = new FormData();

        formData.append(
            "is_active",
            String(payload.is_active)
        );

        payload.langs.forEach((lang, index) => {
            formData.append(
                `langs[${index}][lang_id]`,
                String(lang.lang_id)
            );

            formData.append(
                `langs[${index}][title]`,
                lang.title
            );

            formData.append(
                `langs[${index}][slug]`,
                lang.slug ?? ""
            );

            formData.append(
                `langs[${index}][short_description]`,
                lang.short_description ?? ""
            );

            if (lang.image instanceof File) {
                formData.append(
                    `langs[${index}][image]`,
                    lang.image
                );
            }
        });

        await api.post(
            "/news-categories",
            formData
        );

        await router.push({
            name: "admin.news-categories",
        });
    } catch (e: any) {
        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(
                e.response.data.errors
            );
        }
    } finally {
        ui.hideLoader();
    }
};
</script>