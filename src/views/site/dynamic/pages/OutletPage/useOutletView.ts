import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";
import { useCmsStore } from "@/core/stores/cmsStore";
import { useLangStore } from "@/core/stores/langStore";
import type { CmsPage } from "@/composables/types/cms";
import { applyRouteDocumentMeta } from "@/core/utils/documentMeta";

export function useOutletView() {
  const { t } = useI18n();
  const langStore = useLangStore();
  const cmsStore = useCmsStore();
  const cmsPage = ref<CmsPage | null>(null);
  const cmsPageBottom = ref<CmsPage | null>(null);
  const category = ref<any>(null);
  const loading = ref(false);
  const categoryError = ref(false);
  const cmsError = ref(false);
  const outletSettings = ref({
    outlet_cms_id_top: 0,
    outlet_cms_id_bottom: 0,
    outlet_category_id: 0,
    outlet_banner_id: 0,
  });
  const title = computed(
    () => cmsPage.value?.title?.trim() || t("outlet.title"),
  );
  let requestId = 0;

  async function load() {
    const currentRequest = ++requestId;
    loading.value = true;
    categoryError.value = false;
    cmsError.value = false;
    cmsPage.value = null;
    cmsPageBottom.value = null;
    category.value = null;

    let settings: typeof outletSettings.value;
    try {
      const { data } = await api.get("/content/outlet-settings");
      settings = {
        outlet_cms_id_top: Number(data.outlet_cms_id_top) || 0,
        outlet_cms_id_bottom: Number(data.outlet_cms_id_bottom) || 0,
        outlet_category_id: Number(data.outlet_category_id) || 0,
        outlet_banner_id: Number(data.outlet_banner_id) || 0,
      };
      outletSettings.value = settings;
    } catch {
      if (currentRequest !== requestId) return;
      categoryError.value = true;
      cmsError.value = true;
      loading.value = false;
      applyRouteDocumentMeta(title.value);
      return;
    }

    const [cmsResult, cmsBottomResult, categoryResult] =
      await Promise.allSettled([
        settings.outlet_cms_id_top > 0
          ? cmsStore.fetchById(settings.outlet_cms_id_top)
          : Promise.resolve(null),
        settings.outlet_cms_id_bottom > 0
          ? cmsStore.fetchById(settings.outlet_cms_id_bottom)
          : Promise.resolve(null),
        settings.outlet_category_id > 0
          ? api.get(`/content/category/${settings.outlet_category_id}`, {
              params: { in_stock: 1 },
            })
          : Promise.resolve(null),
      ]);

    if (currentRequest !== requestId) return;

    if (cmsResult.status === "fulfilled") cmsPage.value = cmsResult.value;
    cmsError.value =
      (settings.outlet_cms_id_top > 0 && !cmsPage.value) ||
      (settings.outlet_cms_id_bottom > 0 &&
        (cmsBottomResult.status === "rejected" || !cmsBottomResult.value));
    if (cmsBottomResult.status === "fulfilled")
      cmsPageBottom.value = cmsBottomResult.value;

    if (categoryResult.status === "fulfilled")
      category.value = categoryResult.value?.data ?? null;
    categoryError.value =
      settings.outlet_category_id > 0 && !category.value;
    loading.value = false;
    applyRouteDocumentMeta(title.value);
  }

  watch(() => langStore.current, load, { immediate: true });
  onBeforeUnmount(() => {
    requestId++;
  });

  return {
    category,
    categoryError,
    cmsPage,
    cmsPageBottom,
    cmsError,
    outletSettings,
    loading,
    title,
    load,
  };
}
