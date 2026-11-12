<template>
  <div class="app-layout d-flex flex-column min-vh-100">
    <Header @open-ai-chat="openAiChat" />

    <main class="app-content flex-grow-1">
      <router-view />
    </main>

    <Footer />
    <Loader />
    <ToastContainer />
    <AiChatWidget ref="aiChatWidget" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Footer from "./components/footer/Footer.vue";
import Header from "./components/header/Header.vue";
import Loader from "@admin/layouts/components/loader/Loader.vue";
import ToastContainer from "@admin/layouts/components/toast/ToastContainer.vue";
import AiChatWidget from "./components/aiChat/AiChatWidget.vue";
import { useAuthStore } from '@/core/stores/authStore'
import { useFavouriteStore } from '@/core/stores/favouriteStore'
import { useCompareStore } from '@/core/stores/compareStore'

const auth = useAuthStore()
const favouriteStore = useFavouriteStore()
const compareStore = useCompareStore()
const aiChatWidget = ref<InstanceType<typeof AiChatWidget> | null>(null)

function openAiChat(query: string) {
  void aiChatWidget.value?.openWithQuery(query)
}

watch(
  () => auth.isLogged,
  (logged) => {
    if (logged) {
      favouriteStore.fetchFavourites()
      void compareStore.fetch()
    }
    else {
      favouriteStore.$reset()
      favouriteStore.initialized = false
      compareStore.$reset()
    }
  },
  { immediate: true }
)
</script>
