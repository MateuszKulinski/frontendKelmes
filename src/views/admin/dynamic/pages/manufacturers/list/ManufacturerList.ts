import { ref, onMounted, watch } from "vue";
import { useManufacturerStore } from "@/core/stores/manufacturerStore";

type ManufacturerFilters = {
  search: string;
  is_active: "" | "0" | "1";
};

export function useManufacturerList() {
  const store = useManufacturerStore();

  const fetching = ref(false);

  const filters = ref<ManufacturerFilters>({
    search: "",
    is_active: "",
  });

  const sortBy = ref("id");

  const sortDir = ref<"asc" | "desc">("asc");

  const page = ref(1);

  const fetchManufacturers = async () => {
    fetching.value = true;

    try {
      await store.fetchList({
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
        page: page.value,
        per_page: store.pagination.per_page,

        // Search by manufacturer name
        search: filters.value.search.trim(),

        ...(filters.value.is_active !== ""
          ? {
              is_active: filters.value.is_active,
            }
          : {}),
      });
    } finally {
      fetching.value = false;
    }
  };

  const changePage = (p: number) => {
    page.value = p;
    fetchManufacturers();
  };

  const changeSort = (payload: { sortBy: string; sortDir: "asc" | "desc" }) => {
    sortBy.value = payload.sortBy;
    sortDir.value = payload.sortDir;
    page.value = 1;

    fetchManufacturers();
  };

  watch(
    filters,
    () => {
      page.value = 1;
      fetchManufacturers();
    },
    {
      deep: true,
    },
  );

  onMounted(fetchManufacturers);

  return {
    store,
    fetching,
    filters,
    sortBy,
    sortDir,
    page,
    fetchManufacturers,
    changePage,
    changeSort,
  };
}
