import { reactive, onMounted } from "vue";

import { useI18n } from "vue-i18n";

import { useLangStore } from "@/core/stores/langStore";

import { useCurrencyStore } from "@/core/stores/currencyStore";

import type {
    Delivery,
    DeliveryPayload,
    DeliveryFormState,
} from "@/composables/types/delivery";

export function useDeliveryForm(
    emit: any,
    _options?: any
) {
    const { t } = useI18n();

    const langStore = useLangStore();

    const currencyStore = useCurrencyStore();

    const form = reactive<DeliveryFormState>({
        name: "",
        code: "",
        is_active: true,
        sort_order: 0,
        free_delivery_from: 0,

        langs: [],
        ranges: [],
    });

    const errors = reactive<Record<string, string>>({});

    const setBackendErrors = (
        backendErrors: any
    ) => {
        Object.keys(errors).forEach(
            k => (errors[k] = "")
        );

        for (const key in backendErrors) {
            errors[key] =
                backendErrors[key]?.[0] || "";
        }
    };

    const validate = () => {
        errors.name = form.name
            ? ""
            : t("delivery.errors.name_required");

        errors.code = form.code
            ? ""
            : t("delivery.errors.code_required");

        return !Object.values(errors).some(e => e);
    };

    onMounted(() => {
        if (
            !form.langs.length &&
            langStore.langs.length
        ) {
            form.langs = langStore.langs.map((lang: any) => ({
                lang_id: lang.id,

                code: lang.code,

                name: "",

                description: "",

                instructions: "",
            }));
        }
    });

    const buildPayload = (): DeliveryPayload => ({
        name: form.name,

        code: form.code,

        free_delivery_from: form.free_delivery_from,

        is_active: form.is_active,

        sort_order: form.sort_order,

        langs: form.langs.map((l: any) => ({
            lang_id: l.lang_id,

            name: l.name,

            description: l.description ?? "",

            instructions: l.instructions ?? "",
        })),

        ranges: form.ranges.map((r: any) => ({
            id: r.id,

            currency_id: r.currency_id,

            min_weight: r.min_weight,

            max_weight: r.max_weight,

            max_volume: r.max_volume,

            price: r.price,
        })),
    });

    const submit = () => {
        if (!validate()) {
            return;
        }

        emit(
            "submit",
            buildPayload()
        );
    };

    const setFormData = (data: Delivery | any) => {
        form.name = data.name || "";

        form.code = data.code || "";

        form.free_delivery_from = data.free_delivery_from || 0;

        form.is_active = !!data.is_active;

        form.sort_order = data.sort_order || 0;

        form.langs = langStore.langs.map((lang: any) => {
            const existing = data.langs?.find(
                (l: any) => l.id === lang.id
            );

            return {
                lang_id: lang.id,

                code: lang.code,

                name: existing?.name || "",

                description:
                    existing?.description || "",

                instructions:
                    existing?.instructions || "",
            };
        });

        form.ranges = (data.ranges || []).map((r: any) => ({
            id: r.id,

            currency_id: r.currency_id,

            min_weight: parseFloat(
                String(r.min_weight || 0)
                    .replace(",", ".")
            ),

            max_weight: parseFloat(
                String(r.max_weight || 0)
                    .replace(",", ".")
            ),


            max_volume: parseFloat(
                String(r.max_volume || 0)
                    .replace(",", ".")
            ),

            price: parseFloat(
                String(r.price || 0)
                    .replace(",", ".")
            ),
        }));
    };

    const addRange = () => {
        form.ranges.push({
            currency_id:
                currencyStore.currentCurrency?.id || null,

            min_weight: 0,

            max_weight: 0,

            max_volume: 0,

            price: 0,
        } as any);
    };

    const removeRange = (i: number) => {
        form.ranges.splice(i, 1);
    };

    return {
        form,

        errors,

        submit,

        setFormData,

        setBackendErrors,

        addRange,

        removeRange,
    };
}