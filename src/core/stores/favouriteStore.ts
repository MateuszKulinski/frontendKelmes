import { defineStore } from 'pinia'
import api from '@/core/api/axios'
import type { UrlObject } from '@/composables/useUrlResolver'

export interface FavouriteProduct {
    id: number
    name: string | null
    url: UrlObject
    image: string | null
    net_price: string | null
    gross_price: string | null
}

export interface FavouriteList {
    id: number
    name: string
    product_ids: number[]
    products: FavouriteProduct[]
}

export interface FavouritesMap {
    product_ids: number[]
    lists: FavouriteList[]
}

export const useFavouriteStore = defineStore('favourites', {
    state: () => ({
        lists: [] as FavouriteList[],
        productIdsSet: new Set<number>(),
        loading: false,
        initialized: false,
    }),

    getters: {
        isProductFavourite: (state) => (productId: number): boolean => {
            return state.productIdsSet.has(productId)
        },

        getProductLists: (state) => (productId: number): FavouriteList[] => {
            return state.lists.filter(l => l.product_ids.includes(productId))
        },
    },

    actions: {
        /** Jedno zapytanie – pobiera całą mapę list i ID produktów */
        async fetchFavourites() {
            if (this.initialized) return
            this.loading = true
            try {
                const { data } = await api.get<FavouritesMap>('/favourites')
                this._applyMap(data)
                this.initialized = true
            } finally {
                this.loading = false
            }
        },

        async createList(name: string): Promise<FavouriteList> {
            const { data } = await api.post<FavouriteList>('/favourites', { name })
            this.lists.unshift(data)
            return data
        },

        async renameList(listId: number, name: string) {
            const { data } = await api.patch<FavouriteList>(`/favourites/${listId}`, { name })
            this._updateList(data)
        },

        async deleteList(listId: number) {
            await api.delete(`/favourites/${listId}`)
            this.lists = this.lists.filter(l => l.id !== listId)
            this._rebuildSet()
        },

        async addProduct(listId: number, productId: number) {
            const { data } = await api.post<FavouriteList>(`/favourites/${listId}/products`, { product_id: productId })
            this._updateList(data)
            this.productIdsSet.add(productId)
        },

        async removeProduct(listId: number, productId: number) {
            const { data } = await api.delete<FavouriteList>(`/favourites/${listId}/products/${productId}`)
            this._updateList(data)
            this._rebuildSet()
        },

        _applyMap(map: FavouritesMap) {
            this.lists = map.lists
            this.productIdsSet = new Set(map.product_ids)
        },

        _updateList(updated: FavouriteList) {
            const idx = this.lists.findIndex(l => l.id === updated.id)
            if (idx !== -1) {
                this.lists[idx] = updated
            } else {
                this.lists.unshift(updated)
            }
            this._rebuildSet()
        },

        _rebuildSet() {
            const ids = this.lists.flatMap(l => l.product_ids)
            this.productIdsSet = new Set(ids)
        },
    },
})
