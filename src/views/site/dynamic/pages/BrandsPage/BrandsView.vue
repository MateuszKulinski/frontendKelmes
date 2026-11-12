<template>
  <main class="brands-page content-container">
    <header class="brands-page__header">
      <h1 class="brands-page__title">{{ t('brands.title') }}</h1>
      <p class="brands-page__intro">{{ t('brands.intro') }}</p>
    </header>

    <p v-if="loading" class="brands-page__status" role="status" aria-live="polite">
      {{ t('brands.loading') }}
    </p>

    <div v-else-if="loadError" class="brands-page__status" role="alert">
      <p>{{ t('brands.loadError') }}</p>
      <button type="button" class="brands-page__retry" @click="loadBrands">
        {{ t('brands.retry') }}
      </button>
    </div>

    <p v-else-if="!manufacturers.length" class="brands-page__status">
      {{ t('brands.empty') }}
    </p>

    <ul v-else class="brands-grid">
      <li v-for="manufacturer in manufacturers" :key="manufacturer.id">
        <article class="brand-card">
          <router-link
            class="brand-card__image"
            :to="resolve(manufacturer.url)"
            :aria-label="`${manufacturer.name || t('brands.unnamed')} — ${t('brands.viewProducts')}`"
          >
            <img
              v-if="manufacturer.logo_url && !failedLogos.has(manufacturer.id)"
              :src="manufacturer.logo_url"
              :alt="manufacturer.name || t('brands.unnamed')"
              loading="lazy"
              @error="hideLogo(manufacturer.id)"
            />
            <span v-else class="brand-card__placeholder" aria-hidden="true">
              {{ t('brands.noLogo') }}
            </span>
          </router-link>

          <div class="brand-card__content">
            <h2 class="brand-card__name">{{ manufacturer.name || t('brands.unnamed') }}</h2>
            <router-link class="brand-card__link" :to="resolve(manufacturer.url)">
              {{ t('brands.viewProducts') }}
            </router-link>
          </div>
        </article>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/core/api/axios';
import { useUrlResolver, type UrlObject } from '@/composables/useUrlResolver';

interface ManufacturerItem {
  id: number;
  name: string | null;
  logo_url: string | null;
  url: UrlObject;
}

const { t } = useI18n();
const { resolve } = useUrlResolver();
const manufacturers = ref<ManufacturerItem[]>([]);
const failedLogos = ref(new Set<number>());
const loading = ref(false);
const loadError = ref(false);

async function loadBrands() {
  loading.value = true;
  loadError.value = false;

  try {
    const { data } = await api.get<{ data: ManufacturerItem[] }>('/content/manufacturers');
    manufacturers.value = data.data;
  } catch (error) {
    console.error('Failed to load active manufacturers:', error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function hideLogo(id: number) {
  failedLogos.value = new Set(failedLogos.value).add(id);
}

onMounted(loadBrands);
</script>

<style scoped src="./BrandsView.css"></style>
