<template>
    <div>
        <h1>
            {{ t("configuration.edit") }}
        </h1>

        <ConfigurationForm ref="formRef" @submit="handleSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import ConfigurationForm from "../form/ConfigurationForm.vue";
import type { ConfigurationItem } from "@/composables/types/configuration";
const { t } = useI18n();
const router = useRouter();
const ui = useUiStore();
const formRef = ref<any>(null);

const load = async () => {
    ui.showLoader();

    try {
        const { data } = await api.get(
            "/configuration/getShopData"
        );

        formRef.value?.setFormData(data);

    } finally {
        ui.hideLoader();
    }
};

const handleSubmit = async (
    form: ConfigurationItem[]
) => {
    ui.showLoader();
    try {
        await api.put(
            "/configuration/updateShopData",
            form
        );
        router.push({
            name: "admin.configuration"
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