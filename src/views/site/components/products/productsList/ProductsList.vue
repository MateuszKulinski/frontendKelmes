<template>
    <div class="products-list">

        <ProductsViewToggle v-if="viewType === undefined" v-model="localViewType" />

        <div class="products-cards d-flex flex-wrap" :class="{
            'flex-column': currentViewType === 'list' && !isMobile,
            'list-view': currentViewType === 'list' && !isMobile,
        }">
            <div v-for="product in products" :key="product.id" class="product-card-link" :class="currentViewType === 'list' && !isMobile
                ? 'col-12'
                : 'col-md-3'
                ">
                <ProductCard :product="product" :view-type="isMobile ? 'grid' : currentViewType" />
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
} from 'vue'

import ProductCard from '@/views/site/components/products/ProductCard.vue'
import ProductsViewToggle from './ProductsViewToggle.vue'
import { useProductsView } from './useProductsView'
import type { ProductsViewType } from './productListOptions'

const props = withDefaults(defineProps<{
    products: any[]
    defaultView?: ProductsViewType
    viewType?: ProductsViewType
}>(), { defaultView: 'list' })

const { viewType: localViewType } = useProductsView(props.defaultView)
const currentViewType = computed(() => props.viewType ?? localViewType.value)

const isMobile = ref(false)

let mobileQuery: MediaQueryList | null = null

function updateMobile() {
    isMobile.value =
        mobileQuery?.matches ?? false
}

onMounted(() => {
    mobileQuery = window.matchMedia(
        '(max-width: 991px)'
    )

    updateMobile()

    mobileQuery.addEventListener(
        'change',
        updateMobile
    )
})

onBeforeUnmount(() => {
    mobileQuery?.removeEventListener(
        'change',
        updateMobile
    )
})
</script>


<style scoped src="./ProductsList.css"></style>
