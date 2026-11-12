import { ref, watch } from "vue";

import api from "@/core/api/axios";
import type { UrlObject } from "@/composables/useUrlResolver";

// export interface ProductSearchItem {
//   id: number;
//   name: string;
//   catalog_number: string;
//   price: string;
//   url: UrlObject;
// }
import type { ProductSearchItem } from
  "@/composables/types/productSearch";

export interface ProductSearchCategory {
  name: string;
  url: UrlObject | null;
}

export function useProductSearch(minChars = 3) {
  const query = ref("");

  const products = ref<ProductSearchItem[]>([]);
  const categories = ref<ProductSearchCategory[]>([]);

  const loading = ref(false);
  const opened = ref(false);

  let timeout: ReturnType<typeof setTimeout> | null = null;
  let searchVersion = 0;

  const search = async (version: number) => {
    if (query.value.trim().length < minChars) {
      products.value = [];
      categories.value = [];
      opened.value = false;
      loading.value = false;
      return;
    }

    loading.value = true;

    try {
      const { data } = await api.get("/searchProduct", {
        params: {
          q: query.value,
        },
      });

      if (version !== searchVersion) return;

      const response = data.data ?? data;

      products.value = (
        response.products ?? response
      ).map((item: any): ProductSearchItem => ({
        id: item.id,
        name: item.name,
        catalog_number: item.catalog_number,
        price: item.price,
        image: item.image,
        url: item.url,
      }));

      categories.value = (
        response.categories ?? []
      ).map((item: any): ProductSearchCategory => ({
        name: item.name,
        url: item.url,
      }));

      opened.value = true;
    } catch (e) {
      if (version === searchVersion) {
        console.error(e);
        products.value = [];
        categories.value = [];
      }
    } finally {
      if (version === searchVersion) {
        loading.value = false;
      }
    }
  };

  watch(query, () => {
    const version = ++searchVersion;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      void search(version);
    }, 300);
  });

  const clear = () => {
    searchVersion++;

    if (timeout) clearTimeout(timeout);

    query.value = "";
    products.value = [];
    categories.value = [];
    opened.value = false;
    loading.value = false;
  };

  return {
    query,
    products,
    categories,
    loading,
    opened,
    clear,
  };
}
