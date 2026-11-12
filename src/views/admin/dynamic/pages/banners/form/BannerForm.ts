import { reactive, ref } from "vue";
import { useLangStore } from "@/core/stores/langStore";
import type { BannerDetail, BannerFormState } from "@/composables/types/banner";
import api from "@/core/api/axios";

export interface AssignmentOption {
  id: number;
  name: string;
  sku?: string | null;
}

type AssignmentType = "categories" | "cms" | "products";

export function useBannerForm(emit: any) {
  const langStore = useLangStore();

  const form = reactive<BannerFormState>({
    link: "",
    target_blank: false,
    is_active: true,
    is_home: false,
    start_date: "",
    end_date: "",
    langs: [],
    category_ids: [],
    cms_ids: [],
    product_ids: [],
  });

  const errors = reactive<Record<string, string>>({});

  /*
   * Images
   */
  const imagePreview = ref<string | null>(null);
  const mobileImagePreview = ref<string | null>(null);
  const imageFile = ref<File | null>(null);
  const mobileImageFile = ref<File | null>(null);

  const onImageChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  };

  const onMobileImageChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    mobileImageFile.value = file;
    mobileImagePreview.value = URL.createObjectURL(file);
  };

  /*
   * Languages
   */
  const ensureLangs = () => {
    if (!form.langs.length && langStore.langs.length) {
      form.langs = langStore.langs.map((lang: any) => ({
        lang_id: lang.id,
        title: "",
        subtitle: "",
        description: "",
        button_text: "",
      }));
    }
  };

  /*
   * Assignments
   *
   * Categories
   */
  const categorySearch = ref("");
  const categoryOptions = ref<AssignmentOption[]>([]);
  const selectedCategories = ref<AssignmentOption[]>([]);
  const categorySearchLoading = ref(false);

  /*
   * CMS
   */
  const cmsSearch = ref("");
  const cmsOptions = ref<AssignmentOption[]>([]);
  const selectedCms = ref<AssignmentOption[]>([]);
  const cmsSearchLoading = ref(false);

  /*
   * Products
   */
  const productSearch = ref("");
  const productOptions = ref<AssignmentOption[]>([]);
  const selectedProducts = ref<AssignmentOption[]>([]);
  const productSearchLoading = ref(false);

  const searchTimeouts: Record<
    AssignmentType,
    ReturnType<typeof setTimeout> | null
  > = {
    categories: null,
    cms: null,
    products: null,
  };

  const searchAssignments = async (
    type: AssignmentType,
    searchValue: string,
  ) => {
    if (searchTimeouts[type]) {
      clearTimeout(searchTimeouts[type]!);
    }

    const search = searchValue.trim();

    if (search.length < 2) {
      if (type === "categories") {
        categoryOptions.value = [];
      }

      if (type === "cms") {
        cmsOptions.value = [];
      }

      if (type === "products") {
        productOptions.value = [];
      }

      return;
    }

    searchTimeouts[type] = setTimeout(async () => {
      if (type === "categories") {
        categorySearchLoading.value = true;
      }

      if (type === "cms") {
        cmsSearchLoading.value = true;
      }

      if (type === "products") {
        productSearchLoading.value = true;
      }

      try {
        const response = await api.get(`/searchData/${type}`, {
          params: {
            search,
          },
        });

        const results = response.data ?? [];

        if (type === "categories") {
          categoryOptions.value = results;
        }

        if (type === "cms") {
          cmsOptions.value = results;
        }

        if (type === "products") {
          productOptions.value = results;
        }
      } catch {
        if (type === "categories") {
          categoryOptions.value = [];
        }

        if (type === "cms") {
          cmsOptions.value = [];
        }

        if (type === "products") {
          productOptions.value = [];
        }
      } finally {
        if (type === "categories") {
          categorySearchLoading.value = false;
        }

        if (type === "cms") {
          cmsSearchLoading.value = false;
        }

        if (type === "products") {
          productSearchLoading.value = false;
        }
      }
    }, 300);
  };

  const searchCategories = () => {
    searchAssignments("categories", categorySearch.value);
  };

  const searchCms = () => {
    searchAssignments("cms", cmsSearch.value);
  };

  const searchProducts = () => {
    searchAssignments("products", productSearch.value);
  };

  /*
   * Categories
   */
  const addCategory = (category: AssignmentOption) => {
    if (selectedCategories.value.some((item) => item.id === category.id)) {
      return;
    }

    selectedCategories.value.push(category);

    if (!form.category_ids.includes(category.id)) {
      form.category_ids.push(category.id);
    }

    categorySearch.value = "";
    categoryOptions.value = [];
  };

  const removeCategory = (id: number) => {
    selectedCategories.value = selectedCategories.value.filter(
      (category) => category.id !== id,
    );

    form.category_ids = form.category_ids.filter(
      (categoryId) => categoryId !== id,
    );
  };

  /*
   * CMS
   */
  const addCms = (cms: AssignmentOption) => {
    if (selectedCms.value.some((item) => item.id === cms.id)) {
      return;
    }

    selectedCms.value.push(cms);

    if (!form.cms_ids.includes(cms.id)) {
      form.cms_ids.push(cms.id);
    }

    cmsSearch.value = "";
    cmsOptions.value = [];
  };

  const removeCms = (id: number) => {
    selectedCms.value = selectedCms.value.filter((cms) => cms.id !== id);

    form.cms_ids = form.cms_ids.filter((cmsId) => cmsId !== id);
  };

  /*
   * Products
   */
  const addProduct = (product: AssignmentOption) => {
    if (selectedProducts.value.some((item) => item.id === product.id)) {
      return;
    }

    selectedProducts.value.push(product);

    if (!form.product_ids.includes(product.id)) {
      form.product_ids.push(product.id);
    }

    productSearch.value = "";
    productOptions.value = [];
  };

  const removeProduct = (id: number) => {
    selectedProducts.value = selectedProducts.value.filter(
      (product) => product.id !== id,
    );

    form.product_ids = form.product_ids.filter((productId) => productId !== id);
  };

  /*
   * Form data
   */
  const setFormData = (data: BannerDetail) => {
    form.link = data.link ?? "";
    form.target_blank = data.target_blank ?? false;
    form.is_active = data.is_active ?? true;
    form.is_home = data.is_home ?? false;
    form.start_date = data.start_date ?? "";
    form.end_date = data.end_date ?? "";

    form.category_ids = data.category_ids ?? [];
    form.cms_ids = data.cms_ids ?? [];
    form.product_ids = data.product_ids ?? [];

    /*
     * Jeżeli backend zwraca już obiekty:
     *
     * categories: [{ id, name }]
     * cms:        [{ id, name }]
     * products:   [{ id, name, sku }]
     *
     * to od razu mamy ładne tagi przy edycji.
     */
    selectedCategories.value = (data as any).categories ?? [];

    selectedCms.value = (data as any).cms ?? [];

    selectedProducts.value = (data as any).products ?? [];

    if (data.langs?.length) {
      form.langs = data.langs.map((l) => ({
        lang_id: l.lang_id,
        title: l.title ?? "",
        subtitle: l.subtitle ?? "",
        description: l.description ?? "",
        button_text: l.button_text ?? "",
      }));
    } else {
      ensureLangs();
    }

    if (data.image) {
      imagePreview.value = data.image;
    }

    if (data.mobile_image) {
      mobileImagePreview.value = data.mobile_image;
    }
  };

  /*
   * Backend validation
   */
  const setBackendErrors = (backendErrors: any) => {
    Object.keys(errors).forEach((key) => (errors[key] = ""));

    for (const key in backendErrors) {
      errors[key] = backendErrors[key]?.[0] || "";
    }
  };

  const handleValidationError = setBackendErrors;

  /*
   * FormData
   */
  const buildFormData = (): FormData => {
    const fd = new FormData();

    if (form.link) {
      fd.append("link", form.link);
    }

    fd.append("target_blank", form.target_blank ? "1" : "0");

    fd.append("is_active", form.is_active ? "1" : "0");
    fd.append("is_home", form.is_home ? "1" : "0");

    if (form.start_date) {
      fd.append("start_date", form.start_date);
    }

    if (form.end_date) {
      fd.append("end_date", form.end_date);
    }

    form.langs.forEach((lang, i) => {
      fd.append(`langs[${i}][lang_id]`, String(lang.lang_id));

      fd.append(`langs[${i}][title]`, lang.title ?? "");

      fd.append(`langs[${i}][subtitle]`, lang.subtitle ?? "");

      fd.append(`langs[${i}][description]`, lang.description ?? "");

      fd.append(`langs[${i}][button_text]`, lang.button_text ?? "");
    });

    form.category_ids.forEach((id, i) => {
      fd.append(`category_ids[${i}]`, String(id));
    });

    form.cms_ids.forEach((id, i) => {
      fd.append(`cms_ids[${i}]`, String(id));
    });

    form.product_ids.forEach((id, i) => {
      fd.append(`product_ids[${i}]`, String(id));
    });

    if (imageFile.value) {
      fd.append("image", imageFile.value);
    }

    if (mobileImageFile.value) {
      fd.append("mobile_image", mobileImageFile.value);
    }

    return fd;
  };

  const submit = () => {
    emit("submit", buildFormData());
  };

  return {
    form,
    errors,

    imagePreview,
    mobileImagePreview,
    onImageChange,
    onMobileImageChange,

    ensureLangs,
    setFormData,
    setBackendErrors,
    handleValidationError,
    submit,

    // Categories
    categorySearch,
    categoryOptions,
    selectedCategories,
    categorySearchLoading,
    searchCategories,
    addCategory,
    removeCategory,

    // CMS
    cmsSearch,
    cmsOptions,
    selectedCms,
    cmsSearchLoading,
    searchCms,
    addCms,
    removeCms,

    // Products
    productSearch,
    productOptions,
    selectedProducts,
    productSearchLoading,
    searchProducts,
    addProduct,
    removeProduct,
  };
}
