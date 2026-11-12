import { computed, reactive } from "vue";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import { useI18n } from "vue-i18n";


export interface NewsletterSubject {
    id: number;
    name: string;
}

export function useNewsletterSubscribe() {
    const { t } = useI18n();
    const ui = useUiStore();

    const state = reactive({
        email: "",
        accepted: false,

        loading: false,
        subjectsLoading: false,

        subjects: [] as NewsletterSubject[],
        selectedSubjects: [] as number[],
    });

    const isValidEmail = computed(() => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
    });

    const validate = () => {
        if (!state.email) {
            ui.showError(t("newsletter.email_required"));
            return false;
        }

        if (!isValidEmail.value) {
            ui.showError(t("newsletter.invalid_email"));
            return false;
        }

        if (!state.accepted) {
            ui.showError(t("newsletter.accept_terms"));
            return false;
        }

        return true;
    };

    const loadSubjects = async () => {
        state.subjectsLoading = true;

        try {
            const { data } = await api.get("/newsletter");

            state.subjects = data.data;
        } catch (e) {
            console.error(e);
            ui.showError(t("newsletter.download_error"));
        } finally {
            state.subjectsLoading = false;
        }
    };

    const subscribe = async (useSelectedSubjects = false) => {
        if (!validate()) {
            return false;
        }

        state.loading = true;

        try {
            await api.post("/newsletter/subscribe", {
                email: state.email,
                subjects: useSelectedSubjects
                    ? state.selectedSubjects
                    : [],
            });

            ui.showSuccess(t("newsletter.subscribed"));

            reset();

            return true;
        } catch (e: any) {
            if (e.response?.status === 422) {
                ui.showError(t("common.fix_form"));
            } else {
                console.error(e);
                ui.showError(t("common.error_occurred"));
            }

            return false;
        } finally {
            state.loading = false;
        }
    };

    const reset = () => {
        state.email = "";
        state.accepted = false;
        state.selectedSubjects = [];
    };

    return {
        state,

        isValidEmail,

        validate,
        loadSubjects,
        subscribe,
        reset,
    };
}