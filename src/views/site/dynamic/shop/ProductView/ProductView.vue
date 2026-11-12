<template>
  <!-- Breadcrumb -->
  <Breadcrumbs v-if="data.breadcrumbs?.length" :items="[
    ...data.breadcrumbs.map((crumb: any) => ({
      name: crumb.name,
      url: crumb.url ? resolve(crumb.url) : undefined
    })),
    {
      name: data.name
    }
  ]" />

  <div class="product-view content-container">
    <div class="product-container d-flex">
      <div class="product-left col-md-9">
        <div class="product-top d-flex row">
          <ProductGallery :product="data" />
          <ProductInfo :product="data" />
        </div>
        <div class="product-bottom">
          <div class="product-bottom-info d-flex flex-column">
            <ProductDescription :product="data" />
            <ProductFeatures v-if="data.features?.length" :features="data.features" />
            <ProductDocumentation v-if="data.files?.length" :files="data.files" />
            <ProductReviews :product="data" />
          </div>


          <ProductsSection class="mt-5" :title="t('products.section.related')" v-if="data.related_products.length"
            :products="data.related_products" :slides-per-view="4" />
        </div>
      </div>

      <ProductPurchase :product="data" />
    </div>
    <ProductsSection class="mt-5" :title="t('products.section.similar_products')" v-if="data.similar_products.length"
      :products="data.similar_products" />

    <!-- Banery produktu -->
    <BannerBlock type="product" :context-id="data.id" />
    <RelatedNews :items="data.articles || []" />
  </div>
</template>

<script setup lang="ts">
// import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProductGallery from './components/gallery/ProductGallery.vue'
// import { reverseTypeMap } from '@/core/utils/typeMap'
import BannerBlock from '@/views/shared/components/BannerBlock.vue'
import RelatedNews from '@/views/site/components/news/RelatedNews.vue'
import ProductInfo from './components/ProductInfo.vue'
import ProductPurchase from './components/productPurchase/ProductPurchase.vue'
import ProductDescription from './components/tabs/ProductDescription.vue'
import ProductFeatures from './components/tabs/ProductFeatures.vue'
import ProductReviews from './components/tabs/ProductReviews.vue'
import ProductDocumentation from './components/tabs/ProductDocumentation.vue'
import ProductsSection from '@/views/site/components/products/ProductsSection.vue'
import Breadcrumbs from '@/views/site/components/breadcrumbs/Breadcrumbs.vue'

const props = defineProps<{ data: any }>()
// const { locale } = useI18n()
// const categoryTypePrefix = computed(() =>
//   reverseTypeMap[locale.value]?.category ?? 'category'
// )
import { useUrlResolver } from '@/composables/useUrlResolver'
const { resolve } = useUrlResolver()

const { t } = useI18n();


</script>

<style scoped>
@import './ProductView.css';
</style>
