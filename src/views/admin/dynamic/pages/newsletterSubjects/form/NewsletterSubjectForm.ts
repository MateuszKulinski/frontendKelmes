import { reactive } from "vue";
import { useLangStore } from "@/core/stores/langStore";

export function useNewsletterSubjectForm(
    emit: (event: "submit", payload: any) => void
) {
    const langStore = useLangStore();

    const form = reactive({
        langs: [] as {
            lang_id: number;
            name: string;
        }[],
    });

    const errors = reactive<Record<string, string>>({});

    const ensureLangs = () => {
        if (form.langs.length) return;

        form.langs = langStore.langs.map((lang: any) => ({
            lang_id: lang.id,
            name: "",
        }));
    };

    const submit = () => {
        Object.keys(errors).forEach((k) => delete errors[k]);

        emit("submit", {
            langs: form.langs,
        });
    };

    const setBackendErrors = (
        backendErrors: Record<string, string[]>
    ) => {
        Object.keys(errors).forEach((k) => delete errors[k]);

        Object.entries(backendErrors).forEach(([key, value]) => {
            errors[key] = value[0];
        });
    };

    const handleValidationError = (
        backendErrors: Record<string, string[]>
    ) => {
        setBackendErrors(backendErrors);
    };

    const setFormData = (data: any) => {
        form.langs = data.langs.map((l: any) => ({
            lang_id: l.lang_id,
            name: l.name,
        }));
    };

    return {
        form,
        errors,
        ensureLangs,
        submit,
        setBackendErrors,
        handleValidationError,
        setFormData,
    };
}