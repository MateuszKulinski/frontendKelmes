<template>

    <h1>Edycja firmy</h1>

    <OfferCompanyForm ref="formRef" @submit="handleSubmit" />

</template>

<script setup lang="ts">

import axios from "axios";

import {
    onMounted,
    ref
} from "vue";

import {
    useRoute
} from "vue-router";

import api from "@/core/api/axios";

import OfferCompanyForm
    from "../form/OfferCompanyForm.vue";

import { useUiStore } from "@/core/stores/uiStore";

import type {
    OfferCompanyDetails,
    OfferCompanyFormExpose,
    OfferCompanySubmitPayload
} from "@/composables/types/offerCompany";

const ui = useUiStore();

const route = useRoute();

const formRef =
    ref<OfferCompanyFormExpose | null>(null);

const load = async () => {
    const { data } = await api.get<{
        data: OfferCompanyDetails
    }>(
        `/offers/company/${route.params.id}`
    );

    formRef.value?.setFormData(
        data.data
    );
};

const handleSubmit = async (
    payload: OfferCompanySubmitPayload
) => {

    try {
        await api.put(
            `/offers/company/${route.params.id}`,
            payload
        );
        ui.showSuccess("Zapisano");
    }
    catch (e) {
        if (
            axios.isAxiosError(e)
            &&
            e.response?.status === 422
        ) {
            formRef.value?.setBackendErrors(
                e.response.data.errors
            );
        }
    }
};

onMounted(load);

</script>