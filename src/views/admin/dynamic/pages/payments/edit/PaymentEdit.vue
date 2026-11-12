<template>
    <div>
        <h1>{{ t("payment.edit") }}</h1>

        <PaymentForm ref="formRef" :isEdit="true" :paymentMethodId="id" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/core/api/axios";
import PaymentForm from "../form/PaymentForm.vue";
import { useUiStore } from "@/core/stores/uiStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const formRef = ref<any>(null);
const id = Number(route.params.id);

const load = async () => {
    ui.showLoader();

    try {
        const { data } = await api.get(`/settings/payments/${id}`);
        formRef.value?.setFormData(data.data);
    } finally {
        ui.hideLoader();
    }
};

const handleSubmit = async (form: any) => {
    ui.showLoader();

    try {
        await api.put(`/settings/payments/${id}`, form);

        router.push({ name: "admin.payments" });

    } catch (e: any) {

        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(e.response.data.errors);
        }

    } finally {
        ui.hideLoader();
    }
};

onMounted(load);
</script>