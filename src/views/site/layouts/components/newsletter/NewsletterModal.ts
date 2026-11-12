import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { useGlobalModal } from "@/views/modals/GlobalModal";
import type { NewsletterComposable } from "@/composables/types/newsletter";

export function useNewsletterModal(newsletter: NewsletterComposable) {

    const { t } = useI18n();
    const modal = useGlobalModal();

    onMounted(async () => {
        if (!newsletter.state.subjects.length) {
            await newsletter.loadSubjects();
        }
    });

    const toggleSubject = (id: number, event: Event) => {
        const checked = (event.target as HTMLInputElement).checked;
        const index = newsletter.state.selectedSubjects.indexOf(id);

        if (checked && index === -1) {
            newsletter.state.selectedSubjects.push(id);
        } else if (!checked && index !== -1) {
            newsletter.state.selectedSubjects.splice(index, 1);
        }

    };

    const submit = async () => {

        const ok = await newsletter.subscribe(true);

        if (ok) {
            modal.close();
        }

    };

    const close = () => {
        modal.close();
    };

    return {
        t,
        newsletter,
        toggleSubject,
        submit,
        close,
    };
}