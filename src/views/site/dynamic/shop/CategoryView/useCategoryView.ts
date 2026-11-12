import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";

import { useRoute, useRouter } from "vue-router";

import api from "@/core/api/axios";
import { normalizeProductSort } from "@/views/site/components/products/productsList/productListOptions";
import type { ProductSort } from "@/views/site/components/products/productsList/productListOptions";

export function useCategoryView(props: { data: any; outletMode?: boolean }) {
  const route = useRoute();
  const router = useRouter();

  /*
    |--------------------------------------------------------------------------
    | FILTER DATA FROM API
    |--------------------------------------------------------------------------
    */

  const filtersData = ref<any[]>([]);
  const shippingFilters = ref<{ key: string; count: number | null }[]>([]);
  const additionalFilters = ref<{ key: string; count: number | null }[]>([]);

  const manufacturersData = ref<any[]>([]);
  const outletCategories = ref<any[]>(props.data.categories ?? []);

  const priceRange = ref<{
    min: number;
    max: number;
  } | null>(null);

  const ratingRange = ref<{
    min: number;
    max: number;
  } | null>(null);

  /*
    |--------------------------------------------------------------------------
    | ACTIVE FILTERS
    |--------------------------------------------------------------------------
    */

  const activeFeatures = reactive<Record<number, string[]>>({});

  const activeRanges = reactive<Record<string, number | null>>({});

  const activeManufacturers = ref<number[]>([]);
  const activeOutletCategories = ref<number[]>([]);
  const activeAdditional = ref<string[]>([]);

  const activePriceMin = ref<number | null>(null);

  const activePriceMax = ref<number | null>(null);

  const activeRatingMin = ref<number | null>(null);

  /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

  const page = ref<number>(Math.max(1, Number(route.query.page ?? 1)));
  const sort = ref<ProductSort>(normalizeProductSort(route.query.sort));

  const perPage = ref<number>(
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

  /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

  const hasInitialFilters = Object.keys(route.query).some(
    (key) =>
      key.startsWith("f_") ||
      key === "manufacturer" ||
      key === "manufacturers" ||
      (props.outletMode && key === "category") ||
      key === "price_min" ||
      key === "price_max" ||
      key === "rating_min" ||
      key === "rating_max" ||
      key === "additional" ||
      key === "page" ||
      key === "per_page" ||
      key === "sort",
  );

  const loading = ref(hasInitialFilters);

  const ready = ref(false);

  const filteredProducts = ref<any[] | null>(null);
  let productsRequestId = 0;

  onBeforeUnmount(() => { productsRequestId++; });

  /*
    |--------------------------------------------------------------------------
    | DISPLAY PRODUCTS
    |--------------------------------------------------------------------------
    */

  const displayProducts = computed(() =>
    filteredProducts.value !== null
      ? filteredProducts.value
      : (props.data.products ?? []),
  );

  /*
    |--------------------------------------------------------------------------
    | HAS ACTIVE FILTERS
    |--------------------------------------------------------------------------
    */

  const hasActiveFilters = computed(() => {
    const hasFeature = Object.values(activeFeatures).some(
      (values) => values.length > 0,
    );

    const hasRange = Object.values(activeRanges).some(
      (value) => value !== null && value !== undefined,
    );

    const hasManufacturer = activeManufacturers.value.length > 0;
    const hasOutletCategory = activeOutletCategories.value.length > 0;

    const hasPrice =
      activePriceMin.value !== null || activePriceMax.value !== null;

    const hasRating = activeRatingMin.value !== null;

    return hasFeature || hasRange || hasManufacturer || hasOutletCategory || hasPrice || hasRating ||
      activeAdditional.value.length > 0;
  });

  /*
    |--------------------------------------------------------------------------
    | LOAD FILTERS
    |--------------------------------------------------------------------------
    */

  async function loadFilters() {
    const id = props.data.id;

    if (!id) {
      return;
    }

    try {
      const lang = localStorage.getItem("lang");

      const { data } = await api.get(`/content/category/${id}/filters`, {
        params: {
          lang,
        },
      });

      /*
       * IMPORTANT:
       *
       * API:
       *
       * {
       *   manufacturers: [],
       *   features: [],
       *   price: {},
       *   rating: {}
       * }
       */

      filtersData.value = data.features ?? [];
      shippingFilters.value = data.shipping ?? [];
      additionalFilters.value = data.additional ?? [];

      manufacturersData.value = data.manufacturers ?? [];

      priceRange.value = data.price ?? null;

      ratingRange.value = data.rating ?? null;

      /*
       * Initialize feature states
       */

      for (const filter of filtersData.value) {
        if (
          filter.type === "select" ||
          filter.type === "multiselect" ||
          filter.type === "boolean"
        ) {
          if (!activeFeatures[filter.id]) {
            activeFeatures[filter.id] = [];
          }
        }

        if (filter.type === "int" || filter.type === "decimal") {
          if (activeRanges[`${filter.id}_min`] === undefined) {
            activeRanges[`${filter.id}_min`] = null;
          }

          if (activeRanges[`${filter.id}_max`] === undefined) {
            activeRanges[`${filter.id}_max`] = null;
          }
        }
      }

      console.log("CATEGORY FILTERS:", {
        features: filtersData.value,
        manufacturers: manufacturersData.value,
        price: priceRange.value,
        rating: ratingRange.value,
      });
    } catch (e) {
      console.error("Błąd ładowania filtrów:", e);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | BUILD QUERY
    |--------------------------------------------------------------------------
    */

  function buildQueryParams(): Record<string, string> {
    const query: Record<string, string> = {};

    if (sort.value !== "default") query.sort = sort.value;
    if (activeAdditional.value.length > 0) {
      query.additional = activeAdditional.value.join(",");
    }

    /*
     * FEATURES
     *
     * f_27=35,36
     */

    for (const [featureId, values] of Object.entries(activeFeatures)) {
      if (values.length > 0) {
        query[`f_${featureId}`] = values.join(",");
      }
    }

    /*
     * NUMERIC FEATURES
     *
     * f_123=10:100
     *
     * Also supports:
     *
     * f_123=:100
     * f_123=10:
     */

    for (const filter of filtersData.value) {
      if (filter.type !== "int" && filter.type !== "decimal") {
        continue;
      }

      const min = activeRanges[`${filter.id}_min`];

      const max = activeRanges[`${filter.id}_max`];

      const hasMin = min !== null && min !== undefined;

      const hasMax = max !== null && max !== undefined;

      if (!hasMin && !hasMax) {
        continue;
      }

      query[`f_${filter.id}`] = `${hasMin ? String(min) : ""}:${
        hasMax ? String(max) : ""
      }`;
    }

    /*
     * MANUFACTURERS
     *
     * manufacturer=30,517,144
     */

    if (activeManufacturers.value.length > 0) {
      query.manufacturer = activeManufacturers.value.join(",");
    }

    if (props.outletMode && activeOutletCategories.value.length > 0) {
      query.category = activeOutletCategories.value.join(",");
    }

    /*
     * PRICE
     */

    if (activePriceMin.value !== null) {
      query.price_min = String(activePriceMin.value);
    }

    if (activePriceMax.value !== null) {
      query.price_max = String(activePriceMax.value);
    }

    /*
     * RATING
     */

    if (activeRatingMin.value !== null) {
      query.rating_min = String(activeRatingMin.value);
    }

    /*
     * PAGINATION
     */

    if (page.value > 1) {
      query.page = String(page.value);
    }

    if (perPage.value !== 20) {
      query.per_page = String(perPage.value);
    }

    return query;
  }

  /*
    |--------------------------------------------------------------------------
    | APPLY
    |--------------------------------------------------------------------------
    */

  function applyFilters() {
    page.value = 1;

    router.push({
      path: route.path,
      query: buildQueryParams(),
    });
  }

  /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

  function resetFilters() {
    /*
     * Features
     */

    for (const key of Object.keys(activeFeatures)) {
      activeFeatures[Number(key)] = [];
    }

    /*
     * Numeric features
     */

    for (const key of Object.keys(activeRanges)) {
      activeRanges[key] = null;
    }

    /*
     * Manufacturers
     */

    activeManufacturers.value = [];
    activeOutletCategories.value = [];
    activeAdditional.value = [];

    /*
     * Price
     */

    activePriceMin.value = null;

    activePriceMax.value = null;

    /*
     * Rating
     */

    activeRatingMin.value = null;

    /*
     * Pagination
     */

    page.value = 1;

    router.push({
      path: route.path,
      query: buildQueryParams(),
    });
  }

  /*
    |--------------------------------------------------------------------------
    | REMOVE FEATURE VALUE
    |--------------------------------------------------------------------------
    */

  function removeFeatureValue(filterId: number, value: string) {
    activeFeatures[filterId] = (activeFeatures[filterId] ?? []).filter(
      (item) => item !== value,
    );

    applyFilters();
  }

  /*
    |--------------------------------------------------------------------------
    | REMOVE RANGE
    |--------------------------------------------------------------------------
    */

  function removeRangeFilter(filterId: number) {
    activeRanges[`${filterId}_min`] = null;

    activeRanges[`${filterId}_max`] = null;

    applyFilters();
  }

  /*
    |--------------------------------------------------------------------------
    | REMOVE MANUFACTURER
    |--------------------------------------------------------------------------
    */

  function removeManufacturer(manufacturerId: number) {
    activeManufacturers.value = activeManufacturers.value.filter(
      (id) => id !== manufacturerId,
    );

    applyFilters();
  }

  /*
    |--------------------------------------------------------------------------
    | REMOVE PRICE
    |--------------------------------------------------------------------------
    */

  function removePriceFilter() {
    activePriceMin.value = null;

    activePriceMax.value = null;

    applyFilters();
  }

  /*
    |--------------------------------------------------------------------------
    | REMOVE RATING
    |--------------------------------------------------------------------------
    */

  function removeRatingFilter() {
    activeRatingMin.value = null;

    applyFilters();
  }

  /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
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
    router.push({ path: route.path, query: buildQueryParams() });
  }

  /*
    |--------------------------------------------------------------------------
    | PARSE URL -> FILTER STATE
    |--------------------------------------------------------------------------
    */

  function parseQueryToFilters(query: Record<string, any>) {
    sort.value = normalizeProductSort(query.sort);
    const additionalValue = query.additional;
    activeAdditional.value = additionalValue
      ? String(additionalValue).split(",").filter(Boolean)
      : [];
    /*
     * Reset features
     */

    for (const key of Object.keys(activeFeatures)) {
      activeFeatures[Number(key)] = [];
    }

    /*
     * Reset ranges
     */

    for (const key of Object.keys(activeRanges)) {
      activeRanges[key] = null;
    }

    /*
     * Reset manufacturers
     */

    activeManufacturers.value = [];
    activeOutletCategories.value = [];

    /*
     * Reset price
     */

    activePriceMin.value = null;

    activePriceMax.value = null;

    /*
     * Reset rating
     */

    activeRatingMin.value = null;

    /*
     * Pagination
     */

    page.value = query.page ? Math.max(1, Number(query.page)) : 1;

    perPage.value = [10, 20, 30, 50].includes(Number(query.per_page))
      ? Number(query.per_page)
      : 20;

    /*
     * Parse query
     */

    for (const [key, value] of Object.entries(query)) {
      /*
       * FEATURE
       *
       * f_27=35,36
       *
       * f_123=10:100
       */

      const featureMatch = key.match(/^f_(\d+)$/);

      if (featureMatch) {
        const featureId = Number(featureMatch[1]);

        const strValue = String(value);

        if (strValue.includes(":")) {
          const [min, max] = strValue.split(":");

          activeRanges[`${featureId}_min`] = min !== "" ? Number(min) : null;

          activeRanges[`${featureId}_max`] = max !== "" ? Number(max) : null;
        } else {
          activeFeatures[featureId] = strValue.split(",").filter(Boolean);
        }

        if (!Array.isArray(activeFeatures[featureId])) {
          activeFeatures[featureId] = [];
        }

        continue;
      }

      /*
       * MANUFACTURER
       */

      if (key === "manufacturer" || key === "manufacturers") {
        activeManufacturers.value = String(value)
          .split(",")
          .map(Number)
          .filter(Number.isFinite);

        continue;
      }

      if (props.outletMode && key === "category") {
        activeOutletCategories.value = String(value)
          .split(",")
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0);

        continue;
      }

      /*
       * PRICE
       */

      if (key === "price_min") {
        const number = Number(value);

        activePriceMin.value = Number.isFinite(number) ? number : null;

        continue;
      }

      if (key === "price_max") {
        const number = Number(value);

        activePriceMax.value = Number.isFinite(number) ? number : null;

        continue;
      }

      /*
       * RATING
       */

      if (key === "rating_min") {
        const number = Number(value);

        activeRatingMin.value = Number.isFinite(number) ? number : null;

        continue;
      }
    }
  }

  /*
    |--------------------------------------------------------------------------
    | FETCH FILTERED PRODUCTS
    |--------------------------------------------------------------------------
    */

  async function fetchFilteredProducts(query: Record<string, any>) {
    const requestId = ++productsRequestId;
    const id = props.data.id;

    if (!id) {
      return;
    }

    /*
     * Wszystkie parametry, które
     * faktycznie oznaczają filtrowanie
     */

    const filterKeys = Object.keys(query).filter(
      (key) =>
        key.startsWith("f_") ||
        key === "manufacturer" ||
        key === "manufacturers" ||
        (props.outletMode && key === "category") ||
        key === "price_min" ||
        key === "price_max" ||
        key === "rating_min" ||
        key === "rating_max",
    );

    const hasPage = query.page && Number(query.page) > 1;

    const hasPerPage =
      [10, 20, 30, 50].includes(Number(query.per_page)) &&
      Number(query.per_page) !== 20;
    const hasSort = normalizeProductSort(query.sort) !== "default";
    const hasAdditional = Boolean(query.additional);

    /*
     * Brak filtrów = używamy
     * produktów już dostarczonych
     * przez ContentController.
     */

    if (filterKeys.length === 0 && !hasPage && !hasPerPage && !hasSort && !hasAdditional) {
      filteredProducts.value = null;

      pagination.value = props.data.pagination ?? null;

      loading.value = false;

      return;
    }

    loading.value = true;

    try {
      const lang = localStorage.getItem("lang");

      const { data } = await api.get(`/content/category/${id}`, {
        params: {
          lang,

          ...query,
          ...(props.outletMode ? { in_stock: 1 } : {}),

          page: page.value,

          per_page: perPage.value,
        },
      });

      if (requestId !== productsRequestId) return;

      filteredProducts.value = data.products ?? [];
      if (props.outletMode && Array.isArray(data.categories)) {
        outletCategories.value = data.categories;
      }

      pagination.value = data.pagination ?? null;
    } catch (e) {
      console.error("Błąd filtrowania produktów:", e);
    } finally {
      if (requestId === productsRequestId) loading.value = false;
    }
  }

  /*
    |--------------------------------------------------------------------------
    | ROUTE WATCH
    |--------------------------------------------------------------------------
    */

  watch(
    () => [route.path, route.query] as const,
    ([, query]) => {
      parseQueryToFilters(query);

      fetchFilteredProducts(query);
    },
  );

  /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

  onMounted(async () => {
    await loadFilters();

    parseQueryToFilters(route.query);

    await fetchFilteredProducts(route.query);

    pagination.value = pagination.value ?? props.data.pagination ?? null;

    ready.value = true;
  });

  /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

  return {
    /*
     * Filter data
     */

    filtersData,
    shippingFilters,
    additionalFilters,
    manufacturersData,
    outletCategories,
    priceRange,
    ratingRange,

    /*
     * Active filters
     */

    activeFeatures,
    activeRanges,
    activeManufacturers,
    activeOutletCategories,
    activeAdditional,

    activePriceMin,
    activePriceMax,

    activeRatingMin,

    /*
     * State
     */

    loading,
    ready,

    displayProducts,
    hasActiveFilters,

    /*
     * Actions
     */

    applyFilters,
    resetFilters,

    removeFeatureValue,
    removeRangeFilter,
    removeManufacturer,
    removePriceFilter,
    removeRatingFilter,

    /*
     * Pagination
     */

    page,
    perPage,
    sort,
    changeSort,
    pagination,

    changePage,
    changePerPage,
  };
}
