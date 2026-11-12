<template>
    <div>
        <h1>{{ t("news.create") }}</h1>

        <NewsForm ref="formRef" :categoryId="categoryId || null" :categoryTitle="categoryTitle"
            @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
    useRoute,
    useRouter,
} from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { useLangStore } from "@/core/stores/langStore";

import { useUiStore } from "@/core/stores/uiStore";

import NewsForm from "../form/NewsForm.vue";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const langStore = useLangStore();

const formRef = ref<any>(null);

const categoryId = Number(
    route.query.category_id
);

const categoryTitle = ref("");

const loadCategory = async () => {
    if (!categoryId) {
        return;
    }

    try {
        const { data } = await api.get(
            `/news-categories/${categoryId}`
        );

        const category = data.data;

        categoryTitle.value =
            category?.langs?.find((lang: { lang_id: number; title: string }) => lang.lang_id === langStore.currentLang?.id)?.title
            ?? category?.langs?.[0]?.title
            ?? "";
    } catch (e) {
        console.error(
            "Nie udało się pobrać kategorii:",
            e
        );
    }
};

const handleSubmit = async (
    formData: FormData
) => {
    ui.showLoader();

    try {
        await api.post(
            "/news",
            formData
        );

        const selectedCategoryId = Number(formData.get('news_category_id')) || 0;
        await router.push(selectedCategoryId
            ? { name: "admin.news-categories.view", params: { id: selectedCategoryId } }
            : { name: "admin.news" });
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

onMounted(loadCategory);
</script>
