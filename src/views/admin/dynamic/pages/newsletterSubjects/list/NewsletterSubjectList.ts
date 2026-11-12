import { ref } from "vue";

import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import { useI18n } from "vue-i18n";

export interface NewsletterSubject {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export function useNewsletterSubjectList() {

    const { t } = useI18n();
    const ui = useUiStore();

    const subjects = ref<NewsletterSubject[]>([]);
    const loading = ref(false);

    const loadSubjects = async () => {

        loading.value = true;

        try {

            const { data } = await api.get("/newsletter");

            subjects.value = data.data;

        } catch (e) {

            console.error(e);
            ui.showError(t("newsletter.download_error"));

        } finally {

            loading.value = false;

        }

    };

    return {
        subjects,
        loading,
        loadSubjects,
    };

}