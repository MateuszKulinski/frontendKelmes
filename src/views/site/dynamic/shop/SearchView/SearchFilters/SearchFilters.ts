import { computed, ref, type CSSProperties, type Ref } from "vue";

export interface SearchFeatureValue {
  id: number | string | null;
  name: string | null;
  count: number;
}

export interface SearchFeature {
  id: number;
  name: string;
  type: "select" | "multiselect" | "boolean" | "int" | "decimal";
  values?: SearchFeatureValue[];
  min?: number | null;
  max?: number | null;
}

export interface SearchFeatureApiGroup {
  category_id: number;
  category_name: string;
  filters: {
    price?: { min: number; max: number };
    rating?: { min: number; max: number };
    features?: SearchFeature[];
    manufacturers?: SearchManufacturer[];
  };
}

export type SearchFeatureType =
  | "select"
  | "multiselect"
  | "boolean"
  | "int"
  | "decimal";

export interface SearchCategory {
  id: number;
  name: string;
  slug?: string | null;
  count: number;
}

export interface SearchManufacturer {
  id: number;
  name: string;
  count: number;
}

export interface SearchAdditionalFilter {
  key: string;
  count: number | null;
}

export interface SearchPromotion {
  id: number;
  name: string | null;
  count: number;
}

export interface SearchFeatureValue {
  id: number | string | null;
  name: string | null;
  count: number;
}

export interface SearchFeature {
  id: number;
  name: string;
  type: SearchFeatureType;
  values?: SearchFeatureValue[];
  min?: number | null;
  max?: number | null;
}

export interface SearchFeatureGroup {
  category_id: number;
  category_name?: string;
  features: SearchFeature[];
}

export interface SearchFiltersProps {
  categories: SearchCategory[];
  manufacturers: SearchManufacturer[];
  shippingFilters?: SearchAdditionalFilter[];
  additionalFilters?: SearchAdditionalFilter[];
  activeAdditional?: string[];
  priceRange?: { min: number; max: number } | null;
  rating?: { min: number; max: number } | null;
  priceMin?: number | null;
  priceMax?: number | null;
  ratingMin?: number | null;
  features: SearchFeatureGroup[];
  activeCategories: number[];
  activeManufacturers: number[];
  activeFeatures: Record<number, Record<number, string[]>>;
  activeRanges: Record<string, number | null>;
  showCount: boolean;
  showCategoryCount?: boolean;
  promotions?: SearchPromotion[];
  activePromotions?: number[];
}

export function useSearchFilters(
  props: SearchFiltersProps,
  activeCategories: Ref<number[]>,
  activeManufacturers: Ref<number[]>,
  activeFeatures: Ref<Record<number, Record<number, string[]>>>,
  activeRanges: Ref<Record<string, number | null>>,
) {
  const searchQuery = ref("");

  const isCategoriesOpen = ref(true);
  const isManufacturerOpen = ref(false);
  const isPromotionsOpen = ref(false);
  const isPriceOpen = ref(true);
  const isRatingOpen = ref(false);
  const openFeatureIds = ref<Set<string>>(new Set());

  const normalizedSearchQuery = computed(() =>
    searchQuery.value.trim().toLocaleLowerCase(),
  );

  function toggleCategories() {
    isCategoriesOpen.value = !isCategoriesOpen.value;
  }

  function toggleManufacturer() {
    isManufacturerOpen.value = !isManufacturerOpen.value;
  }

  function togglePromotions() {
    isPromotionsOpen.value = !isPromotionsOpen.value;
  }

  function togglePrice() {
    isPriceOpen.value = !isPriceOpen.value;
  }

  function toggleRating() {
    isRatingOpen.value = !isRatingOpen.value;
  }

  function featureKey(categoryId: number, featureId: number) {
    return `${categoryId}:${featureId}`;
  }

  function rangeKey(
    categoryId: number,
    featureId: number,
    bound: "min" | "max",
  ) {
    return `${categoryId}_${featureId}_${bound}`;
  }

  function toggleFeature(categoryId: number, featureId: number) {
    const key = featureKey(categoryId, featureId);
    const next = new Set(openFeatureIds.value);

    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    openFeatureIds.value = next;
  }

  function isFeatureOpen(categoryId: number, featureId: number) {
    return openFeatureIds.value.has(featureKey(categoryId, featureId));
  }

  const visibleCategories = computed(() => {
    const query = normalizedSearchQuery.value;

    if (!query) return props.categories;

    return props.categories.filter((category) =>
      category.name.toLocaleLowerCase().includes(query),
    );
  });

  const visibleManufacturers = computed(() => {
    const query = normalizedSearchQuery.value;

    if (!query) return props.manufacturers;

    return props.manufacturers.filter((manufacturer) =>
      manufacturer.name.toLocaleLowerCase().includes(query),
    );
  });

  const visiblePromotions = computed(() => {
    const promotions = props.promotions ?? [];
    const query = normalizedSearchQuery.value;

    if (!query) return promotions;

    return promotions.filter((promotion) =>
      (promotion.name ?? String(promotion.id)).toLocaleLowerCase().includes(query),
    );
  });

  const visibleFeatureGroups = computed(() => {
    const query = normalizedSearchQuery.value;

    const features = props.features as any[];

    if (!features.length) {
      return [];
    }

    // Widok producenta: płaska tablica cech
    if (features.every((item) => !Array.isArray(item.features))) {
      const filteredFeatures = features.filter(
        (feature) =>
          !query || (feature.name ?? "").toLocaleLowerCase().includes(query),
      );

      if (!filteredFeatures.length) {
        return [];
      }

      return [
        {
          category_id: 0,
          category_name: "",
          features: filteredFeatures,
        },
      ];
    }

    // Widok kategorii: cechy pogrupowane według kategorii
    return features
      .filter((group) => {
        // Jeśli zaznaczono kategorie, zostawiamy tylko ich cechy.
        if (
          activeCategories.value.length > 0 &&
          !activeCategories.value.includes(group.category_id)
        ) {
          return false;
        }

        return true;
      })
      .map((group) => ({
        ...group,
        features: (group.features ?? []).filter(
          (feature: any) =>
            !query ||
            (feature.name ?? "").toLocaleLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.features.length > 0);
  });

  function getRange(feature: SearchFeature) {
    if (feature.type !== "int" && feature.type !== "decimal") {
      return null;
    }

    if (feature.min != null && feature.max != null) {
      return {
        min: Number(feature.min),
        max: Number(feature.max),
      };
    }

    const values = (feature.values ?? [])
      .map((value) => {
        if (value.name == null) return null;

        const number = Number(value.name.replace(",", "."));

        return Number.isFinite(number) ? number : null;
      })
      .filter((value): value is number => value !== null);

    if (!values.length) return null;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  function getFeatureMin(categoryId: number, feature: SearchFeature) {
    return (
      activeRanges.value[rangeKey(categoryId, feature.id, "min")] ??
      getRange(feature)?.min ??
      0
    );
  }

  function getFeatureMax(categoryId: number, feature: SearchFeature) {
    return (
      activeRanges.value[rangeKey(categoryId, feature.id, "max")] ??
      getRange(feature)?.max ??
      0
    );
  }

  function isFeatureActive(categoryId: number, feature: SearchFeature) {
    if (
      feature.type === "select" ||
      feature.type === "multiselect" ||
      feature.type === "boolean"
    ) {
      return (activeFeatures.value[categoryId]?.[feature.id]?.length ?? 0) > 0;
    }

    return (
      activeRanges.value[rangeKey(categoryId, feature.id, "min")] != null ||
      activeRanges.value[rangeKey(categoryId, feature.id, "max")] != null
    );
  }

  function toggleFeatureValue(
    categoryId: number,
    featureId: number,
    value: string,
    checked: boolean,
  ) {
    const categoryFeatures = {
      ...(activeFeatures.value[categoryId] ?? {}),
    };

    const selected = categoryFeatures[featureId] ?? [];

    categoryFeatures[featureId] = checked
      ? [...new Set([...selected, value])]
      : selected.filter((item) => item !== value);

    activeFeatures.value = {
      ...activeFeatures.value,
      [categoryId]: categoryFeatures,
    };
  }

  function toNumberOrNull(value: string): number | null {
    if (!value.trim()) return null;

    const number = Number(value.trim().replace(",", "."));

    return Number.isFinite(number) ? number : null;
  }

  function setFeatureBound(
    categoryId: number,
    feature: SearchFeature,
    bound: "min" | "max",
    value: string,
  ) {
    const range = getRange(feature);

    if (!range) return;

    const parsed = toNumberOrNull(value);
    const key = rangeKey(categoryId, feature.id, bound);

    if (parsed === null) {
      activeRanges.value = {
        ...activeRanges.value,
        [key]: null,
      };

      return;
    }

    let nextValue: number;

    if (bound === "min") {
      nextValue = Math.min(
        Math.max(parsed, range.min),
        getFeatureMax(categoryId, feature),
      );
    } else {
      nextValue = Math.max(
        Math.min(parsed, range.max),
        getFeatureMin(categoryId, feature),
      );
    }

    activeRanges.value = {
      ...activeRanges.value,
      [key]: nextValue,
    };
  }

  function setFeatureSlider(
    categoryId: number,
    feature: SearchFeature,
    bound: "min" | "max",
    event: Event,
  ) {
    const input = event.target as HTMLInputElement;

    setFeatureBound(categoryId, feature, bound, input.value);

    input.value = String(
      bound === "min"
        ? getFeatureMin(categoryId, feature)
        : getFeatureMax(categoryId, feature),
    );
  }

  function getFeatureSliderStyle(
    categoryId: number,
    feature: SearchFeature,
  ): CSSProperties {
    const range = getRange(feature);

    if (!range) return {};

    const difference = range.max - range.min;

    if (difference <= 0) return {};

    const left =
      ((getFeatureMin(categoryId, feature) - range.min) / difference) * 100;

    const right =
      ((getFeatureMax(categoryId, feature) - range.min) / difference) * 100;

    return {
      background: `linear-gradient(
        to right,
        #C6C6C6 ${left}%,
        var(--accent) ${left}%,
        var(--accent) ${right}%,
        #C6C6C6 ${right}%
      )`,
    };
  }

  const hasActiveFilters = computed(() => {
    if (
      activeCategories.value.length > 0 ||
        activeManufacturers.value.length > 0 ||
        (props.activePromotions?.length ?? 0) > 0 ||
        (props.activeAdditional?.length ?? 0) > 0 ||
        props.priceMin != null ||
        props.priceMax != null ||
        props.ratingMin != null
    ) {
      return true;
    }

    const hasSelectedFeatures = Object.values(activeFeatures.value).some(
      (features) => Object.values(features).some((values) => values.length > 0),
    );

    if (hasSelectedFeatures) return true;

    return Object.values(activeRanges.value).some((value) => value != null);
  });

  return {
    searchQuery,
    isCategoriesOpen,
    isManufacturerOpen,
    isPromotionsOpen,
    isPriceOpen,
    isRatingOpen,

    toggleCategories,
    toggleManufacturer,
    togglePromotions,
    togglePrice,
    toggleRating,

    visibleCategories,
    visibleManufacturers,
    visiblePromotions,
    visibleFeatureGroups,

    toggleFeature,
    isFeatureOpen,
    isFeatureActive,
    toggleFeatureValue,

    getRange,
    getFeatureMin,
    getFeatureMax,
    getFeatureSliderStyle,
    setFeatureBound,
    setFeatureSlider,

    hasActiveFilters,
  };
}
