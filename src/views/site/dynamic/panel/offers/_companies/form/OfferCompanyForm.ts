import { reactive } from "vue";
import { useI18n } from "vue-i18n";

import type {
    OfferCompanyDetails,
    OfferCompanySubmitPayload,
} from "@/composables/types/offerCompany";

type Emit = (
    event: "submit",
    payload: OfferCompanySubmitPayload
) => void;

export const useOfferCompanyForm = (
    emit: Emit
) => {

    const { t } = useI18n();

    const form = reactive<OfferCompanySubmitPayload>({
        name: "",
        street: "",
        house_number: "",
        apartment: "",
        zip_code: "",
        city: "",
        phone_1: "",
        phone_2: "",
        email_1: "",
        email_2: "",
        authorized_person: "",
        is_for_others: false,
        is_archive: false,
    });

    const errors = reactive<Record<string, string>>({});

    const validate = () => {
        errors.name = form.name ? "" : t("validation.required");
        errors.street = form.street ? "" : t("validation.required");
        errors.house_number = form.house_number ? "" : t("validation.required");
        errors.zip_code = form.zip_code ? "" : t("validation.required");
        errors.city = form.city ? "" : t("validation.required");
        return !Object.values(errors).some(Boolean);
    };

    const submit = () => {

        if (!validate()) {
            return;
        }

        emit("submit", {
            ...form,
            apartment: form.apartment || "",
            phone_1: form.phone_1 || "",
            phone_2: form.phone_2 || "",
            email_1: form.email_1 || "",
            email_2: form.email_2 || "",
            authorized_person:
                form.authorized_person || "",
        });

    };

    const setBackendErrors = (
        backendErrors: Record<string, string[]>
    ) => {
        Object.keys(errors).forEach(key => {
            errors[key] = "";
        });

        Object.entries(backendErrors).forEach(([k, v]) => {
            errors[k] = v[0];
        });
    };

    const setFormData = (
        data: OfferCompanyDetails
    ) => {
        Object.assign(form, data);
    };

    return {
        form,
        errors,
        submit,
        setBackendErrors,
        setFormData,

    };
};