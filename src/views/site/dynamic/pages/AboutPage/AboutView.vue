<template>
  <article class="about-page" :lang="locale">
    <section class="about-hero" aria-labelledby="about-heading">
      <div class="about-container about-hero__grid">
        <div class="about-hero__copy">
          <p class="about-eyebrow">{{ t('common.aboutUs') }}</p>
          <h1 id="about-heading">{{ introCms?.title || '' }}</h1>
          <div class="about-divider about-divider--spark" aria-hidden="true">
            <BaseIcon name="sparkle" />
          </div>
          <CmsBlock ref="introCms" :cms-id="cmsIds.intro" :show-title="false" />
          <BaseButton type="button" variant="primary" class="about-button"
            @click="router.push(t('url.routes.contact'))">
            <BaseIcon name="phone" aria-hidden="true" />
            {{ t('about.contactUs') }}
          </BaseButton>
        </div>
        <div class="about-hero__image">
          <BannerBlock type="unset" :context-id="bannerIds.intro" :show-title="false" />
        </div>
      </div>
    </section>

    <section class="about-identity" aria-labelledby="about-identity-heading">
      <div class="about-container">
        <div class="about-section-heading">
          <h2 id="about-identity-heading">{{ identityCms?.title || '' }}</h2>
          <CmsBlock ref="identityCms" :cms-id="cmsIds.identity" :show-title="false" />
        </div>
        <CmsBlock :cms-id="cmsIds.benefits" />
      </div>
    </section>

    <section class="about-offer" aria-labelledby="about-offer-heading">
      <div class="about-container">
        <div class="about-section-heading">
          <h2 id="about-offer-heading">{{ offerIntroCms?.title || '' }}</h2>
          <CmsBlock ref="offerIntroCms" :cms-id="cmsIds.offerIntro" :show-title="false" />
        </div>
        <div class="about-offer__copy">
          <div>
            <CmsBlock :cms-id="cmsIds.supply" />
          </div>
          <div>
            <CmsBlock :cms-id="cmsIds.products" />
          </div>
        </div>
      </div>
    </section>

    <section class="about-why" aria-labelledby="about-why-heading">
      <div class="about-container">
        <div class="about-why__grid">
          <div class="about-why__image">
            <BannerBlock type="unset" :context-id="bannerIds.why" :show-title="false" />
          </div>
          <div class="about-why__copy">
            <p class="about-eyebrow">{{ t('about.whyUs') }}</p>
            <h2 id="about-why-heading">{{ whyCms?.title || '' }}</h2>
            <div class="about-divider" aria-hidden="true"></div>
            <CmsBlock ref="whyCms" :cms-id="cmsIds.why" :show-title="false" />
          </div>
        </div>
        <div class="about-promotions">
          <CmsBlock :cms-id="cmsIds.promotions" />
          <BaseButton type="button" variant="secondary" class="about-button"
            @click="router.push(t('url.routes.search'))">
            {{ t('about.viewOffer') }} <BaseIcon name="chRight" aria-hidden="true" />
          </BaseButton>
        </div>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BaseButton from '@/views/shared/ui/BaseButton.vue';
import BaseIcon from '@/views/shared/ui/BaseIcon.vue';

import CmsBlock from '@/views/shared/components/CmsBlock.vue';
import BannerBlock from '@/views/shared/components/BannerBlock.vue';
import { usePageMetaData } from '@/composables/usePageMetaData';

const metadataName = 'aboutUs';
usePageMetaData(metadataName);

const cmsIds = {
  intro: 23,
  identity: 24,
  benefits: 31,
  offerIntro: 25,
  supply: 26,
  products: 27,
  why: 28,
  promotions: 29,
};
const bannerIds = {
  intro: 12,
  why: 13,
};

const { t, locale } = useI18n();
const router = useRouter();
const introCms = ref<InstanceType<typeof CmsBlock> | null>(null);
const identityCms = ref<InstanceType<typeof CmsBlock> | null>(null);
const offerIntroCms = ref<InstanceType<typeof CmsBlock> | null>(null);
const whyCms = ref<InstanceType<typeof CmsBlock> | null>(null);
</script>

<style scoped src="./AboutViewStyle.css"></style>
