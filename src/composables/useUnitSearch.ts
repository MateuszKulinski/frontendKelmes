import { ref } from "vue";
import api from "@/core/api/axios";

export function useUnitSearch() {
  const query = ref("");
  const units = ref<any[]>([]);
  const loading = ref(false);

  let timeout: any;

  const search = () => {
    clearTimeout(timeout);

    if (query.value.length < 2) {
      units.value = [];
      return;
    }

    timeout = setTimeout(async () => {
      loading.value = true;

      try {
        const { data } = await api.get("/units/search", {
          params: { q: query.value },
        });

        units.value = data.data;
      } finally {
        loading.value = false;
      }
    }, 300);
  };

  return {
    query,
    units,
    loading,
    search,
  };
}