import { onMounted, ref } from 'vue'
import api from '@/core/api/axios'

export function useProductCompare() {

    const loading = ref(false)

    const products = ref<any[]>([])
    const features = ref<any[]>([])

    async function load() {

        loading.value = true

        try {

            const { data } = await api.get('/compare/details')

            products.value = data.products
            features.value = data.features

        } finally {

            loading.value = false

        }
    }

    onMounted(load)

    return {
        loading,
        products,
        features,
        load,
    }
}