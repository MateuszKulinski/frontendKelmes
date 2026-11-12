export interface PromotionListItem {
    id: number;
    description: string;
    date_from: string | null;
    date_to: string | null;
    type: string;
    value_type: string;
    percentage: number;
    quantity_from: number;
    value_from: string;
    active: boolean;
}

export interface PromotionsResponse {
    contracts: PromotionListItem[];

    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };

    context: {
        unit_id: number;
        contractor_id: number;
    };
}
export interface PromotionProductData {
    id: number;
    name: string;
    indeks: string | null;
    catalog_number: string | null;
    ean: string | null;
    url: string
}

export interface PromotionProduct {
    id: number;
    product: PromotionProductData;
    source: unknown | null;
    promotion: unknown | null;
}

export interface Promotion {
    id: number;
    description: string;
    date_from: string | null;
    date_to: string | null;
    type: string;
    value_type: string;
    percentage: number;
    active: boolean;
    products: PromotionProduct[];
}

export interface PromotionViewResponse {
    promotion: Promotion;

    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}