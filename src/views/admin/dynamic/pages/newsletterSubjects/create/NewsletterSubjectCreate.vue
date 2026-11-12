<template>
    <div class="newsletter-subject-create">
        <h1>{{ t("newsletter.create_subject") }}</h1>

        <NewsletterSubjectForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";

import NewsletterSubjectForm from "../form/NewsletterSubjectForm.vue";

const { t } = useI18n();

const router = useRouter();
const ui = useUiStore();

const formRef = ref<any>(null);

const handleSubmit = async (form: any) => {
    ui.showLoader();

    try {
        await api.post("/newsletter", form);

        ui.showSuccess(t("newsletter.subject_created"));

        router.push({
            name: "admin.newsletterSubjects",
        });
    } catch (e: any) {
        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(e.response.data.errors);
            ui.showError(t("common.fix_form"));
        } else {
            console.error(e);
            ui.showError(t("common.error_occurred"));
        }
    } finally {
        ui.hideLoader();
    }
};
</script>