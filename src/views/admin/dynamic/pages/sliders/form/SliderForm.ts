import { reactive } from 'vue';
import { useLangStore } from '@/core/stores/langStore';
import type { SliderDetail, SliderFormState, SliderLangForm } from '@/composables/types/slider';

export function useSliderForm(emit: any) {
    const langStore = useLangStore();

    const form = reactive<SliderFormState>({
        sort_order:  0,
        category_id: null,
        is_active:   true,
        langs:       [],
    });

    const errors = reactive<Record<string, string>>({});

    const ensureLangs = () => {
        if (!form.langs.length && langStore.langs.length) {
            form.langs = langStore.langs.map((lang: any) => ({
                lang_id:     lang.id,
                title:       '',
                content:     '',
                link:        '',
                button_text: '',
            }));
        }
    };

    const setFormData = (data: SliderDetail) => {
        form.sort_order  = data.sort_order  ?? 0;
        form.category_id = data.category_id ?? null;
        form.is_active   = data.is_active   ?? true;

        if (data.langs?.length) {
            form.langs = data.langs.map((l): SliderLangForm => ({
                lang_id:     l.lang_id,
                title:       l.title       ?? '',
                content:     l.content     ?? '',
                link:        l.link        ?? '',
                button_text: l.button_text ?? '',
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

    const buildFormData = (imageFile: File | null): FormData => {
        const fd = new FormData();
        fd.append('sort_order',  String(form.sort_order));
        fd.append('is_active',   form.is_active ? '1' : '0');
        if (form.category_id !== null) fd.append('category_id', String(form.category_id));
        form.langs.forEach((l, i) => {
            fd.append(`langs[${i}][lang_id]`,     String(l.lang_id));
            fd.append(`langs[${i}][title]`,       l.title);
            fd.append(`langs[${i}][content]`,     l.content);
            fd.append(`langs[${i}][link]`,        l.link);
            fd.append(`langs[${i}][button_text]`, l.button_text);
        });
        if (imageFile) fd.append('image', imageFile);
        return fd;
    };

    const submit = (imageFile: File | null) => {
        emit('submit', buildFormData(imageFile));
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
