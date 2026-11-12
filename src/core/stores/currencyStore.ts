import { defineStore } from 'pinia'
import api from '@/core/api/axios'

interface Currency {
    id: number
    code: string
    name: string
    symbol: string
}

export const useCurrencyStore = defineStore('currency', {
    state: () => ({
        currencies: [] as Currency[],
        current: localStorage.getItem('currency') || 'PLN',
    }),

    getters: {
        currentCurrency(state) {
            return state.currencies.find(c => c.code === state.current)
        }
    },

    actions: {
        async fetchCurrencies() {
            try {
                const res = await api.get('/currencies')
                this.currencies = res.data
            } catch (e) {
                console.warn('Currencies API failed')
                return
            }

            const saved = localStorage.getItem('currency')

            if (saved) {
                const currency = this.currencies.find(c => c.code === saved)
                if (currency) {
                    this.current = currency.code
                    localStorage.setItem('currency_id', String(currency.id))
                    return
                }
            }

            // fallback — np. PLN jako default
            const fallback = this.currencies.find(c => c.code === 'PLN')

            if (fallback) {
                this.setCurrency(fallback.code)
            } else if (this.currencies.length) {
                this.setCurrency(this.currencies[0].code)
            }
        },

        setCurrency(code: string) {
            const currency = this.currencies.find(c => c.code === code)
            if (!currency) return

            this.current = code

            localStorage.setItem('currency', code)
            localStorage.setItem('currency_id', String(currency.id))
        }
    }
})