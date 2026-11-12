<template>

    <div>

        <h1>
            {{ t("delivery.edit") }}
        </h1>

        <DeliveryForm ref="formRef" :isEdit="true" :deliveryMethodId="id" @submit="handleSubmit" />

    </div>

</template>

<script setup lang="ts">

import { ref, onMounted } from "vue";

import { useRoute, useRouter } from "vue-router";

import api from "@/core/api/axios";

import DeliveryForm from "../form/DeliveryForm.vue";

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

        const { data } = await api.get(
            `/settings/deliveries/${id}`
        );

        formRef.value?.setFormData(data.data);

    } finally {

        ui.hideLoader();
    }
};

const handleSubmit = async (form: any) => {

    ui.showLoader();

    try {

        await api.put(
            `/settings/deliveries/${id}`,
            form
        );

        router.push({
            name: "admin.deliveries"
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

onMounted(load);

</script>