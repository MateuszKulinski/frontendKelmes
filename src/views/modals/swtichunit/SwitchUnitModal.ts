import { ref } from "vue";
import { useAuthStore } from "@/core/stores/authStore";
import { useModalStore } from "@/core/stores/modalStore";
import { useI18n } from "vue-i18n";
import { useUnitSearch } from "@/composables/useUnitSearch";

type Unit = {
  id: number;
  name: string;
  number: string;
};

export function useSwitchUnitModal() {
  const { t } = useI18n();
  const auth = useAuthStore();
  const modal = useModalStore();

  const { query, units, loading, search: onSearch } = useUnitSearch();

  const switchingId = ref<number | null>(null);

  const select = async (unit: Unit) => {
    if (switchingId.value) {
      return;
    }

    switchingId.value = unit.id;

    try {
      await auth.switchUnit(unit.id);

      modal.closeModal();

      window.location.reload();
    } finally {
      switchingId.value = null;
    }
  };

  return {
    t,
    query,
    units,
    loading,
    switchingId,
    onSearch,
    select,
    auth,
  };
}
