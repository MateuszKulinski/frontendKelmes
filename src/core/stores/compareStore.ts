import { defineStore } from "pinia";
import api from "@/core/api/axios";

interface CompareResponse {
  ids: Array<number | string>;
}

const normalizeIds = (ids: Array<number | string>): number[] =>
  ids.map(Number).filter(Number.isFinite);

export interface CompareProduct {
  id: number;
  url: { id: number; type: 'product'; slug: string };
  image: string | null;
  name: string | null;
  rating?: number | null;
  rating_count?: number;
  indeks?: string | null;
  catalog_number?: string | null;
  manufacturer?: string | null;
  net_price: string;
  gross_price: string;
  gross_price_raw: number;
  stock: number;
  stock_status: number | null;
  available: boolean;
  packagings?: {
    quantity: number;
    name: string;
  }[];
}

export interface CompareFeature {
  id: number;
  name: string;
  type: string;
  values: Record<number, string | number | null>;
}

export interface CompareInsights {
  biggest_differences: { key: string; score: number }[];
  recommended_product_id: number | null;
  lowest_price: { product_id: number | null; same_for_all: boolean };
}

interface CompareDetailsResponse {
  products: CompareProduct[];
  features: CompareFeature[];
  insights: CompareInsights;
}

export const useCompareStore = defineStore("compare", {
  state: () => ({
    ids: [] as number[],
    products: [] as CompareProduct[],
    features: [] as CompareFeature[],
    insights: {
      biggest_differences: [],
      recommended_product_id: null,
      lowest_price: { product_id: null, same_for_all: false },
    } as CompareInsights,

    loading: false,
    detailsLoading: false,
  }),

  getters: {
    count: (state) => state.ids.length,

    has: (state) => {
      return (productId: number) => state.ids.some(id => Number(id) === Number(productId));
    },
  },

  actions: {
    async fetch() {
      this.loading = true;

      try {
        const { data } = await api.get<CompareResponse>("/compare");

        this.ids = normalizeIds(data.ids);
      } finally {
        this.loading = false;
      }
    },

    async fetchDetails() {
      this.detailsLoading = true;

      try {
        const { data } =
          await api.get<CompareDetailsResponse>("/compare/details");

        this.products = data.products;
        this.features = data.features;
        this.insights = data.insights;

        // Jeżeli endpoint details zwraca aktualne ID produktów,
        // możesz również zsynchronizować ids tutaj.
        this.ids = data.products.map((product) => Number(product.id));
      } finally {
        this.detailsLoading = false;
      }
    },

    async add(productId: number) {
      const { data } = await api.post<CompareResponse>(`/compare/${productId}`);

      this.ids = normalizeIds(data.ids);
    },

    async remove(productId: number) {
      const { data } = await api.delete<CompareResponse>(
        `/compare/${productId}`,
      );

      this.ids = normalizeIds(data.ids);

      if (this.products.length) {
        await this.fetchDetails();
      }
    },
  },
});
