import { defineStore } from "pinia";
import api from "@/core/api/axios";
import type { UrlObject } from "@/composables/useUrlResolver";

/**
 * =========================
 * TYPES
 * =========================
 */

export interface MenuItem {
  id: number;
  name: string;
  type:
    | "category"
    | "cms"
    | "external"
    | "news_category"
    | "title"
    | "special_category";
  url: UrlObject;
  target_blank: boolean;
  children: MenuItem[];
  has_children?: boolean;
}

export interface Footer {
  footer_1: MenuItem[];
  footer_2: MenuItem[];
  footer_3: MenuItem[];
}

export interface ContactItem {
  type: "phone" | "email" | "hours";
  value: string;
  url?: string;
}

export interface Contact {
  items: ContactItem[];
}

export interface CompanyAddress {
  city: string;
  street: string;
  zip_code: string;
  building_number: string;
  local_number?: string | null;
}

export interface CompanyOpeningHours {
  week: string;
  saturday?: string | null;
}

export interface Company {
  name: string;
  name_short: string;
  nip: string;
  address: CompanyAddress;
  emails: string[];
  phones: string[];
  opening_hours: CompanyOpeningHours;
}
export interface SocialMedia {
  name: string;
  value: string;
}

/**
 * =========================
 * STORE
 * =========================
 */

export const useContentStore = defineStore("content", {
  state: () => ({
    // aktualna strona
    page: null as any,
    pageType: null as string | null,
    pageId: null as number | null,

    menu: [] as MenuItem[],

    footer: {
      footer_1: [],
      footer_2: [],
      footer_3: [],
    } as Footer,

    contact: {
      items: [],
    } as Contact,

    company: null as Company | null,
    socialMedia: [] as SocialMedia[],

    logo: null as string | null,
    logoDark: null as string | null,

    loading: false,
  }),

  /**
   * =========================
   * ACTIONS
   * =========================
   */

  actions: {
    resetPage() {
      this.page = null;
    },
    async fetchContent(type: string, id: number) {
      this.loading = true;

      try {
        const lang = localStorage.getItem("lang");

        const { data } = await api.get(`/content/${type}/${id}`, {
          params: { lang },
        });

        this.page = data;
        this.pageType = type;
        this.pageId = id;

        return true;
      } catch (e) {
        console.error("Content fetch error:", e);
        return false;
      } finally {
        this.loading = false;
      }
    },
    async fetchLayout() {
      this.loading = true;

      try {
        const { data } = await api.get("/content/layout");

        this.menu = data.menu ?? [];

        this.footer = data.footer ?? {
          footer_1: [],
          footer_2: [],
          footer_3: [],
        };

        this.contact = data.contact ?? { items: [] };

        this.company = data.company ? mapCompany(data.company) : null;

        this.socialMedia = data.socialMedia ?? [];

        this.logo = data.logo?.logo ?? null;
        this.logoDark = data.logo?.logo_dark ?? null;
      } catch (e) {
        console.error("Layout fetch error:", e);
      } finally {
        this.loading = false;
      }
    },
  },

  /**
   * =========================
   * GETTERS
   * =========================
   */
  getters: {
    fullAddress: (state): string => {
      if (!state.company) return "";

      const a = state.company.address;
      console.log(a);

      return `${a.street} ${a.building_number}${a.local_number ? "/" + a.local_number : ""}, ${a.zip_code} ${a.city}`;
    },

    primaryPhone: (state): string | null => {
      return state.company?.phones?.[0] ?? null;
    },

    primaryEmail: (state): string | null => {
      return state.company?.emails?.[0] ?? null;
    },
  },
});

/**
 * =========================
 * MAPPER
 * =========================
 */

function mapCompany(data: any): Company {
  return {
    name: data.name ?? "",
    name_short: data.name_short ?? "",
    nip: data.nip ?? "",

    address: {
      city: data.address?.city ?? "",
      street: data.address?.street ?? "",
      zip_code: data.address?.zip_code ?? "",
      building_number: data.address?.building_number ?? "",
      local_number: data.address?.local_number ?? null,
    },

    emails: Array.isArray(data.emails) ? data.emails : [],
    phones: Array.isArray(data.phones) ? data.phones : [],

    opening_hours: {
      week: data.opening_hours?.week ?? "",
      saturday: data.opening_hours?.saturday ?? null,
    },
  };
}
