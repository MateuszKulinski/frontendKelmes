import { reactive } from 'vue';
import { useLangStore } from '@/core/stores/langStore';
import type { CmsDetail, CmsFormState, CmsLangForm } from '@/composables/types/cms';

export function useCmsForm(emit: any) {
    const langStore = useLangStore();

    const form = reactive<CmsFormState>({
        is_active: true,
        langs: [],
    });

    const errors = reactive<Record<string, string>>({});

    const ensureLangs = () => {
        if (!form.langs.length && langStore.langs.length) {
            form.langs = langStore.langs.map((lang: any) => ({
                lang_id: lang.id,
                title:   '',
                content: '',
                slug:    '',
            }));
        }
    };

    const setFormData = (data: CmsDetail) => {
        form.is_active = data.is_active ?? true;

        if (data.langs?.length) {
            form.langs = data.langs.map((l): CmsLangForm => ({
                lang_id: l.lang_id,
                title:   l.title   ?? '',
                content: l.content ?? '',
                slug:    l.slug    ?? '',
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
        is_active: form.is_active ? 1 : 0,
        langs: form.langs.map(l => ({
            lang_id: l.lang_id,
            title:   l.title,
            content: l.content,
            slug:    l.slug,
        })),
    });

    const submit = () => {
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
