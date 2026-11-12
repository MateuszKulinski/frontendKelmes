export interface OrderListItem {
    id: number;
    number: string | number;
    unit: string;
    user: string;
    status: string;
    price: string;
    price_tax: string;
    payment_method: string;
    transport_method: string;
    created_at: string;
}

export interface SelectOption {
    id: number;
    name: string;
}

export interface OrderFilters {
    unit: string;
    user: string;
    payment_method_id: string;
    transport_method_id: string;
    status_id: string;
    price_from: string;
    price_to: string;
    price_tax_from: string;
    price_tax_to: string;
    date_from: string;
    date_to: string;
}

export interface OrdersResponse {
    data: OrderListItem[];
    payment_methods: SelectOption[];
    transport_methods: SelectOption[];
    order_statuses: SelectOption[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}