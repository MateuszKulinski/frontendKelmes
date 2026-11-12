<template>
  <div class="dashboard-view">
    <div class="content-container">
      <SliderView />
      <!-- <div class="homepage-products">
        <ProductsSection v-if="indexStore.specialOfferProducts.length" :title="t('products.section.specialOffers')"
          :products="indexStore.specialOfferProducts" />
      </div> -->
      <div class="homepage-products">
        <ProductsSection v-if="indexStore.recommendedProducts.length" :title="t('products.section.recommended')"
          :products="indexStore.recommendedProducts" />
      </div>
      <HomePageBannersSection :banners="indexStore.homeBanners" />
      <!-- <div class="homepage-products">
        <ProductsSection v-if="indexStore.recommendedProducts.length" :title="t('products.section.recommended')"
          :products="indexStore.recommendedProducts" />
      </div> -->
      <NewsList v-if="indexStore.articles" :data="indexStore.articles" />
    </div>

    <div class="extra-info-container">
      <div class="content-container">
        <CmsBlock :cms-id="7" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SliderView from "@/views/site/components/slider/SliderView.vue";
import ProductsSection from "@/views/site/components/products/ProductsSection.vue";
import HomePageBannersSection from "@/views/site/components/home-page-banners/HomePageBannersSection.vue";
import CmsBlock from "@/views/shared/components/CmsBlock.vue";
import { useIndexStore } from "@/composables/indexStore";
import { useI18n } from 'vue-i18n'
import NewsList from "../../components/news/NewsList.vue";
import { usePageMetaData } from '@/composables/usePageMetaData';

const { t } = useI18n()
const indexStore = useIndexStore();

const metadataName = 'index';
usePageMetaData(metadataName);
</script>

<style scoped>
.dashboard-view>div {
  padding-top: 30px;
  padding-bottom: 30px;
}

.dashboard-view>div:first-child {
  padding-top: 0;
}

:deep(.info-item-titles) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 240px;
  text-wrap-style: pretty;
}

.extra-info-container :deep(.info-title) {
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: #1E5EBE;
}

.extra-info-container :deep(.info-description) {
  font-weight: 400;
  font-size: var(--font-size-md);
  color: #000000;
}

.extra-info-container .content-container :deep(> div) {
  gap: var(--gap-xl);
}

.extra-info-container .content-container {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.extra-info-container {
  padding: 40px;
  background-color: #446DB612;
}

.dashboard-view>.content-container {
  display: flex;
  flex-direction: column;
  gap: var(--margin-xxl);
  margin-bottom: var(--margin-xl);
}

@media (max-width: 760px) {
  .extra-info-container .content-container {
    flex-direction: column;
    gap: var(--gap-lg);
  }
}
</style>
