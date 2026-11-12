import { computed, watch } from "vue";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import { useContentStore } from "@/core/stores/contentStore";
import { useLangStore } from "@/core/stores/langStore";
import { getIdFromSlug } from "@/core/utils/slug";
import { typeMap } from "@/core/utils/typeMap";
import { applyContentDocumentMeta } from "@/core/utils/documentMeta";

// widoki
import ProductView from "./shop/ProductView/ProductView.vue";
import CategoryView from "./shop/CategoryView/CategoryView.vue";
import ManufacturerView from "./shop/ManufacturerView/ManufacturerView.vue";
import CmsView from "./pages/CmsView.vue";

export function useDynamicPage() {
  const route = useRoute();
  const router = useRouter();
  const contentStore = useContentStore();
  const langStore = useLangStore();

  async function load(rawType?: string, rawSlug?: string) {
    rawType = rawType ?? (route.params.type as string);
    rawSlug = rawSlug ?? (route.params.slug as string);

    // 🔤 mapowanie typu (np. kategoria → category)
    const type = typeMap[rawType];

    if (!type) {
      console.warn("❌ Unknown type:", rawType);
      return router.replace("/404");
    }

    // 🔢 wyciągnięcie ID ze sluga
    const id = getIdFromSlug(rawSlug);

    if (!id) {
      console.warn("❌ Invalid slug (no ID):", rawSlug);
      return router.replace("/404");
    }

    try {
      contentStore.resetPage();

      const ok = await contentStore.fetchContent(type, id);

      if (!ok) {
        console.warn("❌ Content not found:", { type, id });
        return router.replace("/404");
      }

      // 🔥 opcjonalnie: sprawdzenie canonical URL (SEO)
      // jeśli slug się nie zgadza → redirect na poprawny
      const expectedSlug = `${contentStore.page.id}-${contentStore.page.slug}`;

      if (rawSlug !== expectedSlug) {
        const correctTypePrefix = route.params.type;

        return router.replace(`/${correctTypePrefix}/${expectedSlug}`);
      }

      applyContentDocumentMeta(contentStore.page);
    } catch (e) {
      console.error("❌ Error while loading page:", e);
      router.replace("/404");
    }
  }

  // 🔁 inicjalne załadowanie + zmiana języka
  watch(
    () => langStore.current,
    () => load(),
    { immediate: true },
  );

  // 🔁 nawigacja do innej strony (type lub slug się zmienił)
  // ignoruje zmiany query (filtry) — nie odświeża całej strony
  onBeforeRouteUpdate((to, from) => {
    if (
      to.params.type !== from.params.type ||
      to.params.slug !== from.params.slug
    ) {
      load(to.params.type as string, to.params.slug as string);
    }
  });

  // 🧠 dynamiczny wybór komponentu
  const component = computed(() => {
    switch (contentStore.pageType) {
      case "product":
        return ProductView;

      case "category":
        return CategoryView;

      case "manufacturer":
        return ManufacturerView;

      case "cms":
        return CmsView;

      default:
        return null;
    }
  });

  return {
    component,
    contentStore,
  };
}
