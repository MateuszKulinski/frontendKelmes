import { defineStore } from "pinia";
import api from "@/core/api/axios";
import { useAuthStore } from "./authStore";
import type { UrlObject } from "@/composables/useUrlResolver";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/
export interface CreateAddressPayload {
  cart_id: number | null;
  country_id: number;

  firstname: string;
  lastname: string;
  phone: string;
  email: string;

  company?: string;
  vat_number?: string;

  postcode: string;
  city: string;
  street: string;
  house_number: string;
  apartment?: string;

  save_to_address_book: boolean;
}

export interface CartProduct {
  product_id: number;
  indeks: string;
  name: string;
  catalog_number: string;
  quantity: number;
  tax_rate: number;
  price: string;
  total_price: string;
  delivery_date: string;
  total_price_gross: string;
  is_made_to_order: boolean;
  stock_quantity: number;
  url: UrlObject;
  image: string | null;
  limit: boolean;
  isInsufficient: boolean;
  can_order: boolean;
  stock_status: boolean;
  delivery_text: string;
}

export interface CartLimit {
  id: number;
  name: string;
  limit_type: number;
  quantity_limit: number | null;
  price_limit: number | null;
  used_quantity: number;
  used_amount: number;
  is_tax: boolean;
  is_exceedable: boolean;
  is_exceeded: boolean;
  blocks_checkout: boolean;
  used_quantity_formatted: string;
  quantity_limit_formatted: string | null;
  used_amount_formatted: string;
  price_limit_formatted: string | null;
}

export interface Cart {
  id: number;
  user_id: number | null;
  unit_id: number | null;
  name: string | null;
  is_active: boolean;
  address_id: number | null;
  payment_method_id: number | null;
  transport_method_id: number | null;
  default_payment_id?: number | null;
  default_delivery_id?: number | null;
  transport_method_range_id: number | null;
  center_cost_id: number | null;
  transport_price: number | null;
  notes: string | null;
  contact_person: string | null;
  customer_own_order_number: string | null;
  delivery_date: string | null;
  items_count?: number;
  split_delivery: boolean;
  items: CartProduct[];
  limits: CartLimit[];
  can_checkout: boolean;
  blocking_limits: Array<{ id: number; name: string }>;
  summary: {
    products_net_total: string;
    products_gross_total: string;
    net_total: string;
    gross_total: string;
  };
  free_delivery?: {
    threshold: number | null;
    remaining: number | null;
    remaining_formatted: string | null;
    achieved: boolean;
    always_free: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CartMeta {
  id: number;
  name: string | null;
  unit_id: number | null;
  is_active: boolean;
  items_count?: number;
}

export type CartImportMode = "append" | "replace" | "new";

export interface CartImportResult {
  cart: Cart | null;
  imported_count: number;
  total_count: number;
  skipped_count: number;
  skipped_items: {
    catalog_number: string;
    reason: "not_found" | "ambiguous" | "stock_exceeded" | "unavailable";
  }[];
}

export interface DeliveryMethod {
  id: number;
  description: string;
  instructions: string;
  name: string;
  price: number;
  range_id: number;
  icon_url: string | null;
}

export interface PaymentMethod {
  id: number;
  name: string | null;
  icon_url: string | null;
}
export interface CenterCost {
  id: number;
  name: string;
}

export interface CheckoutUnit {
  id: number;
  name: string | null;
  number: string | null;
}

export interface BillingAddress {
  company: string | null;
  vat_number: string | null;
  country: string | null;
  postcode: string | null;
  city: string | null;
  street: string | null;
  house_number: string | null;
  apartment: string | null;
}
/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/

export const useCartStore = defineStore("cart", {
  state: () => ({
    /*
        |--------------------------------------------------------------------------
        | CART
        |--------------------------------------------------------------------------
        */

    cart: null as Cart | null,

    carts: [] as Cart[],

    loading: false,
    cartsLoading: false,

    error: null as string | null,

    /*
        |--------------------------------------------------------------------------
        | CHECKOUT DATA
        |--------------------------------------------------------------------------
        */

    addresses: [] as any[],
    addressesLoading: false,

    deliveryMethods: [] as DeliveryMethod[],
    deliveryLoading: false,

    paymentMethods: [] as PaymentMethod[],
    paymentLoading: false,

    centerCosts: [] as CenterCost[],
    centerCostsLoading: false,
    unit: null as CheckoutUnit | null,
    billingAddress: null as BillingAddress | null,
    checkoutDataLoading: false,

    /*
        |--------------------------------------------------------------------------
        | CHECKOUT UI
        |--------------------------------------------------------------------------
        */

    currentStep: 1,

    /*
        |--------------------------------------------------------------------------
        | ORDER
        |--------------------------------------------------------------------------
        */

    checkoutLoading: false,
    checkoutError: null as string | null,

    orderNumber: null as string | null,
    orderId: null as number | null,
  }),

  /*
    |--------------------------------------------------------------------------
    | GETTERS
    |--------------------------------------------------------------------------
    */

  getters: {
    cartBaseUrl(): string {
      const auth = useAuthStore();

      return auth.isLogged ? "/shop/cart" : "/shop_guest/cart";
    },
    /*
        |--------------------------------------------------------------------------
        | ACTIVE CART
        |--------------------------------------------------------------------------
        */

    activeCart: (state): Cart | null => {
      return state.cart;
    },

    cartId: (state): number | null => {
      return state.cart?.id ?? null;
    },

    /*
        |--------------------------------------------------------------------------
        | ITEMS
        |--------------------------------------------------------------------------
        */

    items: (state): CartProduct[] => {
      return state.cart?.items ?? [];
    },

    count: (state): number | null => {
      if (!state.cart) {
        return null;
      }

      return state.cart.items?.length ?? 0;
    },

    isEmpty: (state): boolean => {
      return !state.cart || state.cart.items.length === 0;
    },

    /*
        |--------------------------------------------------------------------------
        | SUMMARY
        |--------------------------------------------------------------------------
        */

    summary: (state) => {
      return state.cart?.summary ?? null;
    },

    /*
        |--------------------------------------------------------------------------
        | SELECTED IDS
        |--------------------------------------------------------------------------
        */

    selectedAddressId: (state): number | null => {
      return state.cart?.address_id ?? null;
    },
    costCenterId: (state): number | null => {
      return state.cart?.center_cost_id ?? null;
    },
    selectedTransportMethodId: (state): number | null => {
      return state.cart?.transport_method_id ?? null;
    },

    selectedPaymentMethodId: (state): number | null => {
      return state.cart?.payment_method_id ?? null;
    },

    /*
        |--------------------------------------------------------------------------
        | SELECTED OBJECTS
        |--------------------------------------------------------------------------
        | Kompatybilność ze starym ShopCart.vue.
        */

    selectedAddress: (state): any | null => {
      const id = state.cart?.address_id;

      if (!id) {
        return null;
      }

      return state.addresses.find((address) => address.id === id) ?? null;
    },

    selectedDelivery: (state): any | null => {
      const id = state.cart?.transport_method_id;

      if (!id) {
        return null;
      }

      return (
        state.deliveryMethods.find((delivery) => delivery.id === id) ?? null
      );
    },

    selectedPayment: (state): any | null => {
      const id = state.cart?.payment_method_id;

      if (!id) {
        return null;
      }

      return state.paymentMethods.find((payment) => payment.id === id) ?? null;
    },

    selectedCenterCost: (state): any | null => {
      const id = state.cart?.center_cost_id;

      if (!id) {
        return null;
      }

      return (
        state.centerCosts.find((centerCost) => centerCost.id === id) ?? null
      );
    },

    /*
        |--------------------------------------------------------------------------
        | NOTES
        |--------------------------------------------------------------------------
        */

    notes: (state): string => {
      return state.cart?.notes ?? "";
    },
    contactPerson: (state): string => {
      return state.cart?.contact_person ?? "";
    },
    customerOwnOrderNumber: (state): string => {
      return state.cart?.customer_own_order_number ?? "";
    },
    deliveryDate: (state): string => {
      console.log(state.cart?.delivery_date);
      return state.cart?.delivery_date ?? "";
    },

    /*
        |--------------------------------------------------------------------------
        | READY TO ORDER
        |--------------------------------------------------------------------------
        */

    isReadyToOrder: (state): boolean => {
      if (!state.cart) {
        return false;
      }

      return (
        !!state.cart.address_id &&
        !!state.cart.transport_method_id &&
        !!state.cart.payment_method_id &&
        state.cart.items.length > 0
      );
    },

    /*
        |--------------------------------------------------------------------------
        | ACTIVE CART META
        |--------------------------------------------------------------------------
        */

    activeCartMeta: (state): Cart | null => {
      const cartId = state.cart?.id;

      if (!cartId) {
        return null;
      }

      return state.carts.find((cart) => cart.id === cartId) ?? null;
    },
  },

  /*
    |--------------------------------------------------------------------------
    | ACTIONS
    |--------------------------------------------------------------------------
    */

  actions: {
    async importFile(
      file: File,
      mode: CartImportMode,
    ): Promise<CartImportResult> {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", mode);
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.post<CartImportResult>(
          `${this.cartBaseUrl}/import`,
          form,
        );
        this.cart = data.cart;
        if (data.imported_count > 0) {
          this.currentStep = 1;
          this.orderNumber = null;
          this.orderId = null;

          if (useAuthStore().isLogged) {
            await this.fetchCarts();
          }
        }

        return data;
      } finally {
        this.loading = false;
      }
    },

    async downloadCartFile(
      format: "csv" | "xml",
      template = false,
    ): Promise<void> {
      const url = template
        ? `${this.cartBaseUrl}/template`
        : `${this.cartBaseUrl}/export`;
      const { data } = await api.get<Blob>(url, {
        params: { format },
        responseType: "blob",
      });
      const objectUrl = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${template ? "szablon-koszyka" : "koszyk"}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    },

    /*
        |--------------------------------------------------------------------------
        | ACTIVE CART
        |--------------------------------------------------------------------------
        */

    async clearCart(): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.delete<{
          cart: Cart;
        }>(`${this.cartBaseUrl}/items`);

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("clearCart", error);

        this.error = "Błąd opróżniania koszyka";

        return null;
      } finally {
        this.loading = false;
      }
    },

    async loadActiveCart(): Promise<Cart | null> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.get<{
          cart: Cart | null;
        }>(this.cartBaseUrl);

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("loadActiveCart", error);

        this.error = "Błąd ładowania koszyka";

        return null;
      } finally {
        this.loading = false;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | USER CARTS
        |--------------------------------------------------------------------------
        */

    async fetchCarts(): Promise<void> {
      this.cartsLoading = true;

      try {
        const { data } = await api.get<Cart[]>("/shop/carts");

        this.carts = data;
      } catch (error) {
        console.error("fetchCarts", error);
      } finally {
        this.cartsLoading = false;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | CREATE CART
        |--------------------------------------------------------------------------
        */

    async createCart(name?: string): Promise<Cart | null> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.post<{
          cart: Cart;
        }>("/shop/carts", {
          name: name ?? null,
        });

        this.cart = data.cart;

        this.currentStep = 1;

        this.orderNumber = null;
        this.orderId = null;

        await this.fetchCarts();

        return this.cart;
      } catch (error) {
        console.error("createCart", error);

        this.error = "Błąd tworzenia koszyka";

        return null;
      } finally {
        this.loading = false;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | SELECT CART
        |--------------------------------------------------------------------------
        */

    async selectCart(cartId: number): Promise<Cart | null> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.post<{
          cart: Cart;
        }>(`/shop/carts/${cartId}/activate`);

        this.cart = data.cart;

        this.currentStep = 1;

        this.orderNumber = null;
        this.orderId = null;

        await this.fetchCarts();

        return this.cart;
      } catch (error) {
        console.error("selectCart", error);

        this.error = "Błąd wyboru koszyka";

        return null;
      } finally {
        this.loading = false;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | RENAME CART
        |--------------------------------------------------------------------------
        */

    async renameCart(cartId: number, name: string): Promise<Cart | null> {
      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/carts/${cartId}/name`, {
          name,
        });

        if (this.cart?.id === cartId) {
          this.cart = data.cart;
        }

        await this.fetchCarts();

        return data.cart;
      } catch (error) {
        console.error("renameCart", error);

        this.error = "Błąd zmiany nazwy koszyka";

        return null;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | DELETE CART
        |--------------------------------------------------------------------------
        */

    async deleteCart(cartId: number): Promise<Cart | null> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.delete<{
          cart: Cart | null;
        }>(`/shop/carts/${cartId}`);

        this.cart = data.cart;

        this.currentStep = 1;

        this.orderNumber = null;
        this.orderId = null;

        await this.fetchCarts();

        return this.cart;
      } catch (error) {
        console.error("deleteCart", error);

        this.error = "Błąd usuwania koszyka";

        return null;
      } finally {
        this.loading = false;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | ITEMS
        |--------------------------------------------------------------------------
        */
    async addItem(
      productId: number,
      quantity = 1,
      uom_id = 1,
    ): Promise<Cart | null> {
      this.loading = true;
      this.error = null;
      if (uom_id) {
      }

      try {
        const { data } = await api.post<{
          cart: Cart;
        }>(`${this.cartBaseUrl}/items`, {
          product_id: productId,
          quantity,
        });

        this.cart = data.cart;
        return this.cart;
      } catch (error: any) {
        console.error("addItem", error);

        const message = error?.response?.data?.message;

        this.error = message ?? "cart.add_error";

        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateQuantity(
      productId: number,
      quantity: number,
    ): Promise<Cart | null> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`${this.cartBaseUrl}/items/${productId}`, {
          quantity,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("updateQuantity", error);

        this.error = "Błąd zmiany ilości";

        return null;
      } finally {
        this.loading = false;
      }
    },

    async removeItem(productId: number): Promise<Cart | null> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.delete<{
          cart: Cart;
        }>(`${this.cartBaseUrl}/items/${productId}`);

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("removeItem", error);

        this.error = "Błąd usuwania produktu";

        return null;
      } finally {
        this.loading = false;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | ADDITIONAL ITEM ALIASES
        |--------------------------------------------------------------------------
        | Przydatne, jeśli inne komponenty korzystały ze starego API.
        */

    async removeItemApi(productId: number): Promise<Cart | null> {
      return this.removeItem(productId);
    },

    /*
        |--------------------------------------------------------------------------
        | CHECKOUT DATA
        |--------------------------------------------------------------------------
        */

    async fetchAddresses(): Promise<void> {
      this.addressesLoading = true;

      try {
        const { data } = await api.get<any[]>("/shop/cart/addresses", {
          params: {
            cart_id: this.cartId,
          },
        });

        this.addresses = data;
      } catch (error) {
        console.error("fetchAddresses", error);
      } finally {
        this.addressesLoading = false;
      }
    },

    async createAddress(payload: CreateAddressPayload): Promise<any> {
      const response = await api.post("/shop/cart/addresses", payload);

      return response.data;
    },

    async updateAddressData(payload: CreateAddressPayload): Promise<any> {
      const response = await api.patch(
        `/shop/cart/${this.cartId}/addressData`,
        payload,
      );

      return response.data;
    },

    async fetchCenterCosts(): Promise<void> {
      await this.fetchCheckoutData();
    },

    async fetchCheckoutData(): Promise<void> {
      this.checkoutDataLoading = true;
      this.centerCostsLoading = true;
      try {
        const { data } = await api.get<{
          center_costs: CenterCost[];
          unit: CheckoutUnit | null;
          billing_address: BillingAddress | null;
        }>("/shop/cart/checkout-data");

        this.centerCosts = data.center_costs;
        this.unit = data.unit;
        this.billingAddress = data.billing_address;
      } catch (error) {
        console.error("fetchCheckoutData", error);
      } finally {
        this.checkoutDataLoading = false;
        this.centerCostsLoading = false;
      }
    },

    async fetchDeliveryMethods(): Promise<void> {
      this.deliveryLoading = true;

      try {
        const { data } = await api.get<any[]>("/shop/cart/delivery-methods");

        this.deliveryMethods = data;
        const defaultId = this.cart?.default_delivery_id;
        if (
          !this.cart?.transport_method_id &&
          defaultId &&
          this.deliveryMethods.some((method) => method.id === defaultId)
        ) {
          await this.selectDelivery(defaultId);
        }
      } catch (error) {
        console.error("fetchDeliveryMethods", error);
      } finally {
        this.deliveryLoading = false;
      }
    },

    async fetchPaymentMethods(): Promise<void> {
      this.paymentLoading = true;

      try {
        const { data } = await api.get<any[]>("/shop/cart/payment-methods");

        this.paymentMethods = data;
        const defaultId = this.cart?.default_payment_id;
        if (
          !this.cart?.payment_method_id &&
          defaultId &&
          this.paymentMethods.some((method) => method.id === defaultId)
        ) {
          await this.selectPayment(defaultId);
        }
      } catch (error) {
        console.error("fetchPaymentMethods", error);
      } finally {
        this.paymentLoading = false;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | SELECT ADDRESS
        |--------------------------------------------------------------------------
        */

    async selectAddress(addressId: number): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/address`, {
          address_id: addressId,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("selectAddress", error);

        this.error = "Błąd wyboru adresu";

        return null;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | SELECT DELIVERY
        |--------------------------------------------------------------------------
        */

    async selectCostCenter(costCenterId: number): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/centerCost`, {
          center_cost_id: costCenterId,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("selectCostCenter", error);

        this.error = "Błąd wyboru centra kosztów";

        return null;
      }
    },

    async selectDelivery(transportMethodId: number): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/delivery`, {
          transport_method_id: transportMethodId,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("selectDelivery", error);

        this.error = "Błąd wyboru dostawy";

        return null;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | SELECT PAYMENT
        |--------------------------------------------------------------------------
        */

    async selectPayment(paymentMethodId: number): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/payment`, {
          payment_method_id: paymentMethodId,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("selectPayment", error);

        this.error = "Błąd wyboru płatności";

        return null;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | NOTES
        |--------------------------------------------------------------------------
        */

    async saveNotes(notes: string): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/notes`, {
          notes,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("saveNotes", error);

        this.error = "Błąd zapisu notatek";

        return null;
      }
    },

    async saveContactPerson(contact_person: string): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/contact_person`, {
          contact_person,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("saveContactPerson", error);

        this.error = "Błąd osoby kontaktowej";

        return null;
      }
    },

    async saveCustomerOwnOrderNumber(
      customer_own_order_number: string,
    ): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/customer_own_order_number`, {
          customer_own_order_number,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("saveCustomerOwnOrderNumber", error);

        this.error = "Błąd numeru zamówienia";

        return null;
      }
    },
    async saveDeliveryDate(delivery_date: string): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/delivery_date`, {
          delivery_date,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("saveDeliveryDate", error);

        this.error = "Błąd zapisu notatek";

        return null;
      }
    },
    async updateSplitDelivery(split_delivery: boolean): Promise<Cart | null> {
      if (!this.cart) {
        return null;
      }

      try {
        const { data } = await api.patch<{
          cart: Cart;
        }>(`/shop/cart/${this.cart.id}/split_delivery`, {
          split_delivery,
        });

        this.cart = data.cart;

        return this.cart;
      } catch (error) {
        console.error("saveDeliveryDate", error);

        this.error = "Błąd zapisu notatek";

        return null;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | CHECKOUT
        |--------------------------------------------------------------------------
        */

    async placeOrder(): Promise<{
      orderId: number;
      orderNumber: string;
    } | null> {
      if (!this.cart || this.cart.can_checkout === false) {
        return null;
      }

      this.checkoutLoading = true;
      this.checkoutError = null;

      try {
        const { data } = await api.post<{
          order_id: number;
          number: string;
        }>(`/shop/cart/${this.cart.id}/checkout`);

        this.orderId = data.order_id;
        this.orderNumber = data.number;

        return {
          orderId: data.order_id,
          orderNumber: data.number,
        };
      } catch (error: any) {
        console.error("placeOrder", error);

        this.checkoutError =
          error?.response?.data?.message ?? "Błąd składania zamówienia";

        return null;
      } finally {
        this.checkoutLoading = false;
      }
    },

    /*
        |--------------------------------------------------------------------------
        | STEPS
        |--------------------------------------------------------------------------
        | Kompatybilność ze starym ShopCart.vue.
        |--------------------------------------------------------------------------
        */

    goToStep(step: number): void {
      this.currentStep = step;
    },

    /*
        |--------------------------------------------------------------------------
        | RESET
        |--------------------------------------------------------------------------
        */

    clearLocalState(): void {
      this.cart = null;
      this.carts = [];

      this.addresses = [];
      this.deliveryMethods = [];
      this.paymentMethods = [];

      this.currentStep = 1;

      this.error = null;
      this.checkoutError = null;

      this.orderNumber = null;
      this.orderId = null;
    },
  },
});
