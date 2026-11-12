<template>
    <div class="inquiries-view">
        <h1>{{ t("inquiry.create") }}</h1>

        <InquiryForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

import axios from "axios";

import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";

import InquiryForm from "../form/InquiryForm.vue";

import { useNavigation } from "@/composables/useNavigation";

import { useUiStore } from "@/core/stores/uiStore";

import type {
    InquiryFormExpose,
    InquirySaveResponse,
    InquirySubmitPayload,
} from "@/composables/types/inquiry";

const { t } = useI18n();

const { goTo } = useNavigation();

const ui = useUiStore();

const formRef = ref<InquiryFormExpose | null>(null);

const handleSubmit = async (
    payload: InquirySubmitPayload
) => {

    try {

        const { data } = await api.post<InquirySaveResponse>(
            "/inquiries",
            payload
        );

        ui.showSuccess(
            t("inquiry.created")
        );

        goTo("inquiry", {
            id: data.id,
        });

    } catch (e: unknown) {

        if (
            axios.isAxiosError(e) &&
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
</script>