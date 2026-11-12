<template>
    <form class="admin-form" @submit.prevent="submit">

        <div class="section">
            <h3>{{ t("common.basic") }}</h3>

            <div class="user-grid">
                <div class="form-group floating">
                    <BaseLabel>{{ t("payment.name") }}</BaseLabel>
                    <BaseInput v-model="form.name" />
                    <div class="error" v-if="errors.name">
                        {{ errors.name }}
                    </div>
                </div>

                <div class="form-group floating">
                    <BaseLabel>{{ t("payment.code") }}</BaseLabel>
                    <BaseInput v-model="form.code" />
                    <div class="error" v-if="errors.code">
                        {{ errors.code }}
                    </div>
                </div>


                <div class="form-group floating">
                    <BaseLabel>{{ t("payment.commission_percent") }}</BaseLabel>
                    <BaseInput type="number" v-model="form.commission_percent" />
                </div>
            </div>

            <BaseCheckbox v-model="form.is_active">
                {{ t("common.active") }}
            </BaseCheckbox>
        </div>

        <div class="section">
            <h3>{{ t("payment.icon") }}</h3>
            <div v-if="currentIconUrl" class="mb-2">
                <img :src="currentIconUrl" :alt="t('payment.icon')" style="max-height: 80px; object-fit: contain;" />
            </div>
            <div v-else class="text-muted mb-2">{{ t("payment.no_icon") }}</div>
            <input ref="iconInputRef" type="file" accept="image/png" @change="handleIconChange" style="display: none" />
            <BaseButton type="button" variant="secondary" @click="iconInputRef?.click()">
                {{ t("payment.upload_icon") }}
            </BaseButton>
        </div>

        <div class="section full">
            <TranslationFields :items="form.langs" :title="t('payment.langs')" :errors="errors" v-slot="{ item: lang }">
                <div class="form-group floating">
                    <BaseLabel>
                        {{ t("payment.lang_code") }}
                    </BaseLabel>

                    <BaseInput v-model="lang.name" />

                    <div class="error" v-if="errors[`lang_${lang.lang_id}`]">
                        {{ errors[`lang_${lang.lang_id}`] }}
                    </div>
                </div>
            </TranslationFields>
        </div>

        <div class="section full">
            <h3>{{ t("payment.configs") }}</h3>

            <div v-for="(c, i) in form.configs" :key="i" class="config-box">
                <div class="config-header">
                    <strong>
                        {{
                            countryOptions.find(x => x.id === c.country_id)?.display || '---'
                        }}
                    </strong>

                    <span class="remove" @click="removeConfig(i)">
                        <BaseIcon name="remove" class="me-2" />
                    </span>
                </div>

                <div class="payment-config-grid">

                    <div class="form-group floating">
                        <BaseLabel>{{ t("common.country") }}</BaseLabel>

                        <BaseSelect v-model="c.country_id" :options="countryOptions" labelKey="display" valueKey="id"
                            :placeholder="t('common.select')" />
                    </div>

                    <div class="form-group floating">
                        <BaseLabel>{{ t("common.currency") }}</BaseLabel>

                        <BaseSelect v-model="c.currency_id" :options="currencyOptions" labelKey="display" valueKey="id"
                            :placeholder="t('common.select')" />
                    </div>

                </div>
            </div>

            <BaseButton type="button" @click="addConfig">
                <BaseIcon name="plus" /> {{ t("payment.add_config") }}
            </BaseButton>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{ t(props.isEdit ? "payment.save" : "payment.create") }}
            </BaseButton>
        </div>

    </form>
</template>
<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';
import { computed, onMounted, ref } from "vue";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

import { usePaymentForm } from "./PaymentForm";
import { useI18n } from "vue-i18n";
import { useCurrencyStore } from "@/core/stores/currencyStore";
import { useCountryStore } from "@/core/stores/countryStore";
import api from "@/core/api/axios";

const { t } = useI18n();
const emit = defineEmits(["submit"]);
const props = defineProps<{ isEdit?: boolean; paymentMethodId?: number }>();

const currencyStore = useCurrencyStore();
const countryStore = useCountryStore();
const iconInputRef = ref<HTMLInputElement | null>(null);
const currentIconUrl = ref<string | null>(null);
const pendingIconFile = ref<File | null>(null);

const handleIconChange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (props.isEdit && props.paymentMethodId) {
        try {
            const formData = new FormData();
            formData.append("icon", file);
            const { data } = await api.post<{ icon_url: string }>(
                `/settings/payments/${props.paymentMethodId}/icon`,
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

    if (!countryStore.countries.length) {
        countryStore.fetchCountries();
    }
});

const currencyOptions = computed(() =>
    currencyStore.currencies.map(c => ({
        ...c,
        display: `${c.code} - ${c.symbol}`
    }))
);

const countryOptions = computed(() =>
    countryStore.countries.map(c => ({
        ...c,
        display: `${c.code} - ${c.name}`
    }))
);

const {
    form,
    errors,
    submit,
    setFormData,
    setBackendErrors,
    addConfig,
    removeConfig
} = usePaymentForm(emit, { isEdit: props.isEdit });

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
