import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import api from "@/core/api/axios";
import type {
  ClaimStatus,
  ClaimSummary,
  ClaimType,
  ClaimsListResponse,
} from "@/composables/types/claims";

export function useClaimsList() {
  const router = useRouter();
  const claims = ref<ClaimSummary[]>([]);
  const statuses = ref<ClaimStatus[]>([]);
  const claimType = ref<ClaimType>(1);
  const statusId = ref<number | null>(null);
  const loading = ref(true);
  const fetching = ref(false);
  const pagination = ref({ page: 1, per_page: 25, total: 0, last_page: 1 });

  const fetchClaims = async () => {
    loading.value = claims.value.length === 0;
    fetching.value = claims.value.length > 0;
    try {
      const { data } = await api.get<ClaimsListResponse>("/claims", {
        params: {
          claim_type: claimType.value,
          status_id: statusId.value ?? undefined,
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
    } catch (error) {
      console.error("Fetch claims failed", error);
    } finally {
      loading.value = false;
      fetching.value = false;
    }
  };

  const fetchStatuses = async () => {
    const { data } = await api.get<ClaimStatus[]>("/claims/statuses");
    statuses.value = data;
  };

  watch([claimType, statusId], () => {
    pagination.value.page = 1;
    fetchClaims();
  });

  const goToPage = (page: number) => {
    if (page === pagination.value.page) return;
    pagination.value.page = page;
    fetchClaims();
  };

  const openClaim = (claim: ClaimSummary) =>
    router.push({
      name: "admin.claim",
      params: { id: claim.id },
    });

  const statusName = (status?: ClaimStatus) =>
    status?.langs?.[0]?.pivot?.name ?? status?.code ?? "";

  onMounted(() => {
    fetchClaims();
    fetchStatuses();
  });

  return {
    claims,
    statuses,
    claimType,
    statusId,
    loading,
    fetching,
    pagination,
    goToPage,
    openClaim,
    statusName,
  };
}
