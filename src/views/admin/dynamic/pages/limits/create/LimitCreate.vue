<template>
    <div class="limit-create">
        <h1>{{ t("limits.create_limit") }}</h1>

        <LimitForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";

import LimitForm from "../form/LimitForm.vue";
import type { LimitFormData } from "../form/LimitForm";

const router = useRouter();
const ui = useUiStore();
const { t } = useI18n();

const formRef = ref<InstanceType<typeof LimitForm> | null>(null);

const handleSubmit = async (form: LimitFormData) => {
    ui.showLoader();

    try {
        const { data } = await api.post("/limits", form);

        ui.showSuccess(t("limits.created_success"));

        await router.push({
            name: "admin.limits.edit",
            params: { id: data.id },
        });
    } catch (error: any) {
        if (error.response?.status === 422) {
            formRef.value?.handleValidationError(
                error.response.data.errors
            );

            ui.showError(t("common.fix_form"));
        } else {
            console.error(error);
            ui.showError(t("common.error_occurred"));
        }
    } finally {
        ui.hideLoader();
    }
};
</script>
