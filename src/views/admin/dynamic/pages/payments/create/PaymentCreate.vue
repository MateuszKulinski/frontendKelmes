<template>
    <div>
        <h1>{{ t("payment.create") }}</h1>

        <PaymentForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/core/api/axios";
import PaymentForm from "../form/PaymentForm.vue";
import { useUiStore } from "@/core/stores/uiStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const ui = useUiStore();

const formRef = ref<any>(null);

const handleSubmit = async (form: any) => {
    ui.showLoader();

    try {
        const { data } = await api.post<{ id: number }>(`/settings/payments`, form);

        const icon = formRef.value?.getPendingIconFile() as File | null;
        if (icon) {
            const formData = new FormData();
            formData.append("icon", icon);
            await api.post(`/settings/payments/${data.id}/icon`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
        }

        router.push({ name: "admin.payments" });

    } catch (e: any) {

        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(e.response.data.errors);
        } else {
            alert(t("common.error_occurred"));
        }

    } finally {
        ui.hideLoader();
    }
};
</script>