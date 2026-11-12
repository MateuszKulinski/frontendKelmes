import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import type { ClaimDetails } from "@/composables/types/claims";

export function useClaimCaseEdit() {
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const ui = useUiStore();
  const claim = ref<ClaimDetails | null>(null);
  const items = ref<ClaimDetails["claim_items"]>([]);
  const description = ref("");
  const loading = ref(true);
  const saving = ref(false);
  const isAdminRoute = computed(() =>
    String(route.name).startsWith("admin.claim"),
  );
  const detailRouteName = computed(() =>
    isAdminRoute.value ? "admin.claim" : "panel.claims.detail",
  );
  const canEdit = computed(() =>
    Boolean(
      claim.value?.claim_status?.is_editable &&
      !claim.value?.claim_status?.is_final,
    ),
  );

  const loadClaim = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<ClaimDetails>(
        `/claims/${route.params.id}`,
      );
      claim.value = data;
      items.value = data.claim_items.map((item) => ({ ...item }));
      description.value = data.description ?? "";
    } finally {
      loading.value = false;
    }
  };

  const backToClaim = () =>
    router.push({
      name: detailRouteName.value,
      params: { id: route.params.id },
    });

  const save = async () => {
    if (!claim.value || !canEdit.value) return;
    saving.value = true;
    try {
      await api.put(`/claims/${claim.value.id}`, {
        description: description.value,
        items: items.value.map(
          ({ id, document_position_id, quantity_returned, notes }) => ({
            id,
            document_position_id,
            quantity_returned,
            notes,
          }),
        ),
      });
      ui.showSuccess(t("claims.updated"));
      await backToClaim();
    } catch (error) {
      console.error("Update claim failed", error);
      ui.showError(t("claims.update_error"));
    } finally {
      saving.value = false;
    }
  };

  onMounted(loadClaim);

  return {
    claim,
    items,
    description,
    loading,
    saving,
    canEdit,
    backToClaim,
    save,
  };
}
