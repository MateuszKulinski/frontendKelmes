import { defineStore } from "pinia";
import api from "@/core/api/axios";
// import { type MeResponse, type AuthState, type Context, type Unit, type User } from '@/composables/types/auth'
import {
  type MeResponse,
  type Context,
  type Unit,
  type User,
} from "@/composables/types/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as any,
    context: null as any,
    unit: null as any,
    loading: false,
    initialized: false,
    fetchPromise: null as Promise<any> | null,
    abilities: [] as string[],
  }),

  getters: {
    isLogged(): boolean {
      return !!this.user;
    },

    isSuperAdmin: (state) => state.user?.role === "super_admin",
    isAdmin(): boolean {
      return (
        Number(this.user?.permission_id) === 2 ||
        this.user?.role === "super_admin" ||
        this.user?.role === "admin"
      );
    },

    fullName(): string {
      if (!this.user) return "";

      return [this.firstname, this.lastname].filter(Boolean).join(" ");
    },
    firstname(): string {
      if (!this.user) return "";
      return this.user.firstname;
    },
    lastname(): string {
      if (!this.user) return "";
      return this.user.lastname;
    },
    phone(): string {
      if (!this.user) return "";
      return this.user.phone;
    },

    initials(): string {
      if (!this.user) return "";

      return (
        (this.user.firstname?.[0] ?? "") + (this.user.lastname?.[0] ?? "")
      ).toUpperCase();
    },

    canSwitchUnit(): boolean {
      return !!this.context?.can_switch_unit;
    },

    currentUnitId: (state) => state.context?.current_unit_id,

    availableUnitsCount: (state) => state.context?.available_units_count ?? 0,

    currentUnitName: (state) => state.unit?.name ?? "",
  },

  actions: {
    hasAbility(ability: string): boolean {
      return this.abilities.includes("*") || this.abilities.includes(ability);
    },
    init() {
      const token = localStorage.getItem("token");

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    },

    async login(payload: { login: string; password: string }) {
      if (this.loading) return;

      this.loading = true;

      try {
        const { data } = await api.post<{
          token: string;
          user: User;
          unit: Unit;
          context: Context;
          abilities: string[];
        }>("/login", payload);

        // token
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        this.user = data.user;
        this.context = data.context;
        this.unit = data.unit;
        this.abilities = data.abilities;

        this.initialized = true;

        return data;
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (this.initialized && this.user) return;

      if (this.fetchPromise) {
        return this.fetchPromise;
      }

      this.fetchPromise = (async () => {
        try {
          this.loading = true;

          const { data } = await api.get<MeResponse>("/me");

          this.user = data.user;
          this.context = data.context;
          this.unit = data.unit;
          this.abilities = data.abilities;
        } catch (e) {
          console.log("ME ERROR", e);
          this.user = null;
          this.context = null;
          this.unit = null;
        } finally {
          this.loading = false;
          this.initialized = true;
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    },
    async switchUnit(unitId: number) {
      if (this.loading) return;

      try {
        this.loading = true;

        const { data } = await api.post("/switch-unit", {
          unit_id: unitId,
        });

        this.unit = { ...data.unit };
        this.context = { ...data.context };

        if (this.user) {
          this.user.unit_id = data.context.current_unit_id;
        }

        return data;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      if (this.loading) return;

      try {
        await api.post("/logout");
      } catch (e) {
        console.log("LOGOUT ERROR", e);
      }

      this.user = null;
      this.context = null;
      this.initialized = false;

      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    },
  },
});
