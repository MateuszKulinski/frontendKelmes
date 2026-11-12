import { computed, ref, type CSSProperties, type Ref } from "vue";

/*
|--------------------------------------------------------------------------
| API TYPES
|--------------------------------------------------------------------------
*/

export type CategoryFilterType =
  | "select"
  | "multiselect"
  | "boolean"
  | "int"
  | "decimal";

export interface CategoryFilterValue {
  id: number | null;
  name: string | null;
  count: number;
}

export interface CategoryFilter {
  id: number;
  name: string;
  type: CategoryFilterType;
  values?: CategoryFilterValue[];
  min?: number | null;
  max?: number | null;
}
export interface CategoryManufacturer {
  id: number;
  name: string;
  count: number;
}

export interface CategoryOption {
  id: number;
  name: string;
  count: number;
}

export interface CategoryAdditionalFilter {
  key: string;
  count: number | null;
}

export interface CategoryRange {
  min: number;
  max: number;
}

export interface CategoryFiltersProps {
  filters: CategoryFilter[];

  manufacturers?: CategoryManufacturer[];
  categories?: CategoryOption[];
  shippingFilters?: CategoryAdditionalFilter[];
  additionalFilters?: CategoryAdditionalFilter[];

  priceRange: CategoryRange | null;

  rating?: CategoryRange | null;

  activeFeatures: Record<number, string[]>;

  activeRanges: Record<string, number | null>;

  activeManufacturers?: number[];
  activeCategories?: number[];

  ratingMin?: number | null;
  ratingMax?: number | null;

  hasActiveFilters: boolean;
}

/*
|--------------------------------------------------------------------------
| COMPOSABLE
|--------------------------------------------------------------------------
*/

export function useCategoryFilters(
  props: CategoryFiltersProps,
  priceMin: Ref<number | null>,
  priceMax: Ref<number | null>,
) {
  /*
    |--------------------------------------------------------------------------
    | ACCORDIONS
    |--------------------------------------------------------------------------
    */

  const openFilterIds = ref<Set<number | string>>(new Set());

  const isPriceOpen = ref(true);

  const isManufacturerOpen = ref(false);

  const isRatingOpen = ref(false);

  function toggleFilter(id: number | string) {
    const next = new Set(openFilterIds.value);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    openFilterIds.value = next;
  }

  function togglePrice() {
    isPriceOpen.value = !isPriceOpen.value;
  }

  function toggleManufacturer() {
    isManufacturerOpen.value = !isManufacturerOpen.value;
  }

  function toggleRating() {
    isRatingOpen.value = !isRatingOpen.value;
  }

  function isFilterOpen(id: number | string): boolean {
    return openFilterIds.value.has(id);
  }

  /*
    |--------------------------------------------------------------------------
    | FEATURE ACTIVE
    |--------------------------------------------------------------------------
    */

  function isFeatureActive(filter: CategoryFilter): boolean {
    if (
      filter.type === "select" ||
      filter.type === "multiselect" ||
      filter.type === "boolean"
    ) {
      return (props.activeFeatures[filter.id]?.length ?? 0) > 0;
    }

    const min = props.activeRanges[`${filter.id}_min`];

    const max = props.activeRanges[`${filter.id}_max`];

    return (
      (min !== null && min !== undefined) || (max !== null && max !== undefined)
    );
  }

  /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

  function toNumberOrNull(value: string): number | null {
    const normalized = value.trim().replace(",", ".");

    if (!normalized) {
      return null;
    }

    const number = Number(normalized);

    return Number.isFinite(number) ? number : null;
  }

  /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

  const localPriceMin = computed(() => {
    return priceMin.value ?? props.priceRange?.min ?? 0;
  });

  const localPriceMax = computed(() => {
    return priceMax.value ?? props.priceRange?.max ?? 0;
  });

  const sliderTrackStyle = computed((): CSSProperties => {
    if (!props.priceRange) {
      return {};
    }

    const min = props.priceRange.min;

    const max = props.priceRange.max;

    const range = max - min;

    if (range <= 0) {
      return {};
    }

    const left = ((localPriceMin.value - min) / range) * 100;

    const right = ((localPriceMax.value - min) / range) * 100;

    return {
      background: `
                    linear-gradient(
                        to right,
                        #C6C6C6 ${left}%,
                        var(--accent) ${left}%,
                        var(--accent) ${right}%,
                        #C6C6C6 ${right}%
                    )
                `,
    };
  });

  function onMinSliderInput(event: Event) {
    if (!props.priceRange) {
      return;
    }

    const input = event.target as HTMLInputElement;

    const value = Number(input.value);

    const maxAllowed = localPriceMax.value - 1;

    const clamped = Math.min(Math.max(value, props.priceRange.min), maxAllowed);

    priceMin.value = clamped;

    input.value = String(clamped);
  }

  function onMaxSliderInput(event: Event) {
    if (!props.priceRange) {
      return;
    }

    const input = event.target as HTMLInputElement;

    const value = Number(input.value);

    const minAllowed = localPriceMin.value + 1;

    const clamped = Math.max(Math.min(value, props.priceRange.max), minAllowed);

    priceMax.value = clamped;

    input.value = String(clamped);
  }

  function onMinNumberInput(value: string) {
    if (!props.priceRange) {
      return;
    }

    const parsed = toNumberOrNull(value);

    if (parsed === null) {
      priceMin.value = null;
      return;
    }

    priceMin.value = Math.min(
      Math.max(parsed, props.priceRange.min),
      localPriceMax.value,
    );
  }

  function onMaxNumberInput(value: string) {
    if (!props.priceRange) {
      return;
    }

    const parsed = toNumberOrNull(value);

    if (parsed === null) {
      priceMax.value = null;
      return;
    }

    priceMax.value = Math.max(
      Math.min(parsed, props.priceRange.max),
      localPriceMin.value,
    );
  }

  /*
    |--------------------------------------------------------------------------
    | FEATURE RANGE
    |--------------------------------------------------------------------------
    */

  function getFeatureRange(filter: CategoryFilter): CategoryRange | null {
    if (filter.type !== "int" && filter.type !== "decimal") {
      return null;
    }

    /*
     * Backend dla int/decimal zwraca
     * bezpośrednio min/max.
     */
    if (
      filter.min !== null &&
      filter.min !== undefined &&
      filter.max !== null &&
      filter.max !== undefined
    ) {
      return {
        min: Number(filter.min),
        max: Number(filter.max),
      };
    }

    /*
     * Fallback dla starszego API,
     * które mogło zwracać values.
     */
    const numericValues = (filter.values ?? [])
      .map((value) => {
        if (value.name === null) {
          return null;
        }

        const number = Number(value.name.replace(",", "."));

        return Number.isFinite(number) ? number : null;
      })
      .filter((value): value is number => value !== null);

    if (!numericValues.length) {
      return null;
    }

    return {
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
    };
  }

  function getFeatureMin(filter: CategoryFilter): number {
    const range = getFeatureRange(filter);

    if (!range) {
      return 0;
    }

    return props.activeRanges[`${filter.id}_min`] ?? range.min;
  }

  function getFeatureMax(filter: CategoryFilter): number {
    const range = getFeatureRange(filter);

    if (!range) {
      return 0;
    }

    return props.activeRanges[`${filter.id}_max`] ?? range.max;
  }

  function getFeatureSliderStyle(filter: CategoryFilter): CSSProperties {
    const range = getFeatureRange(filter);

    if (!range) {
      return {};
    }

    const difference = range.max - range.min;

    if (difference <= 0) {
      return {};
    }

    const left = ((getFeatureMin(filter) - range.min) / difference) * 100;

    const right = ((getFeatureMax(filter) - range.min) / difference) * 100;

    return {
      background: `
                linear-gradient(
                    to right,
                    #C6C6C6 ${left}%,
                    var(--accent) ${left}%,
                    var(--accent) ${right}%,
                    #C6C6C6 ${right}%
                )
            `,
    };
  }

  function onFeatureMinSlider(event: Event, filter: CategoryFilter) {
    const range = getFeatureRange(filter);

    if (!range) {
      return;
    }

    const input = event.target as HTMLInputElement;

    const value = Number(input.value);

    const clamped = Math.min(Math.max(value, range.min), getFeatureMax(filter));

    props.activeRanges[`${filter.id}_min`] = clamped;

    input.value = String(clamped);
  }

  function onFeatureMaxSlider(event: Event, filter: CategoryFilter) {
    const range = getFeatureRange(filter);

    if (!range) {
      return;
    }

    const input = event.target as HTMLInputElement;

    const value = Number(input.value);

    const clamped = Math.max(Math.min(value, range.max), getFeatureMin(filter));

    props.activeRanges[`${filter.id}_max`] = clamped;

    input.value = String(clamped);
  }

  function onFeatureMinNumber(value: string, filter: CategoryFilter) {
    const range = getFeatureRange(filter);

    if (!range) {
      return;
    }

    const parsed = toNumberOrNull(value);

    if (parsed === null) {
      props.activeRanges[`${filter.id}_min`] = null;

      return;
    }

    props.activeRanges[`${filter.id}_min`] = Math.min(
      Math.max(parsed, range.min),
      getFeatureMax(filter),
    );
  }

  function onFeatureMaxNumber(value: string, filter: CategoryFilter) {
    const range = getFeatureRange(filter);

    if (!range) {
      return;
    }

    const parsed = toNumberOrNull(value);

    if (parsed === null) {
      props.activeRanges[`${filter.id}_max`] = null;

      return;
    }

    props.activeRanges[`${filter.id}_max`] = Math.max(
      Math.min(parsed, range.max),
      getFeatureMin(filter),
    );
  }

  /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

  return {
    openFilterIds,

    isPriceOpen,
    isManufacturerOpen,
    isRatingOpen,

    toggleFilter,
    togglePrice,
    toggleManufacturer,
    toggleRating,

    isFilterOpen,
    isFeatureActive,

    toNumberOrNull,

    localPriceMin,
    localPriceMax,
    sliderTrackStyle,

    onMinSliderInput,
    onMaxSliderInput,
    onMinNumberInput,
    onMaxNumberInput,

    getFeatureRange,
    getFeatureMin,
    getFeatureMax,
    getFeatureSliderStyle,

    onFeatureMinSlider,
    onFeatureMaxSlider,
    onFeatureMinNumber,
    onFeatureMaxNumber,
  };
}
