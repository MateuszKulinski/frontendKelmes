import { ref, onMounted, watch, computed } from "vue";
import api from "@/core/api/axios";
import { useI18n } from "vue-i18n";
import type { NewsletterSubject, NewsletterSubscriber } from "@/composables/types/newsletter";

export function useNewsletterSubscribers() {

    const { t } = useI18n();

    let controller: AbortController | null = null;
    let timeout: any = null;
    const subscribers = ref<NewsletterSubscriber[]>([]);
    const subjects = ref<NewsletterSubject[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref({
        subjects: [] as number[]
    });

    const sortBy = ref("subscribed_at");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 20,
        total: 0,
        last_page: 1
    });

    const activeFilters = computed(() => {

        const result: any[] = [];

        if (filters.value.subjects.length) {

            result.push({
                key: "subjects",
                label: t("newsletter.subjects"),
                value: filters.value.subjects
                    .map(id => subjects.value.find((s: any) => s.id === id)?.name)
                    .join(", ")
            });

        }

        return result;

    });

    const clearSingleFilter = (key: string) => {

        if (key === "subjects") {

            filters.value.subjects = [];

        }

    };

    const resetFilters = () => {

        filters.value.subjects = [];

        search.value = "";

        pagination.value.page = 1;

        fetchSubscribers();

    };

    const fetchSubscribers = async () => {

        controller?.abort();

        controller = new AbortController();

        if (!subscribers.value.length) {

            loading.value = true;

        } else {

            fetching.value = true;

        }

        try {

            const { data } = await api.get("/newsletter/subscribers", {

                signal: controller.signal,

                params: {
                    page: pagination.value.page,
                    search: search.value,
                    sort_by: sortBy.value,
                    sort_dir: sortDir.value,
                    subjects: filters.value.subjects
                }

            });

            subscribers.value = data.data;

            subjects.value = data.subjects;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page
            };

        } catch (e: any) {

            if (e.name === "CanceledError") return;

            console.error(e);

        } finally {

            loading.value = false;
            fetching.value = false;

        }

    };

    const triggerFetch = () => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            pagination.value.page = 1;

            fetchSubscribers();

        }, 400);

    };

    watch(search, triggerFetch);

    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {

        pagination.value.page = page;

        fetchSubscribers();

    };

    const handleSort = (payload: any) => {

        sortBy.value = payload.sortBy;

        sortDir.value = payload.sortDir;

        fetchSubscribers();

    };

    onMounted(fetchSubscribers);
    const exportSubscribers = async (type: "emails" | "advanced") => {

        const { data, headers } = await api.get(
            "/newsletter/subscribers/export",
            {
                responseType: "blob",
                params: {
                    search: search.value,
                    sort_by: sortBy.value,
                    sort_dir: sortDir.value,
                    subjects: filters.value.subjects,
                    type,
                },
            }
        );
        const contentType =
            typeof headers["content-type"] === "string"
                ? headers["content-type"]
                : "text/csv";

        const blob = new Blob([data], {
            type: contentType,
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        const disposition = headers["content-disposition"];

        let filename =
            type === "emails"
                ? "newsletter-emails.csv"
                : "newsletter-subscribers.csv";

        if (disposition) {
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match) {
                filename = match[1];
            }
        }

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    };

    return {

        subscribers,
        subjects,
        loading,
        fetching,
        pagination,
        filters,
        search,
        activeFilters,
        clearSingleFilter,
        resetFilters,
        goToPage,
        handleSort,
        sortBy,
        sortDir,
        fetchSubscribers,
        exportSubscribers

    };

}