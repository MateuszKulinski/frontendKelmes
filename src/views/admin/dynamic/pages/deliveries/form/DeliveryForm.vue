<template>

    <form class="admin-form" @submit.prevent="submit">
        <div class="section">
            <h3>{{ t("common.basic") }}</h3>
            <div class="user-grid">
                <div class="form-group floating">
                    <BaseLabel>
                        {{ t("delivery.name") }}
                    </BaseLabel>
                    <BaseInput v-model="form.name" />
                    <div class="error" v-if="errors.name">
                        {{ errors.name }}
                    </div>
                </div>
                <div class="form-group floating">
                    <BaseLabel>
                        {{ t("delivery.code") }}
                    </BaseLabel>
                    <BaseInput v-model="form.code" />
                    <div class="error" v-if="errors.code">
                        {{ errors.code }}
                    </div>
                </div>
                <div class="form-group floating">
                    <BaseLabel>
                        {{ t("configuration.free_delivery_from") }}
                    </BaseLabel>
                    <BaseInput v-model="form.free_delivery_from" />
                    <div class="error" v-if="errors.code">
                        {{ errors.code }}
                    </div>
                </div>
            </div>

            <BaseCheckbox v-model="form.is_active">
                {{ t("common.active") }}
            </BaseCheckbox>

        </div>

        <div class="section">
            <h3>{{ t("delivery.icon") }}</h3>
            <div v-if="currentIconUrl" class="mb-2">
                <img :src="currentIconUrl" :alt="t('delivery.icon')" style="max-height: 80px; object-fit: contain;" />
            </div>
            <div v-else class="text-muted mb-2">{{ t("delivery.no_icon") }}</div>
            <input ref="iconInputRef" type="file" accept="image/png" @change="handleIconChange" style="display: none" />
            <BaseButton type="button" variant="secondary" @click="iconInputRef?.click()">
                {{ t("delivery.upload_icon") }}
            </BaseButton>
        </div>

        <div class="section full">
            <TranslationFields :items="form.langs" :title="t('delivery.langs')" :errors="errors" v-slot="{ item: lang }">
                <div class="user-grid">
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("delivery.name") }}
                        </BaseLabel>
                        <BaseInput v-model="lang.name" />
                    </div>
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("common.description") }}
                        </BaseLabel>
                        <BaseInput v-model="lang.description" />
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>
                        {{ t("delivery.instructions") }}
                    </BaseLabel>
                    <textarea v-model="lang.instructions" class="form-control" rows="3" />
                </div>
            </TranslationFields>
        </div>

        <div class="section full">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3>
                    {{ t("delivery.ranges") }}
                </h3>
                <BaseButton type="button" @click="addRange">
                    <BaseIcon name="plus" />
                    {{ t("delivery.add_range") }}
                </BaseButton>
            </div>

            <div v-for="(range, i) in form.ranges" :key="i" class="config-box">
                <div class="config-header">
                    <strong>
                        {{ getCurrency(range.currency_id) }}
                    </strong>
                    <span class="remove" @click="removeRange(i)">
                        <BaseIcon name="remove" class="me-2" />
                    </span>
                </div>

                <div class="payment-config-grid">
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("common.currency") }}
                        </BaseLabel>
                        <BaseSelect v-model="range.currency_id" :options="currencyOptions" labelKey="display"
                            valueKey="id" />
                    </div>

                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("delivery.min_weight") }}
                        </BaseLabel>
                        <BaseInput type="number" v-model="range.min_weight" />
                    </div>

                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("delivery.max_weight") }}
                        </BaseLabel>
                        <BaseInput type="number" v-model="range.max_weight" />
                    </div>
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("delivery.price") }}
                        </BaseLabel>
                        <BaseInput type="number" v-model="range.price" />
                    </div>

                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("delivery.max_volume") }}
                        </BaseLabel>
                        <BaseInput type="number" v-model="range.max_volume" />
                    </div>
                </div>
            </div>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{
                    t(
                        props.isEdit
                            ? "delivery.save"
                            : "delivery.create"
                    )
                }}
            </BaseButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';

import { computed, onMounted, ref } from "vue";

import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";

import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

import { useCurrencyStore } from "@/core/stores/currencyStore";

import { useDeliveryForm } from "./DeliveryForm";
import api from "@/core/api/axios";

const emit = defineEmits(["submit"]);

const props = defineProps<{
    isEdit?: boolean;
    deliveryMethodId?: number;
}>();

const { t } = useI18n();

const currencyStore = useCurrencyStore();
const iconInputRef = ref<HTMLInputElement | null>(null);
const currentIconUrl = ref<string | null>(null);
const pendingIconFile = ref<File | null>(null);

const handleIconChange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (props.isEdit && props.deliveryMethodId) {
        try {
            const formData = new FormData();
            formData.append("icon", file);
            const { data } = await api.post<{ icon_url: string }>(
                `/settings/deliveries/${props.deliveryMethodId}/icon`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            currentIconUrl.value = data.icon_url;
        } catch {
            alert(t("common.error_occurred"));
        }
    } else {
        pendingIconFile.value = file;
        currentIconUrl.value = URL.createObjectURL(file);
    }

    (event.target as HTMLInputElement).value = "";
};

onMounted(() => {

    if (!currencyStore.currencies.length) {
        currencyStore.fetchCurrencies();
    }
});

const currencyOptions = computed(() =>
    currencyStore.currencies.map(c => ({
        ...c,
        display: `${c.code} - ${c.symbol}`
    }))
);

const getCurrency = (currencyId: number | null) => {

    const currency = currencyStore.currencies.find(
        c => c.id === currencyId
    );

    if (!currency) {
        return "---";
    }

    return `${currency.code} (${currency.symbol})`;
};

const {
    form,
    errors,
    submit,
    setFormData,
    setBackendErrors,
    addRange,
    removeRange
} = useDeliveryForm(
    emit,
    {
        isEdit: props.isEdit
    }
);

defineExpose({
    setFormData: (data: any) => {
        currentIconUrl.value = data.icon_url ?? null;
        setFormData(data);
    },
    handleValidationError: setBackendErrors,
    getPendingIconFile: () => pendingIconFile.value,
});

</script>

<style scoped src="@admin/assets/Form.css"></style>