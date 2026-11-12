<template>
    <div class="inquiry-edit">
        <h1>{{ t("inquiry.edit") }}</h1>

        <InquiryForm ref="formRef" :isEdit="true" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import api from "@/core/api/axios";

import InquiryForm from "../form/InquiryForm.vue";

import { useUiStore } from "@/core/stores/uiStore";

import { useI18n } from "vue-i18n";
import { useNavigation } from "@/composables/useNavigation";
import type {
    InquiryDetailsResponse,
    InquiryFormExpose,
    InquirySubmitPayload
} from "@/composables/types/inquiry";
const { goTo } = useNavigation();

const { t } = useI18n();

const route = useRoute();

const ui = useUiStore();

const formRef = ref<InquiryFormExpose | null>(null);

const inquiryId = Number(route.params.id);

const loadInquiry = async () => {
    ui.showLoader();

    try {
        const { data } = await api.get<InquiryDetailsResponse>(`/inquiries/${inquiryId}`);

        formRef.value?.setFormData(data.data);
    } catch (e) {
        console.error(e);

        ui.showError(
            t("inquiry.download_error")
        );
    } finally {
        ui.hideLoader();
    }
};
const handleSubmit = async (
    form: InquirySubmitPayload
) => {

    try {

        await api.put(
            `/inquiries/${inquiryId}`,
            form
        );

        ui.showSuccess(
            t("inquiry.updated")
        );
        goTo('inquiry', { id: inquiryId });

    } catch (e: any) {

        if (
            e.response?.status === 422
        ) {

            formRef.value?.setBackendErrors(
                e.response.data.errors
            );

            ui.showError(
                t("common.fix_form")
            );

            return;
        }

        console.error(e);
    }
};
onMounted(loadInquiry);
</script>