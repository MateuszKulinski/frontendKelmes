import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import api from "@/core/api/axios";
import { useI18n } from "vue-i18n";

import type {
  CategoryItem,
  CategoriesResponse,
} from "@/composables/types/category";

export function useCategoriesList() {
  const { t } = useI18n();
  const route = useRoute();

  let controller: AbortController | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const categories = ref<CategoryItem[]>([]);
  const loading = ref(true);
  const fetching = ref(false);

  const search = ref("");

  const filters = ref({
    erp_id_kategoria: "",
    erp_id_rodzgrupkart: "",
    name: "",
    is_active: "" as "" | 0 | 1,
    has_logo: "" as "" | 0 | 1,
  });

  const sortBy = ref("id");
  const sortDir = ref<"asc" | "desc">("asc");

  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  /**
   * Aktualny parent kategorii.
   *
   * /admin/categories
   *      -> parentCategoryId = null
   *
   * /admin/categories?parent_id=123
   *      -> parentCategoryId = 123
   */
  const parentCategoryId = computed<number | null>(() => {
    const value = route.query.parent_id;

    if (value === undefined || value === null || value === "") {
      return null;
    }

    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
  });

  const getFilterLabel = (key: string) => {
    return t(`category.${key}`);
  };

  const activeFilters = computed(() => {
    const result: {
      key: string;
      label: string;
      value: string;
    }[] = [];

    Object.entries(filters.value).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        return;
      }

      let displayValue = String(value);

      if (key === "is_active") {
        displayValue =
          value === 1 || value === "1"
            ? t("common.active")
            : t("common.inactive");
      }

      if (key === "has_logo") {
        displayValue =
          value === 1 || value === "1" ? t("common.yes") : t("common.no");
      }

      result.push({
        key,
        label: getFilterLabel(key),
        value: displayValue,
      });
    });

    return result;
  });

  const clearSingleFilter = (key: string) => {
    if (key in filters.value) {
      filters.value[key as keyof typeof filters.value] = "";
    }

    if (key === "search") {
      search.value = "";
    }
  };

  const resetFilters = () => {
    Object.keys(filters.value).forEach((key) => {
      filters.value[key as keyof typeof filters.value] = "";
    });

    search.value = "";
    pagination.value.page = 1;

    fetchCategories();
  };

  const fetchCategories = async () => {
    if (controller) {
      controller.abort();
    }

    controller = new AbortController();

    if (categories.value.length === 0) {
      loading.value = true;
    } else {
      fetching.value = true;
    }

    try {
      const { data } = await api.get<CategoriesResponse>(
        "/settings/categories",
        {
          signal: controller.signal,

          params: {
            page: pagination.value.page,

            /**
             * Najważniejsze:
             *
             * null = kategorie główne
             * number = dzieci konkretnej kategorii
             */
            parent_category_id: parentCategoryId.value,

            search: search.value,

            sort_by: sortBy.value,
            sort_dir: sortDir.value,

            ...filters.value,
          },
        },
      );

      categories.value = data.data;

      pagination.value = {
        page: data.meta.current_page,
        per_page: data.meta.per_page,
        total: data.meta.total,
        last_page: data.meta.last_page,
      };
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") {
        return;
      }

      console.error("Fetch categories failed", e);
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
      fetchCategories();
    }, 400);
  };

  /**
   * Search.
   */
  watch(search, triggerFetch);

  /**
   * Filtry.
   */
  watch(filters, triggerFetch, {
    deep: true,
  });

  /**
   * Zmiana parent_id w URL.
   *
   * Przykład:
   *
   * /admin/categories?parent_id=10
   *
   * ->
   *
   * /admin/categories?parent_id=25
   *
   * Ten sam komponent pozostaje zamontowany,
   * więc musimy ręcznie pobrać dane ponownie.
   */
  watch(parentCategoryId, () => {
    pagination.value.page = 1;
    categories.value = [];

    fetchCategories();
  });

  const goToPage = (page: number) => {
    if (page === pagination.value.page) {
      return;
    }

    pagination.value.page = page;
    fetching.value = true;

    fetchCategories();
  };

  const handleSort = (payload: { sortBy: string; sortDir: "asc" | "desc" }) => {
    sortBy.value = payload.sortBy;
    sortDir.value = payload.sortDir;

    pagination.value.page = 1;
    fetching.value = true;

    fetchCategories();
  };

  onMounted(fetchCategories);

  return {
    categories,
    loading,
    fetching,
    pagination,
    search,
    filters,
    parentCategoryId,
    sortBy,
    sortDir,
    goToPage,
    handleSort,
    resetFilters,
    activeFilters,
    clearSingleFilter,
    fetchCategories,
  };
}
