import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";

type CategoryLangForm = {
  lang_id: number;
  code: string;

  name: string;
  description: string;
  description_short: string;

  description_html: string;
  description_short_html: string;

  slug: string;
  meta_description: string;
  meta_keywords: string;
  meta_title: string;
};

export type BannerLangForm = {
  lang_id: number;
  code: string;

  title: string;
  subtitle: string;
  description: string;
  button_text: string;
};

export type BannerForm = {
  id?: number;

  image_file: string | File | null;
  mobile_image_file: string | File | null;

  link: string;

  target_blank: boolean;
  is_active: boolean;

  start_date: string | null;
  end_date: string | null;

  langs: BannerLangForm[];
};
export type CategoryFeatureForm = {
  id: number;
  name: string;
  type: string;
  is_filterable: boolean;
  is_assigned: boolean;
  order: number;
};

export type CategoryForm = {
  id: number;

  erp_id_kategoria: number | null;
  parent_category_id: number | null;

  is_active: boolean;
  has_logo: boolean;

  lavel: number | null;
  erp_id_rodzgrupkart: number | null;

  name: string;

  langs: CategoryLangForm[];
  banners: BannerForm[];
  features: CategoryFeatureForm[];
};

type BackendCategoryLang = {
  id: number;
  category_id: number;
  lang_id: number;

  name: string | null;
  description: string | null;
  description_short: string | null;

  description_html: string | null;
  description_short_html: string | null;

  slug: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  meta_title: string | null;

  lang?: {
    id: number;
    code: string;
  };
};

type BackendBannerLang = {
  id: number;
  banner_id: number;
  lang_id: number;

  title: string | null;
  subtitle: string | null;
  description: string | null;
  button_text: string | null;

  lang?: {
    id: number;
    code: string;
  };
};

type BackendBanner = {
  id: number;

  image_file: string | null;
  mobile_image_file: string | null;
  link: string | null;

  target_blank: boolean;
  is_active: boolean;

  start_date: string | null;
  end_date: string | null;

  banner_langs?: BackendBannerLang[];
};

type BackendCategoryFeature = {
  id: number;
  name: string | null;
  type: string;
  is_assigned: boolean;
  is_filterable: boolean;
  order: number;
};

type BackendCategory = {
  id: number;

  erp_id_kategoria: number | null;
  parent_category_id: number | null;

  is_active: boolean;
  has_logo: boolean;

  lavel: number | null;
  erp_id_rodzgrupkart: number | null;

  categories_langs: BackendCategoryLang[];
  banner_categories?: Array<{
    id: number;
    banner_id: number;
    category_id: number;
    banner?: BackendBanner;
  }>;
  features?: BackendCategoryFeature[];
};

type CategoryResponse = {
  data: BackendCategory;
};

export function useCategoryEdit() {
  const { t, locale } = useI18n();

  const form = ref<CategoryForm>({
    id: 0,

    erp_id_kategoria: null,
    parent_category_id: null,

    is_active: false,
    has_logo: false,

    lavel: null,
    erp_id_rodzgrupkart: null,

    name: "",

    langs: [],
    banners: [],
    features: [],
  });

  const loading = ref(false);
  const saving = ref(false);

  const errors = ref<Record<string, string>>({});

  /**
   * Lang ID aktualnego języka aplikacji.
   *
   * Backend powinien zwrócić go w app('lang_id'),
   * ale frontend potrzebuje wiedzieć, którą nazwę pokazać.
   */
  const currentLangCode = computed(() => locale.value);

  /**
   * Czy mamy edytowalny opis HTML.
   *
   * Jeżeli nie ma HTML, ale istnieje zwykły description,
   * fallback zostanie przygotowany podczas mapowania danych.
   */
  const hasDescription = (lang: CategoryLangForm) => {
    return Boolean(lang.description_html || lang.description);
  };

  const hasShortDescription = (lang: CategoryLangForm) => {
    return Boolean(lang.description_short_html || lang.description_short);
  };

  /**
   * Przygotowanie danych językowych kategorii.
   *
   * WAŻNE:
   * description i description_short pozostają nietknięte.
   *
   * Jeżeli description_html jest puste:
   * używamy description tylko jako początkowej wartości
   * RichEditora.
   */
  const mapCategoryLang = (lang: BackendCategoryLang): CategoryLangForm => {
    return {
      lang_id: lang.lang_id,
      code: lang.lang?.code ?? "",

      name: lang.name ?? "",

      // Oryginalnych pól nie modyfikujemy.
      description: lang.description ?? "",
      description_short: lang.description_short ?? "",

      // Priorytet:
      // 1. description_html
      // 2. description
      // 3. pusty string
      description_html: lang.description_html?.trim()
        ? lang.description_html
        : (lang.description?.trim() ?? ""),

      // Priorytet:
      // 1. description_short_html
      // 2. description_short
      // 3. pusty string
      description_short_html: lang.description_short_html?.trim()
        ? lang.description_short_html
        : (lang.description_short?.trim() ?? ""),

      slug: lang.slug ?? "",
      meta_description: lang.meta_description ?? "",
      meta_keywords: lang.meta_keywords ?? "",
      meta_title: lang.meta_title ?? "",
    };
  };

  const mapBannerLang = (lang: BackendBannerLang): BannerLangForm => {
    return {
      lang_id: lang.lang_id,
      code: lang.lang?.code ?? "",

      title: lang.title ?? "",
      subtitle: lang.subtitle ?? "",
      description: lang.description ?? "",
      button_text: lang.button_text ?? "",
    };
  };

  const mapBanner = (banner: BackendBanner): BannerForm => {
    return {
      id: banner.id,

      image_file: banner.image_file ?? null,
      mobile_image_file: banner.mobile_image_file ?? null,

      link: banner.link ?? "",

      target_blank: Boolean(banner.target_blank),
      is_active: Boolean(banner.is_active),

      start_date: banner.start_date,
      end_date: banner.end_date,

      langs: (banner.banner_langs ?? []).map(mapBannerLang),
    };
  };

  const setFormData = (category: BackendCategory) => {
    const langs = category.categories_langs.map(mapCategoryLang);

    /**
     * Nazwę pokazujemy tylko dla aktualnego języka aplikacji.
     *
     * Jeżeli API zwraca lang.code, korzystamy z niego.
     * Jeżeli nie, locale pozostaje fallbackiem.
     */
    const currentLang =
      langs.find(
        (lang) =>
          lang.code.toLowerCase() === currentLangCode.value.toLowerCase(),
      ) ??
      langs.find(
        (lang) =>
          lang.lang_id === Number(category.categories_langs[0]?.lang_id),
      );

    const banners =
      category.banner_categories
        ?.map((item) => item.banner)
        .filter((banner): banner is BackendBanner => Boolean(banner))
        .map(mapBanner) ?? [];

    form.value = {
      id: category.id,

      erp_id_kategoria: category.erp_id_kategoria,
      parent_category_id: category.parent_category_id,

      is_active: Boolean(category.is_active),
      has_logo: Boolean(category.has_logo),

      lavel: category.lavel,
      erp_id_rodzgrupkart: category.erp_id_rodzgrupkart,

      name: currentLang?.name ?? "",

      langs,
      banners,
      features: (category.features ?? []).map((feature) => ({
        id: feature.id,
        name: feature.name ?? `#${feature.id}`,
        type: feature.type,
        is_filterable: Boolean(feature.is_filterable),
        is_assigned: Boolean(feature.is_assigned),
        order: feature.order,
      })),
    };
  };

  const fetchCategory = async (id: number | string) => {
    loading.value = true;
    errors.value = {};

    try {
      const { data } = await api.get<CategoryResponse>(
        `/settings/categories/${id}`,
      );

      setFormData(data.data);

      return data.data;
    } catch (error) {
      console.error("Fetch category failed", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const buildFormData = () => {
    const data = new FormData();

    data.append(
      "erp_id_kategoria",
      form.value.erp_id_kategoria?.toString() ?? "",
    );

    data.append(
      "parent_category_id",
      form.value.parent_category_id?.toString() ?? "",
    );

    data.append("is_active", form.value.is_active ? "1" : "0");

    data.append("has_logo", form.value.has_logo ? "1" : "0");

    data.append("lavel", form.value.lavel?.toString() ?? "");

    data.append(
      "erp_id_rodzgrupkart",
      form.value.erp_id_rodzgrupkart?.toString() ?? "",
    );

    form.value.langs.forEach((lang, index) => {
      data.append(`langs[${index}][lang_id]`, lang.lang_id.toString());

      data.append(
        `langs[${index}][description_html]`,
        lang.description_html || "",
      );

      data.append(
        `langs[${index}][description_short_html]`,
        lang.description_short_html || "",
      );

      data.append(`langs[${index}][slug]`, lang.slug || "");

      data.append(
        `langs[${index}][meta_description]`,
        lang.meta_description || "",
      );

      data.append(`langs[${index}][meta_keywords]`, lang.meta_keywords || "");

      data.append(`langs[${index}][meta_title]`, lang.meta_title || "");
    });

    form.value.banners.forEach((banner, bannerIndex) => {
      if (banner.id) {
        data.append(`banners[${bannerIndex}][id]`, banner.id.toString());
      }

      data.append(`banners[${bannerIndex}][link]`, banner.link || "");

      data.append(
        `banners[${bannerIndex}][target_blank]`,
        banner.target_blank ? "1" : "0",
      );

      data.append(
        `banners[${bannerIndex}][is_active]`,
        banner.is_active ? "1" : "0",
      );

      if (banner.start_date) {
        data.append(`banners[${bannerIndex}][start_date]`, banner.start_date);
      }

      if (banner.end_date) {
        data.append(`banners[${bannerIndex}][end_date]`, banner.end_date);
      }

      if (banner.image_file instanceof File) {
        data.append(`banners[${bannerIndex}][image]`, banner.image_file);
      }

      if (banner.mobile_image_file instanceof File) {
        data.append(
          `banners[${bannerIndex}][mobile_image]`,
          banner.mobile_image_file,
        );
      }

      banner.langs.forEach((lang, langIndex) => {
        data.append(
          `banners[${bannerIndex}][langs][${langIndex}][lang_id]`,
          lang.lang_id.toString(),
        );

        data.append(
          `banners[${bannerIndex}][langs][${langIndex}][title]`,
          lang.title || "",
        );

        data.append(
          `banners[${bannerIndex}][langs][${langIndex}][subtitle]`,
          lang.subtitle || "",
        );

        data.append(
          `banners[${bannerIndex}][langs][${langIndex}][description]`,
          lang.description || "",
        );

        data.append(
          `banners[${bannerIndex}][langs][${langIndex}][button_text]`,
          lang.button_text || "",
        );
      });
    });

    return data;
  };

  const setBackendErrors = (
    backendErrors: Record<string, string[] | string>,
  ) => {
    errors.value = {};

    Object.entries(backendErrors).forEach(([key, value]) => {
      errors.value[key] = Array.isArray(value) ? value[0] : value;
    });
  };

  const updateFeatureFilterable = async (
    featureId: number,
    value: boolean,
  ) => {
    const feature = form.value.features.find((item) => item.id === featureId);

    if (!feature) {
      return;
    }

    const previousValue = feature.is_filterable;
    feature.is_filterable = value;

    try {
      await api.put(
        `/settings/categories/${form.value.id}/features/${featureId}`,
        {
          is_filterable: value,
        },
      );
    } catch (error) {
      feature.is_filterable = previousValue;
      console.error("Update category feature filter failed", error);
      throw error;
    }
  };

  const submit = async () => {
    saving.value = true;
    errors.value = {};

    try {
      const payload = buildFormData();

      payload.append("_method", "PUT");

      const { data } = await api.post(
        `/settings/categories/${form.value.id}`,
        payload,
      );

      return data;
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        setBackendErrors(error.response.data.errors);
      }

      throw error;
    } finally {
      saving.value = false;
    }
  };

  const addBanner = () => {
    form.value.banners.push({
      image_file: null,
      mobile_image_file: null,
      link: "",

      target_blank: false,
      is_active: true,

      start_date: null,
      end_date: null,

      langs: form.value.langs.map((lang) => ({
        lang_id: lang.lang_id,
        code: lang.code,

        title: "",
        subtitle: "",
        description: "",
        button_text: "",
      })),
    });
  };

  const removeBanner = (index: number) => {
    form.value.banners.splice(index, 1);
  };

  return {
    form,
    errors,

    loading,
    saving,

    fetchCategory,
    setFormData,
    updateFeatureFilterable,
    submit,

    setBackendErrors,

    addBanner,
    removeBanner,

    hasDescription,
    hasShortDescription,

    t,
  };
}
