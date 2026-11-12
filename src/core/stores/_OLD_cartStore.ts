// @ts-nocheck

import { defineStore } from 'pinia'
import api from '@/core/api/axios'
import type {
    CartEntry,
    CartItem,
    CartMeta,
    CartSummary,
    CheckoutState,
    ShopAddress,
    ShopDeliveryMethod,
    ShopPaymentMethod,
} from '@/composables/types/cart'

const ITEMS_KEY = 'cart_items'
const CHECKOUT_KEY = 'cart_checkout'

function loadEntries(): CartEntry[] {
    try {
        const raw = localStorage.getItem(ITEMS_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function loadCheckout(): CheckoutState {
    try {
        const raw = localStorage.getItem(CHECKOUT_KEY)
        return raw ? JSON.parse(raw) : defaultCheckout()
    } catch {
        return defaultCheckout()
    }
}

function defaultCheckout(): CheckoutState {
    return {
        cartId: null,
        selectedAddressId: null,
        selectedTransportMethodId: null,
        selectedPaymentMethodId: null,
        notes: '',
        currentStep: 1,
    }
}

function saveEntries(items: CartEntry[]) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

function saveCheckout(state: CheckoutState) {
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(state))
}

const _checkout = loadCheckout()

export const useCartStore = defineStore('cart', {
    state: () => ({
        // Lista wszystkich koszyków użytkownika
        carts: [] as CartMeta[],
        cartsLoading: false,

        // Aktywny koszyk + checkout
        entries: loadEntries() as CartEntry[],
        cartId: _checkout.cartId as number | null,
        selectedAddressId: _checkout.selectedAddressId as number | null,
        selectedTransportMethodId: _checkout.selectedTransportMethodId as number | null,
        selectedPaymentMethodId: _checkout.selectedPaymentMethodId as number | null,
        notes: _checkout.notes as string,
        currentStep: _checkout.currentStep as number,

        items: [] as CartItem[],
        summary: null as CartSummary | null,
        loading: false,
        error: null as string | null,

        addresses: [] as ShopAddress[],
        addressesLoading: false,

        deliveryMethods: [] as ShopDeliveryMethod[],
        deliveryLoading: false,

        paymentMethods: [] as ShopPaymentMethod[],
        paymentLoading: false,

        orderNumber: null as string | null,
        orderId: null as number | null,
        checkoutLoading: false,
        checkoutError: null as string | null,
    }),

    getters: {
        count: (state): number => state.entries.length,

        // count: (state): number =>
        //     state.entries.reduce((sum, e) => sum + e.quantity, 0),

        isEmpty: (state): boolean => state.entries.length === 0,

        isReadyToOrder: (state): boolean =>
            !!state.cartId &&
            !!state.selectedAddressId &&
            !!state.selectedTransportMethodId &&
            !!state.selectedPaymentMethodId,

        selectedAddress: (state): ShopAddress | null =>
            state.addresses.find(a => a.id === state.selectedAddressId) ?? null,

        selectedDelivery: (state): ShopDeliveryMethod | null =>
            state.deliveryMethods.find(d => d.id === state.selectedTransportMethodId) ?? null,

        selectedPayment: (state): ShopPaymentMethod | null =>
            state.paymentMethods.find(p => p.id === state.selectedPaymentMethodId) ?? null,

        activeCartMeta: (state): CartMeta | null =>
            state.carts.find(c => c.id === state.cartId) ?? null,

        hasInsufficientStock: (state): boolean =>
            state.items.some(item => {
                const entry = state.entries.find(e => e.product_id === item.id)
                const qty = entry?.quantity ?? item.quantity

                return item.stock_quantity < 1 || item.stock_quantity < qty
            }),
    },

    actions: {
        /**
         * Pobiera aktualnie aktywny koszyk użytkownika z API.
         *
         * API jest źródłem prawdy.
         * localStorage służy tylko jako cache.
         */
        async loadActiveCart(): Promise<void> {
            this.loading = true
            this.error = null

            try {
                const { data } = await api.get<{
                    cart_id: number
                    name: string | null
                    address_id: number | null
                    transport_method_id: number | null
                    payment_method_id: number | null
                    notes: string | null
                    delivery_date: string | null
                    items: CartItem[]
                    summary: CartSummary
                }>('/shop/cart')

                this.cartId = data.cart_id
                this.items = data.items
                this.summary = data.summary

                this.selectedAddressId = data.address_id
                this.selectedTransportMethodId = data.transport_method_id
                this.selectedPaymentMethodId = data.payment_method_id
                this.notes = data.notes ?? ''

                this.entries = data.items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                }))

                saveEntries(this.entries)
                this._persistCheckout()
            } catch (e: any) {
                console.error('loadActiveCart', e)
                this.error = 'Błąd ładowania koszyka'
            } finally {
                this.loading = false
            }
        },

        /**
         * Pobiera listę wszystkich aktywnych koszyków użytkownika.
         */
        async fetchCarts(): Promise<void> {
            this.cartsLoading = true

            try {
                const { data } = await api.get<CartMeta[]>('/shop/carts')
                this.carts = data
            } catch (e) {
                console.error('fetchCarts', e)
            } finally {
                this.cartsLoading = false
            }
        },

        /**
         * Tworzy nowy koszyk i ustawia go jako aktywny.
         */
        async createCart(name?: string): Promise<CartMeta | null> {
            try {
                const { data } = await api.post<CartMeta>(
                    '/shop/carts',
                    { name: name ?? null }
                )

                this.carts.unshift(data)

                // Nowy koszyk jest pusty – wyczyść poprzedni stan
                this.entries = []
                this.items = []
                this.summary = null
                saveEntries([])

                const co = defaultCheckout()

                this.selectedAddressId = co.selectedAddressId
                this.selectedTransportMethodId = co.selectedTransportMethodId
                this.selectedPaymentMethodId = co.selectedPaymentMethodId
                this.notes = co.notes
                this.currentStep = co.currentStep
                this.orderNumber = null
                this.orderId = null

                this.cartId = data.id
                this._persistCheckout()

                return data
            } catch (e) {
                console.error('createCart', e)
                return null
            }
        },

        /**
         * Przełącza aktywny koszyk i ładuje jego pozycje z API.
         *
         * TODO:
         * Docelowo tutaj dodatkowo zapisujemy active_cart_id
         * na użytkowniku przez endpoint /activate.
         */
        async selectCart(cartId: number): Promise<void> {
            try {
                await api.patch(`/shop/carts/${cartId}/activate`)

                // Reset stanu checkout przy zmianie koszyka
                const co = defaultCheckout()

                this.selectedAddressId = co.selectedAddressId
                this.selectedTransportMethodId = co.selectedTransportMethodId
                this.selectedPaymentMethodId = co.selectedPaymentMethodId
                this.notes = co.notes
                this.currentStep = co.currentStep
                this.orderNumber = null
                this.orderId = null

                // Wyczyść poprzedni stan
                this.items = []
                this.entries = []
                this.summary = null
                saveEntries([])

                this.cartId = cartId
                this._persistCheckout()

                // Pobierz aktualny stan wybranego koszyka
                await this.loadCartFromApi(cartId)
            } catch (e) {
                console.error('selectCart', e)
                this.error = 'Błąd wyboru koszyka'
            }
        },

        /**
         * Zmienia nazwę koszyka.
         */
        async renameCart(cartId: number, name: string): Promise<void> {
            await api.patch(`/shop/carts/${cartId}/name`, { name })

            const meta = this.carts.find(c => c.id === cartId)

            if (meta) {
                meta.name = name
            }
        },

        /**
         * Usuwa koszyk.
         * Jeśli był aktywny – resetuje lokalny stan.
         */
        async deleteCart(cartId: number): Promise<void> {
            await api.delete(`/shop/carts/${cartId}`)

            this.carts = this.carts.filter(c => c.id !== cartId)

            if (this.cartId === cartId) {
                this.clearCart()
            }
        },

        /**
         * Ładuje pozycje wskazanego koszyka z API
         * i aktualizuje lokalny state.
         */
        async loadCartFromApi(cartId: number): Promise<void> {
            this.loading = true
            this.error = null

            try {
                const { data } = await api.get<{
                    cart_id: number
                    name: string | null
                    items: CartItem[]
                    summary: CartSummary
                }>(`/shop/carts/${cartId}`)

                this.cartId = data.cart_id
                this.items = data.items
                this.summary = data.summary

                // Odbuduj lokalne entries na podstawie danych z serwera
                this.entries = data.items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                }))

                saveEntries(this.entries)
                this._persistCheckout()
            } catch (e: any) {
                this.error = 'Błąd ładowania koszyka'
                console.error('loadCartFromApi', e)
            } finally {
                this.loading = false
            }
        },

        addItem(product_id: number, quantity = 1, uom_id = 1) {
            if (uom_id) {
                // Zachowane dla kompatybilności
            }

            const existing = this.entries.find(
                e => e.product_id === product_id
            )

            if (existing) {
                existing.quantity += quantity
            } else {
                this.entries.push({
                    product_id,
                    quantity,
                })
            }

            saveEntries(this.entries)
        },

        removeItem(product_id: number) {
            this.entries = this.entries.filter(
                e => e.product_id !== product_id
            )

            saveEntries(this.entries)
        },

        async removeItemApi(product_id: number) {
            this.entries = this.entries.filter(
                e => e.product_id !== product_id
            )

            saveEntries(this.entries)

            this.items = this.items.filter(
                i => i.id !== product_id
            )

            if (this.cartId) {
                try {
                    await api.delete(
                        `/shop/carts/${this.cartId}/items/${product_id}`
                    )
                } catch (e) {
                    console.error(e)
                }
            }

            if (this.entries.length > 0) {
                await this.fetchCartItems()
            } else {
                this.summary = null
            }
        },

        updateQuantity(product_id: number, quantity: number) {
            const entry = this.entries.find(
                e => e.product_id === product_id
            )

            if (entry) {
                if (quantity <= 0) {
                    this.removeItem(product_id)
                } else {
                    entry.quantity = quantity
                    saveEntries(this.entries)
                }
            }
        },

        /**
         * Czyści lokalny stan koszyka.
         */
        clearCart() {
            this.entries = []
            this.items = []
            this.summary = null

            const co = defaultCheckout()

            this.cartId = co.cartId
            this.selectedAddressId = co.selectedAddressId
            this.selectedTransportMethodId = co.selectedTransportMethodId
            this.selectedPaymentMethodId = co.selectedPaymentMethodId
            this.notes = co.notes
            this.currentStep = co.currentStep

            this.orderNumber = null
            this.orderId = null

            saveEntries([])
            saveCheckout(co)
        },

        /**
         * Synchronizuje lokalne entries z API.
         *
         * Używane po zmianie pozycji koszyka.
         */
        async fetchCartItems() {
            if (this.entries.length === 0) {
                this.items = []
                this.summary = null
                return
            }

            // Brak lokalnego cartId.
            //
            // Na razie zachowujemy dotychczasowy fallback.
            // Po podpięciu loadActiveCart() przy inicjalizacji
            // normalny flow powinien już zawsze mieć cartId.
            if (!this.cartId) {
                await this.createCart()
            }

            if (!this.cartId) {
                return
            }

            this.loading = true
            this.error = null

            try {
                const { data } = await api.post<{
                    cart_id: number
                    items: CartItem[]
                    summary: CartSummary
                }>(
                    `/shop/carts/${this.cartId}/items`,
                    {
                        items: this.entries,
                    }
                )

                this.items = data.items
                this.summary = data.summary

                if (data.cart_id !== this.cartId) {
                    this.cartId = data.cart_id
                    this._persistCheckout()
                }

                // Odśwież listę koszyków
                this._refreshCartMeta(data.cart_id)
            } catch (e: any) {
                this.error = 'Błąd pobierania koszyka'
                console.error('fetchCartItems', e)
            } finally {
                this.loading = false
            }
        },

        async fetchAddresses() {
            this.addressesLoading = true

            try {
                const { data } = await api.get<ShopAddress[]>(
                    '/shop/cart/addresses'
                )

                this.addresses = data
            } finally {
                this.addressesLoading = false
            }
        },

        async fetchDeliveryMethods() {
            this.deliveryLoading = true

            try {
                const { data } = await api.get<ShopDeliveryMethod[]>(
                    '/shop/cart/delivery-methods'
                )

                this.deliveryMethods = data
            } finally {
                this.deliveryLoading = false
            }
        },

        async fetchPaymentMethods() {
            this.paymentLoading = true

            try {
                const { data } = await api.get<ShopPaymentMethod[]>(
                    '/shop/cart/payment-methods'
                )

                this.paymentMethods = data
            } finally {
                this.paymentLoading = false
            }
        },

        async selectAddress(addressId: number) {
            if (!this.cartId) {
                return
            }

            this.selectedAddressId = addressId
            this._persistCheckout()

            await api.patch(
                `/shop/cart/${this.cartId}/address`,
                {
                    address_id: addressId,
                }
            )
        },

        async selectDelivery(transportMethodId: number) {
            if (!this.cartId) {
                return
            }

            this.selectedTransportMethodId = transportMethodId
            this._persistCheckout()

            await api.patch(
                `/shop/cart/${this.cartId}/delivery`,
                {
                    transport_method_id: transportMethodId,
                }
            )
        },

        async selectPayment(paymentMethodId: number) {
            if (!this.cartId) {
                return
            }

            this.selectedPaymentMethodId = paymentMethodId
            this._persistCheckout()

            await api.patch(
                `/shop/cart/${this.cartId}/payment`,
                {
                    payment_method_id: paymentMethodId,
                }
            )
        },

        async saveNotes(notes: string) {
            if (!this.cartId) {
                return
            }

            this.notes = notes
            this._persistCheckout()

            await api.patch(
                `/shop/cart/${this.cartId}/notes`,
                {
                    notes,
                }
            )
        },

        async placeOrder() {
            if (!this.cartId) {
                return
            }

            this.checkoutLoading = true
            this.checkoutError = null

            try {
                const { data } = await api.post<{
                    order_id: number
                    number: string
                }>(
                    `/shop/cart/${this.cartId}/checkout`
                )

                this.orderNumber = data.number
                this.orderId = data.order_id

                // Usuń koszyk z listy
                this.carts = this.carts.filter(
                    c => c.id !== this.cartId
                )

                this.clearCart()
            } catch (e: any) {
                this.checkoutError =
                    e?.response?.data?.message ??
                    'Błąd składania zamówienia'
            } finally {
                this.checkoutLoading = false
            }
        },

        goToStep(step: number) {
            this.currentStep = step
            this._persistCheckout()
        },

        _persistCheckout() {
            saveCheckout({
                cartId: this.cartId,
                selectedAddressId: this.selectedAddressId,
                selectedTransportMethodId: this.selectedTransportMethodId,
                selectedPaymentMethodId: this.selectedPaymentMethodId,
                notes: this.notes,
                currentStep: this.currentStep,
            })
        },

        /**
         * Odświeża metadane konkretnego koszyka
         * na liście po syncu items.
         */
        _refreshCartMeta(cartId: number) {
            const meta = this.carts.find(
                c => c.id === cartId
            )

            if (!meta) {
                return
            }

            meta.items_count = this.entries.length

            // total_netto odświeżymy przy następnym fetchCarts()
        },
    },
})