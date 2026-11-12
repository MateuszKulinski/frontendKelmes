export interface DeliveryMethodLang {
    lang_id: number;
    name: string;
    code?: string | null;
    description?: string | null;
    instructions?: string | null;
}

export interface DeliveryFormLang {
    lang_id: number;
    name: string;
    code?: string | null;
    description: string;
    instructions: string;
}

export interface DeliveryFormRange {
    id?: number;
    min_weight: number;
    max_weight: number;
    currency_id: number | null;
    max_volume: number;
    price: number;
    sort_order?: number | null;
}

export interface DeliveryMethodRange {
    id: number;
    min_weight: number | null;
    max_weight: number | null;
    currency_id: number;
    max_volume: number;
    price: number;
    sort_order?: number | null;
}

export interface DeliveryMethodBase {
    name: string;
    code: string;
    is_active: boolean;
    sort_order: number;
    free_delivery_from: number;
}

export interface Delivery extends DeliveryMethodBase {
    id: number;
    created_at: string;
    icon_url: string | null;
    langs: DeliveryMethodLang[];
    ranges: DeliveryMethodRange[];
}

export type DeliveryFormState = DeliveryMethodBase & {
    langs: DeliveryFormLang[];
    ranges: DeliveryFormRange[];
};

export type DeliveryPayload = DeliveryFormState;

export type DeliveryMethodItem = Pick<
    Delivery,
    "id" | "code" | "name" | "is_active" | "sort_order" | "created_at" | "icon_url"
>;

export interface DeliveryMethodsResponse {
    data: DeliveryMethodItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}