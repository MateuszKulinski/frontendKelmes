
import { reactive } from "vue";
import { useI18n } from "vue-i18n";

export interface LimitFormData {
    name: string;
    limit_type: number | null;
    time_limit: number | null;
    quantity: number | null;
    price: number | null;
    is_exceedable: boolean;
    is_tax: boolean;
    approval_mode: "sequential" | "parallel";
    date_start: string;
    date_end: string;
}

export function useLimitForm(
    emit: (event: "submit", data: LimitFormData) => void
) {
    const { t } = useI18n();

    const form = reactive<LimitFormData>({
        name: "",
        limit_type: 1,
        time_limit: 1,
        quantity: null,
        price: null,
        is_exceedable: false,
        is_tax: false,
        approval_mode: "sequential",
        date_start: "",
        date_end: "",
    });

    const errors = reactive<Record<string, string>>({});

    const setBackendErrors = (
        backendErrors: Record<string, string[]>
    ) => {
        Object.keys(errors).forEach(key => {
            errors[key] = "";
        });

        for (const key in backendErrors) {
            errors[key] = backendErrors[key]?.[0] ?? "";
        }
    };

    const validate = (): boolean => {
        Object.keys(errors).forEach(key => {
            errors[key] = "";
        });

        if (!form.name.trim()) {
            errors.name = t("limits.name_required");
        }

        if (!form.limit_type) {
            errors.limit_type = t("limits.type_required");
        }

        if (!form.time_limit) {
            errors.time_limit = t("limits.period_required");
        }

        if (
            [1, 3, 4].includes(Number(form.limit_type)) &&
            (form.quantity === null ||
                form.quantity === undefined ||
                form.quantity < 0)
        ) {
            errors.quantity = t("limits.quantity_required");
        }

        if (
            [2, 3, 4].includes(Number(form.limit_type)) &&
            (form.price === null ||
                form.price === undefined ||
                form.price < 0)
        ) {
            errors.price = t("limits.price_required");
        }

        if (Number(form.time_limit) === 5) {
            if (!form.date_start) {
                errors.date_start = t("limits.start_date_required");
            }

            if (!form.date_end) {
                errors.date_end = t("limits.end_date_required");
            } else if (
                form.date_start &&
                form.date_end < form.date_start
            ) {
                errors.date_end = t("limits.invalid_date_range");
            }
        }

        return !Object.values(errors).some(Boolean);
    };

    const submit = () => {
        if (!validate()) return;

        const payload: LimitFormData = {
            ...form,
            quantity: [1, 3, 4].includes(Number(form.limit_type))
                ? form.quantity
                : null,
            price: [2, 3, 4].includes(Number(form.limit_type))
                ? form.price
                : null,
            date_start: Number(form.time_limit) === 5
                ? form.date_start
                : "",
            date_end: Number(form.time_limit) === 5
                ? form.date_end
                : "",
        };

        emit("submit", payload);
    };

    const setFormData = (data: Partial<LimitFormData>) => {
        form.name = data.name ?? "";
        form.limit_type = data.limit_type ?? 1;
        form.time_limit = data.time_limit ?? 1;
        form.quantity = data.quantity ?? null;
        form.price = data.price ?? null;
        form.is_exceedable = Boolean(data.is_exceedable);
        form.is_tax = Boolean(data.is_tax);
        form.approval_mode = data.approval_mode === "parallel"
            ? "parallel"
            : "sequential";

        form.date_start = data.date_start
            ? String(data.date_start).slice(0, 10)
            : "";

        form.date_end = data.date_end
            ? String(data.date_end).slice(0, 10)
            : "";
    };

    return {
        form,
        errors,
        submit,
        validate,
        setFormData,
        setBackendErrors,
    };
}
