<template>
  <article class="outlet-page content-container" :lang="locale" aria-labelledby="outlet-heading">
    <header class="outlet-page__header">
      <h1 id="outlet-heading" class="outlet-page__title">
        <BaseIcon name="tags" class="outlet-page__icon" aria-hidden="true" />
        {{ title }}
      </h1>
      <p class="outlet-page__intro">{{ t('outlet.intro') }}</p>
    </header>

    <div v-if="outletSettings.outlet_banner_id > 0" class="outlet-page__banner">
      <BannerBlock :key="`${locale}-${outletSettings.outlet_banner_id}`" type="unset" :context-id="outletSettings.outlet_banner_id" :show-title="false" />
    </div>

    <div v-if="cmsPage?.content" class="outlet-page__content" v-html="cmsPage.content"></div>
    <div v-if="cmsError" class="outlet-page__status" role="alert">
      <p>{{ t('outlet.cmsError') }}</p>
      <button type="button" class="outlet-page__retry" @click="load">{{ t('outlet.retry') }}</button>
    </div>

    <div v-if="loading" class="outlet-page__status" role="status" aria-live="polite">
      {{ t('category.filters.loading_products') }}
    </div>
    <div v-else-if="categoryError" class="outlet-page__status" role="alert">
      <p>{{ t('outlet.categoryError') }}</p>
      <button type="button" class="outlet-page__retry" @click="load">{{ t('outlet.retry') }}</button>
    </div>
    <CategoryView v-else-if="category" :key="`${locale}-${category.id}`" :data="category" embedded outlet-mode
      :show-related-news="false" />
    <p v-else class="outlet-page__status">{{ t('outlet.unavailable') }}</p>
    <div v-if="cmsPageBottom?.content" class="outlet-page__content" v-html="cmsPageBottom.content"></div>
    <RelatedNews v-if="category?.articles?.length" :items="category.articles" />
  </article>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseIcon from '@/views/shared/ui/BaseIcon.vue';
import BannerBlock from '@/views/shared/components/BannerBlock.vue';
import CategoryView from '../../shop/CategoryView/CategoryView.vue';
import RelatedNews from '@/views/site/components/news/RelatedNews.vue';
import { useOutletView } from './useOutletView';
import './OutletView.css';

const { t, locale } = useI18n();
const { category, categoryError, cmsPage, cmsPageBottom, cmsError, outletSettings, loading, title, load } = useOutletView();
</script>
