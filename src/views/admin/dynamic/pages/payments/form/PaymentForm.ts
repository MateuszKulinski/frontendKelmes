import type {
    Payment,
    PaymentFormState,
    PaymentPayload,
} from "@/composables/types/payment";

import { reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useLangStore } from "@/core/stores/langStore";
import { useCurrencyStore } from "@/core/stores/currencyStore";



export function usePaymentForm(
    emit: (e: "submit", form: PaymentPayload) => void,
    options?: { isEdit?: boolean }
) {
    const langStore = useLangStore();
    const currencyStore = useCurrencyStore();
    const { t } = useI18n();

    const isEdit = options?.isEdit;

    const form = reactive<PaymentFormState>({
        name: "",
        code: "",
        is_active: true,
        sort_order: 0,
        commission_percent: 0,
        langs: [],
        configs: [],
    });

    const errors = reactive<Record<string, string>>({});

    const setBackendErrors = (backendErrors: Record<string, string[]>) => {
        Object.keys(errors).forEach(k => (errors[k] = ""));

        for (const key in backendErrors) {
            errors[key] = backendErrors[key][0];
        }
    };

    const validate = () => {
        errors.name = form.name ? "" : t("payment.errors.name_required");
        errors.code = form.code ? "" : t("payment.errors.code_required");

        form.langs.forEach(l => {
            const key = `lang_${l.lang_id}`;
            errors[key] = l.name ? "" : t("payment.errors.name_required");
        });

        return !Object.values(errors).some(e => e);
    };

    onMounted(() => {
        if (!form.langs.length && langStore.langs.length) {
            form.langs = langStore.langs.map(lang => ({
                lang_id: lang.id,
                code: lang.code,
                name: "",
            }));
        }
    });

    const buildPayload = (): PaymentPayload => ({
        name: form.name,
        code: form.code,
        is_active: form.is_active,
        sort_order: form.sort_order,
        commission_percent: form.commission_percent,

        langs: form.langs.map(l => ({
            lang_id: l.lang_id,
            name: l.name,
        })),

        configs: form.configs.map(c => ({
            id: c.id,
            country_id: c.country_id,
            currency_id: c.currency_id,

            account_number: c.account_number,
            iban: c.iban,
            swift: c.swift,
            bank_name: c.bank_name,
            account_owner: c.account_owner,
        })),
    });

    const submit = () => {
        if (!validate()) return;
        if (isEdit) {
            console.warn("UPDATE");
        }
        emit("submit", buildPayload());
    };

    const setFormData = (data: Payment) => {
        form.name = data.name;
        form.code = data.code;
        form.is_active = data.is_active;
        form.sort_order = data.sort_order;

        form.commission_percent = parseFloat(
            data.commission_percent.replace(",", ".")
        );

        form.langs = langStore.langs.map((lang) => {
            const existing = data.langs.find(l => l.lang_id === lang.id);

            return {
                lang_id: lang.id,
                code: lang.code,
                name: existing?.name || "",
            };
        });

        form.configs = data.configs.map(c => ({
            id: c.id,
            country_id: c.country?.id ?? null,
            currency_id: c.currency?.id ?? currencyStore.currentCurrency?.id ?? null,

            account_number: c.account_number || "",
            iban: c.iban || "",
            swift: c.swift || "",
            bank_name: c.bank_name || "",
            account_owner: c.account_owner || "",
        }));
    };

    const addConfig = () => {
        form.configs.push({
            country_id: null,
            currency_id: currencyStore.currentCurrency?.id || null,

            account_number: "",
            iban: "",
            swift: "",
            bank_name: "",
            account_owner: "",
        });
    };

    const removeConfig = (i: number) => {
        form.configs.splice(i, 1);
    };

    return {
        form,
        errors,
        submit,
        setFormData,
        setBackendErrors,
        addConfig,
        removeConfig,
    };
}