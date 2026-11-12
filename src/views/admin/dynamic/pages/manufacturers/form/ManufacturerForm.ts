import { reactive } from 'vue';
import { useLangStore } from '@/core/stores/langStore';
import type { ManufacturerDetail, ManufacturerFormState, ManufacturerLangForm } from '@/composables/types/manufacturer';

export function useManufacturerForm(emit: any) {
    const langStore = useLangStore();

    const form = reactive<ManufacturerFormState>({
        erp_id_producent: null,
        name: '',
        website: '',
        is_active: true,
        langs: [],
    });

    const errors = reactive<Record<string, string>>({});

    const ensureLangs = () => {
        if (!form.langs.length && langStore.langs.length) {
            form.langs = langStore.langs.map((lang: any) => ({
                lang_id:     lang.id,
                description: '',
            }));
        }
    };

    const setFormData = (data: ManufacturerDetail) => {
        form.erp_id_producent = data.erp_id_producent ?? null;
        form.name             = data.name ?? '';
        form.website          = data.website ?? '';
        form.is_active        = data.is_active ?? true;

        if (data.langs?.length) {
            form.langs = data.langs.map((l): ManufacturerLangForm => ({
                lang_id:     l.lang_id,
                description: l.description ?? '',
            }));
        } else {
            ensureLangs();
        }
    };

    const setBackendErrors = (backendErrors: any) => {
        Object.keys(errors).forEach(k => (errors[k] = ''));
        for (const key in backendErrors) {
            errors[key] = backendErrors[key]?.[0] ?? '';
        }
    };

    const buildPayload = (): Record<string, any> => ({
        erp_id_producent: form.erp_id_producent,
        name:             form.name     || null,
        website:          form.website  || null,
        is_active:        form.is_active ? 1 : 0,
        langs:            form.langs.map(l => ({
            lang_id:     l.lang_id,
            description: l.description,
        })),
    });

    const submit = () => {
        Object.keys(errors).forEach(k => (errors[k] = ''));

        let valid = true;

        if (!form.name?.trim()) {
            errors.name = 'Pole wymagane podaj nazwę producenta';
            valid = false;
        }
        if (!form.website?.trim()) {
            errors.website = 'Pole wymagane podaj adres strony WWW';
            valid = false;
        }
        if (form.erp_id_producent === null || form.erp_id_producent === undefined) {
            errors.erp_id_producent = 'Pole wymagane podaj ID ERP producenta';
            valid = false;
        }

        if (!valid) return;

        emit('submit', buildPayload());
    };

    return {
        form,
        errors,
        ensureLangs,
        setFormData,
        setBackendErrors,
        handleValidationError: setBackendErrors,
        submit,
    };
}
