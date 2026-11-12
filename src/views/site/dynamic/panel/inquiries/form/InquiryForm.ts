// useInquiryForm.ts

import { reactive, computed } from "vue";

import { useI18n } from "vue-i18n";

import type { ProductSearchItem } from "@entities/productSearch";

import type {
  InquiryItem,
  InquiryItemProduct,
  InquiryDetails,
  InquiryPosition,
} from "@/composables/types/inquiry";

type InquirySubmitPayload = {
  name: string;
  description: string;
  action: "draft" | "send";

  items: {
    id: number | null;
    product_id: number;
    quantity: number;
    price: number;
    notes: string | null;
  }[];
};

type InquiryFormEmit = (event: "submit", payload: InquirySubmitPayload) => void;

export const useInquiryForm = (emit: InquiryFormEmit) => {
  const { t } = useI18n();

  /**
   * 🔥 FORM
   */
  const form = reactive({
    name: "",

    description: "",

    items: [] as InquiryItem[],
  });

  /**
   * 🔥 ERRORS
   */
  const errors = reactive<Record<string, string>>({});

  /**
   * 🔥 TABLE
   */
  const columns = computed(() => [
    {
      key: "lp",
      label: "Lp.",
    },

    {
      key: "product",
      label: t("inquiry.product"),
    },

    {
      key: "quantity",
      label: t("inquiry.quantity"),
    },

    {
      key: "net_price",
      label: t("inquiry.price"),
    },

    {
      key: "notes",
      label: t("common.notes"),
    },
    {
      key: "total",
      label: t("common.total_net"),
    },
    {
      key: "actions",
      label: "",
    },
  ]);

  /**
   * 🔥 HELPERS
   */
  const parsePrice = (value: string | number | null | undefined): number => {
    if (typeof value === "number") {
      return value;
    }

    if (!value) {
      return 0;
    }

    return Number(value.replace("zł", "").replace(/\s/g, "").replace(",", "."));
  };

  /**
   * 🔥 VALIDATION
   */
  const validate = () => {
    errors.name = form.name ? "" : t("inquiry.validation.name_required");

    errors.items = form.items.length
      ? ""
      : t("inquiry.validation.product_required");

    return !Object.values(errors).some(Boolean);
  };

  /**
   * 🔥 ADD PRODUCT
   */
  const addProduct = (product: ProductSearchItem) => {
    const exists = form.items.find((x) => x.product_id === product.id);

    if (exists) {
      exists.quantity += 1;

      return;
    }

    const inquiryProduct: InquiryItemProduct = {
      id: product.id,

      name: product.name,

      url: product.url,
    };

    form.items.push({
      local_id: crypto.randomUUID(),

      id: null,

      product_id: product.id,

      product: inquiryProduct,

      quantity: 1,

      price: parsePrice(product.price),

      notes: "",
    });
  };

  /**
   * 🔥 REMOVE
   */
  const removeItem = (index: number) => {
    form.items.splice(index, 1);
  };

  /**
   * 🔥 SUBMIT
   */
  const submit = (action: "draft" | "send") => {
    if (!validate()) {
      return;
    }

    emit("submit", {
      name: form.name,

      description: form.description,

      action,

      items: form.items.map((item) => ({
        id: item.id,

        product_id: item.product_id,

        quantity: Number(item.quantity),

        price: Number(item.price),

        notes: item.notes || null,
      })),
    });
  };

  /**
   * 🔥 BACKEND ERRORS
   */
  const setBackendErrors = (backendErrors: Record<string, string[]>) => {
    Object.keys(errors).forEach((key) => {
      errors[key] = "";
    });

    Object.entries(backendErrors).forEach(([key, value]) => {
      errors[key] = value[0];
    });
  };

  const totalNet = computed(() => {
    return form.items.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.price);
    }, 0);
  });

  /**
   * 🔥 EDIT MODE
   */
  const setFormData = (data: InquiryDetails) => {
    form.name = data.name || "";

    form.description = data.description || "";

    form.items = (data.positions || []).map(
      (item: InquiryPosition): InquiryItem => ({
        local_id: crypto.randomUUID(),

        id: item.id,

        product_id: item.product?.id,

        product: {
          id: item.product?.id,

          name: item.product?.name || "",

          url: item.product?.url,
        },

        quantity: Number(item.quantity || 0),

        price: parsePrice(item.price),

        notes: item.notes || "",
      }),
    );
  };

  return {
    form,
    errors,

    columns,

    addProduct,
    removeItem,

    submit,

    setBackendErrors,
    setFormData,
    totalNet,
  };
};
