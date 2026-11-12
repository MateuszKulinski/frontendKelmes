<template>
    <form @submit.prevent="handleSubmit">
        <BaseInput v-model="form.name" :label="t('center_cost.name')" :error="!!errors.name" required />

        <div class="form-actions">
            <BaseButton type="submit" :disabled="submitting">
                {{ t("common.save") }}
            </BaseButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";

export interface CenterCostFormData {
    name: string;
}

export interface CenterCostFormExpose {
    setFormData: (data: CenterCostFormData) => void;
    setBackendErrors: (
        errors: Record<string, string[]>
    ) => void;
}

const emit = defineEmits<{
    submit: [payload: CenterCostFormData];
}>();

const { t } = useI18n();

const form = ref<CenterCostFormData>({
    name: "",
});

const errors = ref<Record<string, string>>({});
const submitting = ref(false);

const handleSubmit = () => {
    errors.value = {};
    emit("submit", {
        name: form.value.name,
    });
};

const setFormData = (data: CenterCostFormData) => {
    form.value = {
        name: data.name ?? "",
    };
};

const setBackendErrors = (
    backendErrors: Record<string, string[]>
) => {
    errors.value = Object.fromEntries(
        Object.entries(backendErrors).map(([key, messages]) => [
            key,
            messages?.[0] ?? "",
        ])
    );
};

defineExpose<CenterCostFormExpose>({
    setFormData,
    setBackendErrors,
});
</script>