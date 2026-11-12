import { reactive } from "vue";

import { useLangStore } from "@/core/stores/langStore";

import type {
    NewsCategoryDetail,
    NewsCategoryFormLang,
    NewsCategoryPayload,
} from "@/composables/types/newsCategories";

interface NewsCategoryFormState {
    is_active: boolean;
    langs: NewsCategoryFormLang[];
}

type Emit = (
    event: "submit",
    payload: NewsCategoryPayload
) => void;

export function useNewsCategoryForm(emit: Emit) {
    const langStore = useLangStore();

    const form = reactive<NewsCategoryFormState>({
        is_active: true,
        langs: [],
    });

    const errors = reactive<Record<string, string>>({});

    /**
     * Tworzy pusty formularz dla wszystkich dostępnych języków.
     */
    const ensureLangs = () => {
        if (form.langs.length || !langStore.langs.length) {
            return;
        }

        form.langs = langStore.langs.map((lang) => ({
            lang_id: lang.id,
            title: "",
            slug: "",
            short_description: "",
            image: null,
        }));
    };

    /**
     * Ustawia dane formularza na podstawie danych z API.
     *
     * UWAGA:
     * image z API jest stringiem (nazwa pliku),
     * ale formularz przechowuje nowo wybrany plik jako File.
     *
     * Na potrzeby create ustawiamy image = null.
     * Przy update później możemy dodać osobne image_url/current_image.
     */
    const setFormData = (data: NewsCategoryDetail) => {
        form.is_active = data.is_active ?? true;

        if (data.langs?.length) {
            form.langs = data.langs.map((lang) => ({
                lang_id: lang.lang_id,
                title: lang.title ?? "",
                slug: lang.slug ?? "",
                short_description: lang.short_description ?? "",
                image: null,
            }));
        } else {
            ensureLangs();
        }
    };

    /**
     * Obsługa wybranego pliku dla konkretnego języka.
     */
    const onLangImageChange = (
        event: Event,
        lang: NewsCategoryFormLang
    ) => {
        const input = event.target as HTMLInputElement;

        if (!input.files?.length) {
            lang.image = null;
            return;
        }

        lang.image = input.files[0];
    };

    /**
     * Czyści błędy walidacji backendu.
     */
    const clearErrors = () => {
        Object.keys(errors).forEach((key) => {
            delete errors[key];
        });
    };

    /**
     * Ustawia błędy walidacji z Laravel.
     */
    const setBackendErrors = (
        backendErrors: Record<string, string[]>
    ) => {
        clearErrors();

        Object.entries(backendErrors).forEach(([key, value]) => {
            errors[key] = value?.[0] ?? "";
        });
    };

    /**
     * Buduje payload do wysłania.
     *
     * image pozostaje tutaj File | null.
     * CreateCategory.vue zamieni payload na FormData.
     */
    const buildPayload = (): NewsCategoryPayload => ({
        is_active: Number(form.is_active),

        langs: form.langs.map((lang) => ({
            lang_id: lang.lang_id,
            title: lang.title,
            slug: lang.slug,
            short_description: lang.short_description,
            image: lang.image,
        })),
    });

    /**
     * Submit formularza.
     */
    const submit = () => {
        emit("submit", buildPayload());
    };

    return {
        form,
        errors,

        ensureLangs,
        setFormData,

        onLangImageChange,

        submit,

        handleValidationError: setBackendErrors,
    };
}