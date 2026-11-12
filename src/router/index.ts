import { createRouter, createWebHistory } from "vue-router";
import { userRoutes } from "./site.routes";
import { adminRoutes } from "./admin.routes";
import { i18n } from "@/core/i18n";
import { useAuthStore } from "@/core/stores/authStore";
import { applyRouteDocumentMeta } from "@/core/utils/documentMeta";

const router = createRouter({
  history: createWebHistory(),
  routes: [...userRoutes, ...adminRoutes],
});

/* GUARD */
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.initialized) {
    await auth.fetchMe();
  }

  const isLogged = auth.isLogged;

  // 🔐 tylko jeśli trasa wymaga auth
  if (to.meta.requiresAuth && !isLogged) {
    return "/login";
  }

  if (to.matched.some((r) => r.meta.requiresAdmin)) {
    if (!auth.isAdmin) {
      return "/";
    }
  }

  if (to.meta.requiresSuperAdmin && !auth.isSuperAdmin) {
    return "/";
  }

  // 👉 opcjonalnie: blokuj login gdy zalogowany
  if (isLogged && to.path === "/login") {
    return "/";
  }
});

/* TITLE */
router.afterEach((to) => {
  // Metadane treści i stron pobiera oraz ustawia ich widok.
  // Nie nadpisujemy go przy zmianach query (np. filtrach lub paginacji kategorii).
  if (to.name === "dynamic" || to.meta.usesPageMetaData) return;

  const titleKey = to.meta.title as string | undefined;

  const translatedTitle = titleKey ? i18n.global.t(titleKey) : "";

  applyRouteDocumentMeta(translatedTitle);
});

export default router;
