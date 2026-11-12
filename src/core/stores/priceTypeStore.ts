import { defineStore } from 'pinia'

export type PriceType = 'net' | 'gross'

const STORAGE_KEY = 'price_type'

const getInitialPriceType = (): PriceType => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'gross' ? 'gross' : 'net'
}

export const usePriceTypeStore = defineStore('priceType', {
    state: () => ({
        current: getInitialPriceType() as PriceType,
    }),

    getters: {
        isNet: (state): boolean => state.current === 'net',
        isGross: (state): boolean => state.current === 'gross',
    },

    actions: {
        setPriceType(type: PriceType) {
            this.current = type
            localStorage.setItem(STORAGE_KEY, type)
        },
        togglePriceType() {
            this.setPriceType(this.current === 'net' ? 'gross' : 'net')
        },
    },
})