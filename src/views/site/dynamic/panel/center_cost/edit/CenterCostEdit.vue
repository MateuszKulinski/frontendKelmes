<template>
    <div class="center-cost-edit">
        <h1>{{ t("center_cost.edit") }}</h1>

        <CenterCostForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import { useNavigation } from "@/composables/useNavigation";

import CenterCostForm from "../form/CenterCostForm.vue";

import type {
    CenterCostFormExpose,
    CenterCostFormData,
} from "../form/CenterCostForm.vue";

interface CenterCostResponse extends CenterCostFormData {
    id: number;
    unit_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const { goTo } = useNavigation();
const { t } = useI18n();
const route = useRoute();
const ui = useUiStore();

const formRef = ref<CenterCostFormExpose | null>(null);

const centerCostId = Number(route.params.id);

const loadCenterCost = async () => {
    ui.showLoader();

    try {
        const { data } = await api.get<CenterCostResponse>(
            `/center-costs/${centerCostId}`
        );

        formRef.value?.setFormData(data);
    } catch (e) {
        console.error(e);

        ui.showError(
            t("center_cost.download_error")
        );
    } finally {
        ui.hideLoader();
    }
};

const handleSubmit = async (
    form: CenterCostFormData
) => {
    try {
        await api.put(
            `/center-costs/${centerCostId}`,
            form
        );

        ui.showSuccess(
            t("center_cost.updated")
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

onMounted(loadCenterCost);
</script>