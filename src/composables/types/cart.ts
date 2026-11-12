/*
|--------------------------------------------------------------------------
| Cart list
|--------------------------------------------------------------------------
*/

export interface CartMeta {
    id: number
    name: string | null
    user_id?: number | null
    unit_id?: number | null
    is_active?: boolean
    items_count: number
    net_total?: string | null
    created_at?: string
    updated_at?: string
}

/*
|--------------------------------------------------------------------------
| Cart item
|--------------------------------------------------------------------------
*/

export interface CartProduct {
    id: number
}

export interface CartItem {
    id: number
    quantity: number
    price: string
    total_price: string
    indeks: string | null
    product: CartProduct
}

/*
|--------------------------------------------------------------------------
| Cart summary
|--------------------------------------------------------------------------
*/

export interface CartSummary {
    net_total: string
}

/*
|--------------------------------------------------------------------------
| Full shop cart
|--------------------------------------------------------------------------
*/

export interface ShopCart {
    id: number
    user_id: number | null
    unit_id: number | null

    name: string | null
    is_active: boolean

    address_id: number | null
    payment_method_id: number | null
    transport_method_id: number | null
    transport_method_range_id: number | null
    transport_price: number | null

    notes: string | null
    delivery_date: string | null

    items_count: number
    items: CartItem[]

    summary: CartSummary

    created_at: string
    updated_at: string
}

/*
|--------------------------------------------------------------------------
| Guest / user cart response
|--------------------------------------------------------------------------
*/

export interface ShopCartResponse {
    cart: ShopCart | null
}

/*
|--------------------------------------------------------------------------
| Cart mutations
|--------------------------------------------------------------------------
*/

export interface AddCartItemRequest {
    product_id: number
    quantity: number
}

export interface UpdateCartItemRequest {
    quantity: number
}

/*
|--------------------------------------------------------------------------
| Checkout
|--------------------------------------------------------------------------
*/

export interface ShopAddress {
    id: number
    alias: string | null
    is_main: boolean
    company: string | null
    firstname: string | null
    lastname: string | null
    phone: string | null
    email: string | null
    country: string | null
    street: string | null
    house_number: string | null
    apartment: string | null
    city: string | null
    postcode: string | null
}



export interface ShopDeliveryMethod {
    id: number
    name: string | null
    description: string | null
    instructions: string | null
    price: number
    range_id: number
}

export interface ShopPaymentMethod {
    id: number
    name: string | null
}

/*
|--------------------------------------------------------------------------
| Checkout state
|--------------------------------------------------------------------------
*/

export interface CheckoutState {
    cartId: number | null
    selectedAddressId: number | null
    selectedTransportMethodId: number | null
    selectedPaymentMethodId: number | null
    notes: string
    currentStep: number
}

export interface CartListItem {
    id: number;
    unit: string;
    user: string;
    payment_method: string;
    transport_method: string;
    created_at: string;
}

export interface SelectOption {
    id: number;
    name: string;
}

export interface CartFilters {
    unit: string;
    user: string;
    payment_method_id: string;
    transport_method_id: string;
    date_from: string;
    date_to: string;
}

export interface CartResponse {
    data: CartListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    payment_methods: SelectOption[];
    transport_methods: SelectOption[];
}