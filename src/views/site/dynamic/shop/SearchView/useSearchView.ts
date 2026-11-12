import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { normalizeProductSort } from "@/views/site/components/products/productsList/productListOptions";
import type { ProductSort } from "@/views/site/components/products/productsList/productListOptions";

import type {
  SearchCategory,
  SearchManufacturer,
  SearchFeatureGroup,
  SearchFeatureApiGroup,
  SearchAdditionalFilter,
} from "./SearchFilters/SearchFilters";

interface SearchPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface SearchRange {
  min: number;
  max: number;
}

interface SearchResponse {
  products: any[];
  categories: SearchCategory[];
  manufacturers: SearchManufacturer[];
  features: SearchFeatureApiGroup[];
  shipping: SearchAdditionalFilter[];
  additional: SearchAdditionalFilter[];
  price: SearchRange | null;
  rating: SearchRange | null;
  pagination: SearchPagination;
}

interface FilterChip {
  id: string;
  label: string;
  remove: () => void;
}

type ActiveFeatures = Record<number, Record<number, string[]>>;
type ActiveRanges = Record<string, number | null>;

export function useSearchView() {
  const { t } = useI18n();

  const query = ref("");

  const categories = ref<SearchCategory[]>([]);
  const manufacturers = ref<SearchManufacturer[]>([]);
  const features = ref<SearchFeatureGroup[]>([]);
  const shippingFilters = ref<SearchAdditionalFilter[]>([]);
  const additionalFilters = ref<SearchAdditionalFilter[]>([]);
  const priceRange = ref<SearchRange | null>(null);
  const ratingRange = ref<SearchRange | null>(null);
  const products = ref<any[]>([]);

  const activePromtow = ref("");
  const activeAdditional = ref<string[]>([]);
  const activePriceMin = ref<number | null>(null);
  const activePriceMax = ref<number | null>(null);
  const activeRatingMin = ref<number | null>(null);
  const activeCategories = ref<number[]>([]);
  const activeManufacturers = ref<number[]>([]);
  const activeFeatures = ref<ActiveFeatures>({});
  const activeRanges = ref<ActiveRanges>({});

  const loading = ref(false);
  const ready = ref(false);

  const pagination = ref<SearchPagination>({
    current_page: 1,
    per_page: 24,
    total: 0,
    last_page: 1,
  });

  const perPage = ref(24);
  const sort = ref<ProductSort>("default");

  function readQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);

    query.value = params.get("q")?.trim() ?? "";

    return query.value;
  }

  function readFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);

    activePromtow.value = params.get("promtow") ?? "";
    activeAdditional.value = (params.get("additional") ?? "")
      .split(",")
      .filter(Boolean);

    const priceMin = Number(params.get("price_min"));
    const priceMax = Number(params.get("price_max"));
    const ratingMin = Number(params.get("rating_min"));
    activePriceMin.value =
      params.has("price_min") && Number.isFinite(priceMin) ? priceMin : null;
    activePriceMax.value =
      params.has("price_max") && Number.isFinite(priceMax) ? priceMax : null;
    activeRatingMin.value =
      params.has("rating_min") && Number.isFinite(ratingMin) ? ratingMin : null;

    activeCategories.value = params
      .getAll("category[]")
      .map(Number)
      .filter((id) => Number.isFinite(id) && id > 0);

    activeManufacturers.value = params
      .getAll("manufacturer[]")
      .map(Number)
      .filter((id) => Number.isFinite(id) && id > 0);

    const parsedFeatures: ActiveFeatures = {};
    const parsedRanges: ActiveRanges = {};

    params.forEach((value, key) => {
      const featureMatch = key.match(/^feature\[(\d+)\]\[(\d+)\]\[\]$/);

      if (featureMatch) {
        const categoryId = Number(featureMatch[1]);
        const featureId = Number(featureMatch[2]);

        parsedFeatures[categoryId] ??= {};
        parsedFeatures[categoryId][featureId] ??= [];
        parsedFeatures[categoryId][featureId].push(value);

        return;
      }

      const rangeMatch = key.match(/^range\[(.+)\]$/);

      if (rangeMatch) {
        const number = Number(value);

        parsedRanges[rangeMatch[1]] =
          value.trim() !== "" && Number.isFinite(number) ? number : null;
      }
    });

    activeFeatures.value = parsedFeatures;
    activeRanges.value = parsedRanges;

    const page = Number(params.get("page"));
    const requestedPerPage = Number(params.get("per_page"));

    if (page > 0) {
      pagination.value.current_page = page;
    }

    if (requestedPerPage > 0) {
      perPage.value = requestedPerPage;
      pagination.value.per_page = requestedPerPage;
    }

    sort.value = normalizeProductSort(params.get("sort"));
  }

  function updateUrl() {
    const params = new URLSearchParams();

    if (query.value) {
      params.set("q", query.value);
    }

    const promotionId = Number(activePromtow.value);
    if (Number.isInteger(promotionId) && promotionId > 0) {
      params.set("promtow", String(promotionId));
    }

    if (activeAdditional.value.length) {
      params.set("additional", activeAdditional.value.join(","));
    }

    if (activePriceMin.value !== null) {
      params.set("price_min", String(activePriceMin.value));
    }

    if (activePriceMax.value !== null) {
      params.set("price_max", String(activePriceMax.value));
    }

    if (activeRatingMin.value !== null) {
      params.set("rating_min", String(activeRatingMin.value));
    }

    activeCategories.value.forEach((id) => {
      params.append("category[]", String(id));
    });

    activeManufacturers.value.forEach((id) => {
      params.append("manufacturer[]", String(id));
    });

    for (const [categoryId, categoryFeatures] of Object.entries(
      activeFeatures.value,
    )) {
      for (const [featureId, values] of Object.entries(categoryFeatures)) {
        for (const value of values) {
          params.append(`feature[${categoryId}][${featureId}][]`, value);
        }
      }
    }

    for (const [key, value] of Object.entries(activeRanges.value)) {
      if (value !== null && Number.isFinite(value)) {
        params.set(`range[${key}]`, String(value));
      }
    }

    if (pagination.value.current_page > 1) {
      params.set("page", String(pagination.value.current_page));
    }

    if (perPage.value !== 24) {
      params.set("per_page", String(perPage.value));
    }

    if (sort.value !== "default") {
      params.set("sort", sort.value);
    }

    const search = params.toString();

    const url = search
      ? `${window.location.pathname}?${search}`
      : window.location.pathname;

    window.history.replaceState({}, "", url);
  }

  function cloneActiveFeatures(value: ActiveFeatures): ActiveFeatures {
    const result: ActiveFeatures = {};

    for (const [categoryId, categoryFeatures] of Object.entries(value)) {
      result[Number(categoryId)] = {};

      for (const [featureId, selectedValues] of Object.entries(
        categoryFeatures,
      )) {
        result[Number(categoryId)][Number(featureId)] = [...selectedValues];
      }
    }

    return result;
  }

  async function loadProducts() {
    const search = query.value.trim();
    const promotionId = Number(activePromtow.value);
    const hasPromotionFilter =
      Number.isInteger(promotionId) && promotionId > 0;

    if (search.length < 2 && !hasPromotionFilter) {
      products.value = [];
      categories.value = [];
      manufacturers.value = [];
      features.value = [];
      shippingFilters.value = [];
      additionalFilters.value = [];
      priceRange.value = null;
      ratingRange.value = null;

      pagination.value = {
        current_page: 1,
        per_page: perPage.value,
        total: 0,
        last_page: 1,
      };

      ready.value = true;

      return;
    }

    loading.value = true;

    try {
      updateUrl();

      const params: Record<string, any> = {
        page: pagination.value.current_page,
        per_page: perPage.value,
        sort: sort.value,
      };

      if (search.length >= 2) {
        params.q = search;
      }

      if (hasPromotionFilter) {
        params.promtow = promotionId;
      }

      if (activeCategories.value.length) {
        params.category = activeCategories.value;
      }

      if (activeManufacturers.value.length) {
        params.manufacturer = activeManufacturers.value;
      }

      if (activeAdditional.value.length) {
        params.additional = activeAdditional.value;
      }

      if (activePriceMin.value !== null) {
        params.price_min = activePriceMin.value;
      }

      if (activePriceMax.value !== null) {
        params.price_max = activePriceMax.value;
      }

      if (activeRatingMin.value !== null) {
        params.rating_min = activeRatingMin.value;
      }

      if (Object.keys(activeFeatures.value).length) {
        params.features = cloneActiveFeatures(activeFeatures.value);
      }

      const selectedRanges = Object.fromEntries(
        Object.entries(activeRanges.value).filter(
          ([, value]) => value !== null && Number.isFinite(value),
        ),
      );

      if (Object.keys(selectedRanges).length) {
        params.ranges = selectedRanges;
      }

      const response = await api.get("/searchProduct/search", {
        params,
        paramsSerializer: {
          indexes: true,
        },
      });

      const data = response.data as SearchResponse;

      products.value = data.products ?? [];

      // Zachowujemy listy filtrów, żeby nie znikały po zaznaczeniu.
      // Jeśli API zwróciło je po raz pierwszy, zapisujemy je.
      if (categories.value.length === 0) {
        categories.value = data.categories ?? [];
      }

      // if (manufacturers.value.length === 0) {
      manufacturers.value = data.manufacturers ?? [];
      shippingFilters.value = data.shipping ?? [];
      additionalFilters.value = data.additional ?? [];
      priceRange.value = data.price ?? null;
      ratingRange.value = data.rating ?? null;
      // }

      if (features.value.length === 0) {
        features.value = (data.features ?? []).map((group) => ({
          category_id: group.category_id,
          category_name: group.category_name,
          features: group.filters?.features ?? [],
        }));
      }

      pagination.value = data.pagination ?? {
        current_page: 1,
        per_page: perPage.value,
        total: 0,
        last_page: 1,
      };

      ready.value = true;
    } finally {
      loading.value = false;
    }
  }

  function applyFilters() {
    pagination.value.current_page = 1;
    loadProducts();
  }

  function resetFilters() {
    activePromtow.value = "";
    activeAdditional.value = [];
    activePriceMin.value = null;
    activePriceMax.value = null;
    activeRatingMin.value = null;
    activeCategories.value = [];
    activeManufacturers.value = [];
    activeFeatures.value = {};
    activeRanges.value = {};

    pagination.value.current_page = 1;

    loadProducts();
  }

  function removeCategory(categoryId: number) {
    activeCategories.value = activeCategories.value.filter(
      (id) => id !== categoryId,
    );

    applyFilters();
  }

  function removeManufacturer(manufacturerId: number) {
    activeManufacturers.value = activeManufacturers.value.filter(
      (id) => id !== manufacturerId,
    );

    applyFilters();
  }

  function removeFeatureValue(
    categoryId: number,
    featureId: number,
    valueId: string,
  ) {
    const next = cloneActiveFeatures(activeFeatures.value);
    const values = next[categoryId]?.[featureId] ?? [];

    if (next[categoryId]) {
      next[categoryId][featureId] = values.filter((value) => value !== valueId);

      if (next[categoryId][featureId].length === 0) {
        delete next[categoryId][featureId];
      }

      if (Object.keys(next[categoryId]).length === 0) {
        delete next[categoryId];
      }
    }

    activeFeatures.value = next;
    applyFilters();
  }

  function removeFeatureRange(categoryId: number, featureId: number) {
    const next = { ...activeRanges.value };

    delete next[`${categoryId}_${featureId}_min`];
    delete next[`${categoryId}_${featureId}_max`];

    activeRanges.value = next;
    applyFilters();
  }

  function changePage(page: number) {
    if (page < 1 || page > pagination.value.last_page) {
      return;
    }

    pagination.value.current_page = page;
    loadProducts();
  }

  function changePerPage(value: number) {
    perPage.value = value;
    pagination.value.current_page = 1;

    loadProducts();
  }

  function changeSort(value: ProductSort) {
    sort.value = normalizeProductSort(value);
    pagination.value.current_page = 1;
    loadProducts();
  }

  const activeFilterChips = computed<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    const promotionId = Number(activePromtow.value);
    if (Number.isInteger(promotionId) && promotionId > 0) {
      chips.push({
        id: "promtow",
        label: `${t("category.search.promotion")}: ${promotionId}`,
        remove: () => {
          activePromtow.value = "";
          applyFilters();
        },
      });
    }

    for (const key of activeAdditional.value) {
      chips.push({
        id: `additional-${key}`,
        label: t(`category.filters.additional_items.${key}`),
        remove: () => {
          activeAdditional.value = activeAdditional.value.filter(
            (item) => item !== key,
          );
          applyFilters();
        },
      });
    }

    if (
      activePriceMin.value !== null ||
      activePriceMax.value !== null
    ) {
      const range = [
        activePriceMin.value !== null ? `od ${activePriceMin.value}` : "",
        activePriceMax.value !== null ? `do ${activePriceMax.value}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      chips.push({
        id: "price",
        label: `${t("category.filters.price")}: ${range}`,
        remove: () => {
          activePriceMin.value = null;
          activePriceMax.value = null;
          applyFilters();
        },
      });
    }

    if (activeRatingMin.value !== null) {
      chips.push({
        id: "rating",
        label: `${t("category.filters.rating")}: ${activeRatingMin.value}+`,
        remove: () => {
          activeRatingMin.value = null;
          applyFilters();
        },
      });
    }

    for (const categoryId of activeCategories.value) {
      const category = categories.value.find((item) => item.id === categoryId);

      if (!category) continue;

      chips.push({
        id: `category-${category.id}`,
        label: `${t("category.filters.category")}: ${category.name}`,
        remove: () => removeCategory(category.id),
      });
    }

    for (const manufacturerId of activeManufacturers.value) {
      const manufacturer = manufacturers.value.find(
        (item) => item.id === manufacturerId,
      );

      if (!manufacturer) continue;

      chips.push({
        id: `manufacturer-${manufacturer.id}`,
        label: `${t("category.filters.manufacturer")}: ${manufacturer.name}`,
        remove: () => removeManufacturer(manufacturer.id),
      });
    }

    for (const [categoryIdString, categoryFeatures] of Object.entries(
      activeFeatures.value,
    )) {
      const categoryId = Number(categoryIdString);

      const group = features.value.find(
        (item) => item.category_id === categoryId,
      );

      for (const [featureIdString, values] of Object.entries(
        categoryFeatures,
      )) {
        const featureId = Number(featureIdString);
        const feature = group?.features.find((item) => item.id === featureId);

        for (const valueId of values) {
          const value = feature?.values?.find(
            (item) => String(item.id) === valueId,
          );

          const categoryName =
            group?.category_name ?? `Kategoria ${categoryId}`;

          const featureName = feature?.name || `Cecha ${featureId}`;
          const valueName = value?.name || valueId;

          chips.push({
            id: `feature-${categoryId}-${featureId}-${valueId}`,
            label: `${categoryName}: ${featureName} — ${valueName}`,
            remove: () => removeFeatureValue(categoryId, featureId, valueId),
          });
        }
      }
    }

    const rangeFeatureIds = new Set<string>();

    for (const key of Object.keys(activeRanges.value)) {
      const match = key.match(/^(\d+)_(\d+)_(min|max)$/);

      if (match) {
        rangeFeatureIds.add(`${match[1]}_${match[2]}`);
      }
    }

    for (const combinedId of rangeFeatureIds) {
      const [categoryIdString, featureIdString] = combinedId.split("_");
      const categoryId = Number(categoryIdString);
      const featureId = Number(featureIdString);

      const minKey = `${categoryId}_${featureId}_min`;
      const maxKey = `${categoryId}_${featureId}_max`;

      const min = activeRanges.value[minKey];
      const max = activeRanges.value[maxKey];

      if (min == null && max == null) continue;

      const group = features.value.find(
        (item) => item.category_id === categoryId,
      );

      const feature = group?.features.find((item) => item.id === featureId);

      const featureName = feature?.name || `Cecha ${featureId}`;

      const rangeLabel = [
        min != null ? `od ${min}` : "",
        max != null ? `do ${max}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      chips.push({
        id: `range-${categoryId}-${featureId}`,
        label: `${featureName}: ${rangeLabel}`,
        remove: () => removeFeatureRange(categoryId, featureId),
      });
    }

    return chips;
  });

  const hasActiveFilters = computed(
    () =>
      activeCategories.value.length > 0 ||
      (Number.isInteger(Number(activePromtow.value)) &&
        Number(activePromtow.value) > 0) ||
      activeAdditional.value.length > 0 ||
      activePriceMin.value !== null ||
      activePriceMax.value !== null ||
      activeRatingMin.value !== null ||
      activeManufacturers.value.length > 0 ||
      Object.values(activeFeatures.value).some((categoryFeatures) =>
        Object.values(categoryFeatures).some((values) => values.length > 0),
      ) ||
      Object.values(activeRanges.value).some((value) => value !== null),
  );

  readQueryFromUrl();
  readFiltersFromUrl();

  return {
    query,

    activePromtow,
    activeAdditional,
    activePriceMin,
    activePriceMax,
    activeRatingMin,
    categories,
    manufacturers,
    features,
    shippingFilters,
    additionalFilters,
    priceRange,
    ratingRange,
    products,

    activeCategories,
    activeManufacturers,
    activeFeatures,
    activeRanges,

    loading,
    ready,

    pagination,
    perPage,
    sort,

    activeFilterChips,
    hasActiveFilters,

    loadProducts,
    applyFilters,
    resetFilters,

    removeCategory,
    removeManufacturer,

    changePage,
    changePerPage,
    changeSort,
  };
}
