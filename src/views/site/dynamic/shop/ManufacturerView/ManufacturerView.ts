import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import api from "@/core/api/axios";
import { useContentStore } from "@/core/stores/contentStore";
import { normalizeProductSort } from "@/views/site/components/products/productsList/productListOptions";
import type { ProductSort } from "@/views/site/components/products/productsList/productListOptions";

type ActiveFeatures = Record<number, Record<number, string[]>>;
type ActiveRanges = Record<string, number | null>;

export function useManufacturerView(props: { data: any }) {
  const route = useRoute();
  const router = useRouter();
  const contentStore = useContentStore();

  const categoriesData = ref<any[]>([]);
  const featuresData = ref<any[]>([]);
  const shippingFilters = ref<{ key: string; count: number | null }[]>([]);
  const additionalFilters = ref<{ key: string; count: number | null }[]>([]);

  const activeCategories = ref<number[]>([]);
  const activeFeatures = ref<ActiveFeatures>({});
  const activeRanges = ref<ActiveRanges>({});
  const activeAdditional = ref<string[]>([]);

  const loading = ref(false);
  const ready = ref(false);

  const filteredProducts = ref<any[] | null>(null);

  const page = ref(Math.max(1, Number(route.query.page ?? 1)));
  const sort = ref<ProductSort>(normalizeProductSort(route.query.sort));

  const perPage = ref(
    [10, 20, 30, 50].includes(Number(route.query.per_page))
      ? Number(route.query.per_page)
      : 20,
  );

  const pagination = ref<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);

  const displayProducts = computed(() =>
    filteredProducts.value !== null
      ? filteredProducts.value
      : (props.data.products ?? []),
  );

  const hasActiveFilters = computed(
    () =>
      activeCategories.value.length > 0 ||
      Object.values(activeFeatures.value).some((features) =>
        Object.values(features).some((values) => values.length > 0),
      ) ||
      Object.values(activeRanges.value).some((value) => value !== null) ||
      activeAdditional.value.length > 0,
  );

  /**
   * LOAD FILTERS
   */

  async function loadFilters() {
    const id = props.data?.id;

    if (!id) {
      categoriesData.value = [];
      featuresData.value = [];
      shippingFilters.value = [];
      additionalFilters.value = [];
      return;
    }

    try {
      const lang = localStorage.getItem("lang");

      const { data } = await api.get(`/content/manufacturer/${id}/filters`, {
        params: { lang },
      });

      categoriesData.value = Array.isArray(data.categories)
        ? data.categories
        : [];
      shippingFilters.value = Array.isArray(data.shipping)
        ? data.shipping
        : [];
      additionalFilters.value = Array.isArray(data.additional)
        ? data.additional
        : [];

      featuresData.value = Array.isArray(data.features) && data.features.length
        ? [
            {
              category_id: 0,
              category_name: props.data.name ?? "",
              features: data.features,
            },
          ]
        : [];
    } catch (e) {
      console.error("Błąd ładowania filtrów producenta:", e);

      categoriesData.value = [];
      featuresData.value = [];
      shippingFilters.value = [];
      additionalFilters.value = [];
    }
  }

  /**
   * BUILD QUERY
   */

  function buildQueryParams(): Record<string, any> {
    const query: Record<string, any> = {};

    if (activeCategories.value.length > 0) {
      query.category = activeCategories.value.join(",");
    }

    if (Object.keys(activeFeatures.value).length > 0) {
      query.features = JSON.stringify(activeFeatures.value);
    }

    const ranges = Object.fromEntries(
      Object.entries(activeRanges.value).filter(
        ([, value]) => value !== null && Number.isFinite(value),
      ),
    );

    if (Object.keys(ranges).length > 0) {
      query.ranges = JSON.stringify(ranges);
    }

    if (sort.value !== "default") {
      query.sort = sort.value;
    }

    if (activeAdditional.value.length > 0) {
      query.additional = activeAdditional.value.join(",");
    }

    if (page.value > 1) {
      query.page = String(page.value);
    }

    if (perPage.value !== 20) {
      query.per_page = String(perPage.value);
    }

    return query;
  }

  /**
   * APPLY FILTERS
   */

  function applyFilters() {
    page.value = 1;

    router.push({
      path: route.path,
      query: buildQueryParams(),
    });
  }

  /**
   * RESET FILTERS
   */

  function resetFilters() {
    activeCategories.value = [];
    activeFeatures.value = {};
    activeRanges.value = {};
    activeAdditional.value = [];

    page.value = 1;

    router.push({
      path: route.path,
      query: buildQueryParams(),
    });
  }

  /**
   * PARSE URL
   */

  function parseQueryToFilters(query: Record<string, any>) {
    sort.value = normalizeProductSort(query.sort);
    const additionalValue = query.additional;
    activeAdditional.value = additionalValue
      ? String(additionalValue).split(",").filter(Boolean)
      : [];
    activeCategories.value = [];

    activeFeatures.value = {};
    activeRanges.value = {};

    const categoryValue = query.category;

    if (categoryValue) {
      activeCategories.value = String(categoryValue)
        .split(",")
        .map(Number)
        .filter(Number.isFinite)
        .filter((id) => id > 0);
    }

    const featuresValue = query.features;

    if (featuresValue) {
      try {
        const parsed =
          typeof featuresValue === "string"
            ? JSON.parse(featuresValue)
            : featuresValue;

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          activeFeatures.value = parsed;
        }
      } catch (e) {
        console.error("Błąd odczytu cech z URL:", e);
      }
    }

    const rangesValue = query.ranges;

    if (rangesValue) {
      try {
        const parsed =
          typeof rangesValue === "string"
            ? JSON.parse(rangesValue)
            : rangesValue;

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          activeRanges.value = parsed;
        }
      } catch (e) {
        console.error("Błąd odczytu zakresów z URL:", e);
      }
    }

    const requestedPage = Number(query.page);
    page.value =
      Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

    const requestedPerPage = Number(query.per_page);
    perPage.value = [10, 20, 30, 50].includes(requestedPerPage)
      ? requestedPerPage
      : 20;
  }

  /**
   * FETCH PRODUCTS
   */

  async function fetchFilteredProducts(query: Record<string, any>) {
    const id = props.data?.id ?? contentStore.pageId;

    if (!id) {
      return;
    }

    const hasCategoryFilter = activeCategories.value.length > 0;

    const hasFeatureFilter = Object.values(activeFeatures.value).some(
      (features) => Object.values(features).some((values) => values.length > 0),
    );

    const hasRangeFilter = Object.values(activeRanges.value).some(
      (value) => value !== null,
    );
    const hasSort = sort.value !== "default";
    const hasAdditional = activeAdditional.value.length > 0;

    const hasPage = Number(query.page) > 1;

    const hasPerPage =
      [10, 20, 30, 50].includes(Number(query.per_page)) &&
      Number(query.per_page) !== 20;

    /**
     * Bez filtrów i niestandardowej paginacji
     * korzystamy z produktów dostarczonych przez ContentController.
     */

    if (
      !hasCategoryFilter &&
      !hasFeatureFilter &&
      !hasRangeFilter &&
      !hasSort &&
      !hasAdditional &&
      !hasPage &&
      !hasPerPage
    ) {
      filteredProducts.value = null;
      pagination.value = props.data.pagination ?? null;
      return;
    }

    loading.value = true;

    try {
      const lang = localStorage.getItem("lang");

      const params: Record<string, any> = {
        lang,
        page: page.value,
        per_page: perPage.value,
        sort: sort.value,
      };

      if (hasAdditional) {
        params.additional = activeAdditional.value;
      }

      if (activeCategories.value.length > 0) {
        params.category = activeCategories.value;
      }

      if (hasFeatureFilter) {
        params.features = activeFeatures.value;
      }

      if (hasRangeFilter) {
        params.ranges = Object.fromEntries(
          Object.entries(activeRanges.value).filter(
            ([, value]) => value !== null && Number.isFinite(value),
          ),
        );
      }

      const { data } = await api.get(`/content/manufacturer/${id}`, {
        params,
        paramsSerializer: {
          indexes: true,
        },
      });

      filteredProducts.value = data.products ?? [];
      pagination.value = data.pagination ?? null;
    } catch (e) {
      console.error("Błąd filtrowania produktów producenta:", e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * PAGINATION
   */

  function changePage(newPage: number) {
    page.value = Math.max(1, newPage);

    router.push({
      path: route.path,
      query: buildQueryParams(),
    });
  }

  function changePerPage(newPerPage: number) {
    if (![10, 20, 30, 50].includes(newPerPage)) {
      return;
    }

    perPage.value = newPerPage;
    page.value = 1;

    router.push({
      path: route.path,
      query: buildQueryParams(),
    });
  }

  function changeSort(value: ProductSort) {
    sort.value = normalizeProductSort(value);
    page.value = 1;

    router.push({
      path: route.path,
      query: buildQueryParams(),
    });
  }

  /**
   * ROUTE WATCH
   */

  watch(
    () => [route.path, route.query] as const,
    ([, query]) => {
      parseQueryToFilters(query);
      fetchFilteredProducts(query);
    },
  );

  /**
   * INITIAL LOAD
   */

  onMounted(async () => {
    parseQueryToFilters(route.query);

    await loadFilters();
    await fetchFilteredProducts(route.query);

    pagination.value = pagination.value ?? props.data.pagination ?? null;

    ready.value = true;
  });

  return {
    categoriesData,
    featuresData,
    shippingFilters,

    activeCategories,
    activeFeatures,
    activeRanges,

    loading,
    ready,

    displayProducts,
    hasActiveFilters,

    applyFilters,
    resetFilters,

    pagination,
    changePage,
    changePerPage,
    sort,
    changeSort,
    perPage,
    additionalFilters,
    activeAdditional,
  };
}
