<template>
    <div class="features">
        <div @click="toggle" class="tab-header d-flex justify-content-between align-items-center"
            :class="{ 'is-open': isOpen }">
            <div class="tab-title-container">
                <BaseIcon class="tab-icon" name="mailCheck" />
                <span class="tab-title">
                    {{ t('products.section.features') }}
                </span>
            </div>

            <BaseIcon :name="isOpen ? 'minus' : 'plus'" />
        </div>

        <div class="wrapper-content" :class="{ 'is-open': isOpen }">
            <div class="content-wrapper-inside">
                <table class="features-table">
                    <tr v-if="features && features.length" v-for="feature in features" :key="feature.name">
                        <td><b>{{ feature.name }}</b></td>
                        <td>{{ feature.value }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

const props = defineProps<{
    features: any
}>()

const { t } = useI18n()

const isOpen = ref(false)

const toggle = () => {
    isOpen.value = !isOpen.value
}
console.log(props.features);
</script>

<style scoped>
@import './ProductTabs.css';
</style>
