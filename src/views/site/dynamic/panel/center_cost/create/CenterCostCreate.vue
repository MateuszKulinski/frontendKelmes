<template>
    <div class="center-cost-create">
        <h1>{{ t("center_cost.add") }}</h1>

        <CenterCostForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { useNavigation } from "@/composables/useNavigation";
import { useUiStore } from "@/core/stores/uiStore";

import CenterCostForm from "../form/CenterCostForm.vue";
import type {
    CenterCostFormExpose,
    CenterCostFormData,
} from "../form/CenterCostForm.vue";

const { t } = useI18n();
const { goTo } = useNavigation();
const ui = useUiStore();

const formRef = ref<CenterCostFormExpose | null>(null);

const handleSubmit = async (
    payload: CenterCostFormData
) => {
    try {
        await api.post("/center-costs", payload);

        ui.showSuccess(
            t("center_cost.created")
        );

        goTo("centerCosts");
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