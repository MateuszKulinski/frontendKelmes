<template>
  <router-view />
  <GlobalModal />
</template>

<script setup lang="ts">
import GlobalModal from "@/views/modals/GlobalModal.vue";

import { onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useLangStore } from "@/core/stores/langStore";
import { useContentStore } from "@/core/stores/contentStore";
import { useAuthStore } from "@/core/stores/authStore";
import { useCountryStore } from "./core/stores/countryStore";

import { useRoutePath } from "@/composables/useRoutePath";

import { useCompareStore } from "@/core/stores/compareStore";
import { useCartStore } from "@/core/stores/cartStore";

// stores
const langStore = useLangStore();
const contentStore = useContentStore();
const auth = useAuthStore();
const countryStore = useCountryStore();

// router
const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();

// helper
const { routePath } = useRoutePath();

const compareStore = useCompareStore();

onMounted(async () => {
  console.log("APP mounted");

  await Promise.all([
    contentStore.fetchLayout(),
    compareStore.fetch(),
    countryStore.fetchCountries(),
  ]);

  if (auth.currentUnitId) {
    await cartStore.loadActiveCart();
  }
});

watch(
  () => langStore.current,
  async () => {
    await contentStore.fetchLayout();

    const currentName = route.name as string;
    if (!currentName || currentName === "NotFound") return;

    const newParams = { ...route.params };

    if (newParams.type) {
      newParams.type = routePath(newParams.type as string).replace("/", "");
    }

    router.replace({
      name: currentName,
      params: newParams,
      query: route.query,
    });
  }
);

watch(
  () => auth.currentUnitId,
  async () => {
    console.log("UNIT CHANGED");
    await contentStore.fetchLayout();
  }
);
</script>