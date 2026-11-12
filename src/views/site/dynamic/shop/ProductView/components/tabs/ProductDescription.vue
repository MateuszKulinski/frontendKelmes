<template>
    <div class="description">
        <div class="tab-header d-flex justify-content-between align-items-center" :class="{ 'is-open': isOpen }"
            @click="toggleDescription">
            <div class="tab-title-container">
                <BaseIcon class="tab-icon" name="bookOpen" />
                <span class="tab-title">
                    {{ t('products.section.opis_produktu') }}
                </span>
            </div>

            <BaseIcon :name="isOpen ? 'minus' : 'plus'" />
        </div>

        <div class="wrapper-content" :class="{ 'is-open': isOpen }">
            <div class="content-wrapper-inside">
                <div v-if="product.description_html" class="product-description" v-html="product.description_html" />
                <div v-else-if="product.description" class="product-description">
                    {{ product.description }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

defineProps<{
    product: any
}>()

const { t } = useI18n()

const isOpen = ref(false)

const toggleDescription = () => {
    isOpen.value = !isOpen.value
}
</script>


<style scoped>
@import './ProductTabs.css';
</style>
