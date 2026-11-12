import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/core/api/axios";
import { useAuthStore } from "@/core/stores/authStore";
import type { ClaimDetails, ClaimStatus } from "@/composables/types/claims";

export function useClaimCase() {
  const route = useRoute();
  const router = useRouter();
  const auth = useAuthStore();
  const claim = ref<ClaimDetails | null>(null);
  const statuses = ref<ClaimStatus[]>([]);
  const message = ref("");
  const selectedStatusId = ref<number | null>(null);
  const loading = ref(true);
  const sending = ref(false);

  const canAdmin = computed(() =>
    [1, 2].includes(Number(auth.user?.permission_id)),
  );
  const isFinal = computed(() => Boolean(claim.value?.claim_status?.is_final));
  const canEdit = computed(() =>
    Boolean(claim.value?.claim_status?.is_editable && !isFinal.value),
  );
  const currentStatusName = computed(
    () =>
      claim.value?.claim_status?.langs?.[0]?.pivot?.name ??
      claim.value?.claim_status?.code ??
      "",
  );

  const fetchCase = async () => {
    loading.value = true;
    try {
      const [caseResponse, statusResponse] = await Promise.all([
        api.get<ClaimDetails>(`/claims/${route.params.id}`),
        api.get<ClaimStatus[]>("/claims/statuses"),
      ]);
      claim.value = caseResponse.data;
      statuses.value = statusResponse.data;
    } finally {
      loading.value = false;
    }
  };

  const addEntry = async (statusId?: number) => {
    if (!claim.value || !message.value.trim()) return;
    sending.value = true;
    try {
      const payload: { message: string; status_id?: number } = {
        message: message.value.trim(),
      };
      if (statusId) payload.status_id = statusId;
      const { data } = await api.post<ClaimDetails>(
        `/claims/${claim.value.id}/status`,
        payload,
      );
      claim.value = data;
      message.value = "";
      selectedStatusId.value = null;
    } finally {
      sending.value = false;
    }
  };

  const submitEntry = () => addEntry(selectedStatusId.value ?? undefined);

  const cancelCase = () => {
    const cancelled = statuses.value.find(
      (status) => status.code === "cancelled",
    );
    if (cancelled) return addEntry(cancelled.id);
  };

  const backToList = () =>
    route.name === "admin.claim"
      ? router.push({ name: "admin.claims" })
      : router.push({
          name: "panel.claims.documents",
          query: { type: String(claim.value?.claim_type ?? 1) },
        });

  const editCase = () =>
    router.push({
      name:
        route.name === "admin.claim" ? "admin.claim.edit" : "panel.claims.edit",
      params: { id: route.params.id },
    });

  onMounted(fetchCase);

  return {
    claim,
    statuses,
    message,
    selectedStatusId,
    loading,
    sending,
    canAdmin,
    isFinal,
    canEdit,
    currentStatusName,
    submitEntry,
    cancelCase,
    backToList,
    editCase,
  };
}
