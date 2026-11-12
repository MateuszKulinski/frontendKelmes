<template>
  <footer class="app-footer mt-auto">
    <div class="content-container py-4">
      <div class="row">
        <FooterColumnCompany :logo-dark="logoDark" :company="company" />
        <FooterColumn v-for="key in activeFooterKeys" :key="key" :items="footer[key]" />
        <div class="col-12 col-md mb-3">
          <NewsletterSubscribe />
          <SocialMedia :items="socialMedia" />
        </div>
      </div>
    </div>

    <div class="text-center py-3 border-top small">
      © {{ new Date().getFullYear() }}
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useContentStore } from "@/core/stores/contentStore";
import FooterColumn from "./FooterColumn.vue";
import FooterColumnCompany from "./FooterColumnCompany.vue";
import NewsletterSubscribe from "../newsletter/NewsletterSubscribe.vue";
import SocialMedia from "../social-media/SocialMedia.vue";

const contentStore = useContentStore();
const { footer, logoDark, company, socialMedia } = storeToRefs(contentStore);

const footerKeys = ['footer_1', 'footer_2', 'footer_3'] as const;
const activeFooterKeys = computed(() => footerKeys.filter(key => footer.value[key]?.length > 0));
</script>

<style scoped>
.app-footer .row {
  width: 100%;
}
</style>
