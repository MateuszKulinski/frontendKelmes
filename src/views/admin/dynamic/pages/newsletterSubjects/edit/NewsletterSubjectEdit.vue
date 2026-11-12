<template>
    <div class="newsletter-subject-edit">
        <h1>{{ t("newsletter.edit_subject") }}</h1>

        <NewsletterSubjectForm ref="formRef" :isEdit="true" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";

import NewsletterSubjectForm from "../form/NewsletterSubjectForm.vue";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const formRef = ref<any>(null);

const subjectId = Number(route.params.id);

const loadSubject = async () => {
    ui.showLoader();

    try {
        const { data } = await api.get(`/newsletter/${subjectId}`);

        formRef.value?.setFormData(data.data);
    } catch (e) {
        console.error(e);
        ui.showError(t("newsletter.download_error"));
    } finally {
        ui.hideLoader();
    }
};

const handleSubmit = async (form: any) => {
    ui.showLoader();

    try {
        await api.put(`/newsletter/${subjectId}`, form);

        ui.showSuccess(t("newsletter.subject_updated"));

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

onMounted(loadSubject);
</script>