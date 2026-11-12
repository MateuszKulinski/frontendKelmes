<template>

    <h1>

        {{ t("offer.company_create") }}

    </h1>

    <OfferCompanyForm ref="formRef" @submit="handleSubmit" />

</template>
<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";
import OfferCompanyForm
    from "../form/OfferCompanyForm.vue";
import { useNavigation } from "@/composables/useNavigation";
import { useUiStore } from "@/core/stores/uiStore";
import type {
    OfferCompanyFormExpose,
    OfferCompanySubmitPayload
} from "@/composables/types/offerCompany";

const { t } = useI18n();
const ui = useUiStore();
const { goTo } = useNavigation();
const formRef =
    ref<OfferCompanyFormExpose | null>(null);

const handleSubmit = async (
    payload: OfferCompanySubmitPayload
) => {
    console.log("A");

    try {
        console.log("B");
        const { data } =
            await api.post(
                "/offers/company",
                payload
            );

        ui.showSuccess(
            t("common.saved")
        );

        goTo(
            "offerCompanies",
            {
                id: data.id
            }
        );
    }
    catch (e) {
        console.log("C");

        if (
            axios.isAxiosError(e)
            &&
            e.response?.status === 422
        ) {
            formRef.value?.setBackendErrors(
                e.response.data.errors
            );
            return;
        }
    }
};

</script>