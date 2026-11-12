<template>
    <form class="admin-form" @submit.prevent="submit">
        <div class="section full">
            <h3>
                {{ t("configuration.edit") }}
            </h3>

            <div class="configuration-grid">
                <div v-for="item in form" :key="item.id" class="form-group floating">
                    <BaseLabel>
                        {{ t(`configuration.${item.name}`) }}
                    </BaseLabel>

                    <BaseSelect v-if="item.options" v-model="item.value" :options="item.options" labelKey="name"
                        valueKey="id" />

                    <BaseInput v-else :model-value="item.value ?? ''"
                        @update:model-value="item.value = $event" />

                    <div class="error" v-if="errors[item.name]">
                        {{ errors[item.name] }}
                    </div>
                </div>
            </div>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{ t("configuration.save") }}
            </BaseButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { useI18n } from "vue-i18n";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import type { ConfigurationItem } from "@/composables/types/configuration";

const emit = defineEmits(["submit"]);

const { t } = useI18n();

const form = ref<ConfigurationItem[]>([]);
const errors = reactive<Record<string, string>>({});
const setFormData = (
    data: ConfigurationItem[]
) => {
    form.value = data.map(item => {
        if (item.name === "default_delivery" || item.name === "default_payment") {
            return {
                ...item,
                options: [
                    { id: null, name: t("configuration.no_default") },
                    ...(item.options ?? []),
                ],
            };
        }

        return item;
    });
};

const setBackendErrors = (
    backendErrors: Record<string, string[]>
) => {
    Object.keys(errors).forEach(
        key => delete errors[key]
    );

    Object.entries(backendErrors).forEach(
        ([key, value]) => {
            errors[key] = value[0];
        }
    );
};

const submit = () => {
    emit("submit", form.value);
};

defineExpose({
    setFormData,
    handleValidationError: setBackendErrors,
});
</script>

<style scoped src="@admin/assets/Form.css"></style>
