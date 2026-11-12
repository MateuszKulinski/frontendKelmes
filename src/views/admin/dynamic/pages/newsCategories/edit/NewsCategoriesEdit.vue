<template>
    <div>
        <h1>{{ t("common.edit") }}</h1>

        <NewsCategoriesForm ref="formRef" :isEdit="true" @submit="handleSubmit" />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";

import { useUiStore } from "@/core/stores/uiStore";
import NewsCategoriesForm from "../form/NewsCategoriesForm.vue";

import type {
    NewsCategoryDetail,
    NewsCategoryPayload,
} from "@/composables/types/newsCategories";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const ui = useUiStore();

const formRef = ref<any>(null);

const id = Number(route.params.id);

onMounted(async () => {
    ui.showLoader();

    try {
        const { data } = await api.get<{ data: NewsCategoryDetail }>(
            `/news-categories/${id}`
        );

        formRef.value?.setFormData(data.data);
    } finally {
        ui.hideLoader();
    }
});

const handleSubmit = async (payload: NewsCategoryPayload) => {
    ui.showLoader();

    try {
        await api.put(
            `/news-categories/${id}`,
            payload
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