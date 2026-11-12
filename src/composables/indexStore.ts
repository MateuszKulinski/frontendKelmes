import { defineStore } from "pinia";
import api from "@/core/api/axios";
import type { UrlObject } from "./useUrlResolver";
import type { Banner } from "./types/banner";

/**
 * =========================
 * TYPES
 * =========================
 */

export interface SliderItem {
  id: number;
  image: string | null;
  title: string | null;
  content: string | null;
  link: string | null;
  button_text: string | null;
}

export interface ManufacturerProductItem {
  name: string;
  url: UrlObject;
  logo_url: string | null;
}

export interface ProductItem {
  id: number;
  stock_status: number;
  indeks: string | null;
  catalog_number: string | null;
  name: string | null;
  slug: string | null;
  // description_short: string | null
  manufacturer: ManufacturerProductItem | null;
  image: string | null;
  price: string | null;
  net_price: string | null;
  gross_price: string | null;
  is_sale: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_recommended: boolean;
  url: UrlObject;
  stock: number;
  delivery_date: string | null;
  manufacturer_logo_url: string | null;
  delivery_text: string | null;
  rating: {
    average: number;
    count: number;
  };
}

export interface HomePageData {
  slider: SliderItem[];
  recommended_products: ProductItem[];
  special_offer_products: ProductItem[];
  sale_products: ProductItem[];
  homepage_banners: Banner[];
  articles: NewsCategory[];
}

export interface NewsItem {
  id: number;
  publish_date: string | null;
  title: string | null;
  slug: string | null;
  short_description: string | null;
  content?: string | null;
  image: string | null;
  category?: { id: number; title: string } | null;
}

export interface NewsCategory {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  articles: NewsItem[];
}

/**
 * =========================
 * STORE
 * =========================
 */

export const useIndexStore = defineStore("index", {
  state: () => ({
    slider: [] as SliderItem[],
    recommendedProducts: [] as ProductItem[],
    specialOfferProducts: [] as ProductItem[],
    saleProducts: [] as ProductItem[],
    homeBanners: [] as Banner[],
    articles: [] as NewsCategory[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchHomePage() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.get<HomePageData>("/content/homepage");
        this.slider = data.slider ?? [];
        this.recommendedProducts = data.recommended_products ?? [];
        this.specialOfferProducts = data.special_offer_products ?? [];
        this.saleProducts = data.sale_products ?? [];
        this.homeBanners = data.homepage_banners ?? [];
        this.articles = data.articles ?? [];
      } catch (e: any) {
        if (e.name === "CanceledError") return;
        this.error = "Błąd pobierania danych strony głównej";
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
});
