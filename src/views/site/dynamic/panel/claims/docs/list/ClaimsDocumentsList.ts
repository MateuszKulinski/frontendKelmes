import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/core/api/axios";
// import type {
//     ClaimType,
//     ClaimDocumentListItem,
//     ClaimsDocumentsResponse,
// } from "@entities/claim";

import type {
  ClaimType,
  ClaimDocumentListItem,
  ClaimsDocumentsResponse,
  ClaimsListResponse,
  ClaimSummary,
} from "@/composables/types/claims";

export function useClaimsDocuments() {
  const route = useRoute();
  const router = useRouter();

  const documents = ref<ClaimDocumentListItem[]>([]);
  const claims = ref<ClaimSummary[]>([]);

  const loading = ref(true);
  const fetching = ref(false);
  const isCreating = computed(
    () => route.name === "panel.claims.documents.new",
  );

  const search = ref("");

  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  let controller: AbortController | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const claimType = computed<ClaimType>(() => {
    return Number(route.query.type) === 2 ? 2 : 1;
  });

  const isReturn = computed(() => claimType.value === 2);

  const titleKey = computed(() =>
    isReturn.value ? "claims.return_documents" : "claims.claim_documents",
  );

  const actionKey = computed(() =>
    isReturn.value ? "claims.return" : "claims.claim",
  );

  const fetchDocuments = async () => {
    if (controller) {
      controller.abort();
    }

    controller = new AbortController();

    if (documents.value.length === 0) {
      loading.value = true;
    } else {
      fetching.value = true;
    }

    try {
      const { data } = await api.get<ClaimsDocumentsResponse>(
        "/claims/documents",
        {
          signal: controller.signal,
          params: {
            claim_type: claimType.value,
            search: search.value,
            page: pagination.value.page,
            per_page: pagination.value.per_page,
          },
        },
      );

      documents.value = data.data;

      pagination.value = {
        page: data.current_page,
        per_page: data.per_page,
        total: data.total,
        last_page: data.last_page,
      };
    } catch (e: any) {
      if (e.name === "CanceledError") {
        return;
      }

      console.error("Fetch claim documents failed", e);
    } finally {
      loading.value = false;
      fetching.value = false;
    }
  };

  const triggerFetch = () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      pagination.value.page = 1;
      fetchDocuments();
    }, 400);
  };

  watch(search, () => {
    if (isCreating.value) triggerFetch();
  });

  watch([() => route.query.type, () => route.name], () => {
    pagination.value.page = 1;
    search.value = "";
    if (isCreating.value) fetchDocuments();
    else fetchClaims();
  });

  const fetchClaims = async () => {
    loading.value = claims.value.length === 0;
    fetching.value = claims.value.length > 0;
    try {
      const { data } = await api.get<ClaimsListResponse>("/claims", {
        params: {
          claim_type: claimType.value,
          page: pagination.value.page,
          per_page: pagination.value.per_page,
        },
      });
      claims.value = data.data;
      pagination.value = {
        page: data.current_page,
        per_page: data.per_page,
        total: data.total,
        last_page: data.last_page,
      };
    } catch (e) {
      console.error("Fetch claims failed", e);
    } finally {
      loading.value = false;
      fetching.value = false;
    }
  };

  const goToPage = (page: number) => {
    if (page === pagination.value.page) {
      return;
    }

    pagination.value.page = page;
    if (isCreating.value) fetchDocuments();
    else fetchClaims();
  };

  onMounted(() => (isCreating.value ? fetchDocuments() : fetchClaims()));

  const setMode = (mode: "list" | "new") => {
    const query = route.query.type === "2" ? { type: "2" } : {};
    return router.push({
      name:
        mode === "new"
          ? "panel.claims.documents.new"
          : "panel.claims.documents",
      query,
    });
  };

  const setClaimType = (type: ClaimType) =>
    router.replace({
      query: { ...route.query, type: String(type) },
    });

  return {
    documents,
    claims,
    loading,
    fetching,
    search,
    pagination,
    claimType,
    isCreating,
    isReturn,
    titleKey,
    actionKey,
    goToPage,
    fetchDocuments,
    setMode,
    setClaimType,
  };
}
