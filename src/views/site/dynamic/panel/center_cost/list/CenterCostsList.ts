import { ref, onMounted } from "vue";
import api from "@/core/api/axios";

export interface CenterCost {
  id: number;
  name: string;
  is_active: boolean;
}

export function useCenterCostsList() {
  const centerCosts = ref<CenterCost[]>([]);
  const loading = ref(true);

  const fetchCenterCosts = async () => {
    loading.value = true;

    try {
      const { data } = await api.get<CenterCost[]>("/center-costs");
      centerCosts.value = data;
    } catch (e) {
      console.error("Fetch center costs failed", e);
    } finally {
      loading.value = false;
    }
  };

  const deleteCenterCost = async (id: number) => {
    try {
      await api.delete(`/center-costs/${id}`);

      centerCosts.value = centerCosts.value.filter(
        (centerCost) => centerCost.id !== id,
      );
    } catch (e) {
      console.error("Delete center cost failed", e);
      throw e;
    }
  };

  onMounted(fetchCenterCosts);

  return {
    centerCosts,
    loading,
    fetchCenterCosts,
    deleteCenterCost,
  };
}
