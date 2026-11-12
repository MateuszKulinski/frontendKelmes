<template>
    <div>
        <h1>{{ t("news.edit") }}</h1>

        <NewsForm ref="formRef" :isEdit="true" :categoryId="categoryId" :categoryTitle="categoryTitle"
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
import { useUiStore } from "@/core/stores/uiStore";

import NewsForm from "../form/NewsForm.vue";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const formRef = ref<any>(null);
const loaded = ref(false);

const categoryId = ref<number | null>(null);
const categoryTitle = ref("");

const newsId = Number(route.params.id);

const loadNews = async () => {
    ui.showLoader();

    try {
        const { data } = await api.get(
            `/news/${newsId}`
        );

        const news = data.data;

        categoryId.value =
            news.news_category_id ?? null;
        categoryTitle.value = news.category_title ?? '';

        formRef.value?.setFormData(news);

        loaded.value = true;
    } finally {
        ui.hideLoader();
    }
};

const handleSubmit = async (
    formData: FormData
) => {
    ui.showLoader();

    formData.append(
        "_method",
        "PUT"
    );

    try {
        await api.post(
            `/news/${newsId}`,
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

onMounted(loadNews);
</script>
