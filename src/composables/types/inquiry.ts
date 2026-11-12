export interface InquiryItemProduct {
    id: number;

    name: string;

    url?: {
        id: number;
        type: string;
        slug: string;
    };

    unit?: {
        id: number;
        name: string;
    };
}

export interface InquiryItem {
    local_id: string;

    id: number | null;

    product_id: number;

    product: InquiryItemProduct;

    quantity: number;

    price: number;

    taxes_id?: number | null;

    notes: string;
}

export interface InquiryStatus {
    id: number;
    name: string;
    is_edit: boolean;
}

export interface InquiryUser {
    id: number;
    name: string;
    email: string;
}

export interface InquiryUnit {
    id: number;
    name: string;
}

export interface InquiryListItem {
    id: number;

    name: string;

    description: string;

    price: string;

    price_tax: string;

    created_at: string;
    updated_at: string;

    status: InquiryStatus;

    user: InquiryUser;

    unit: InquiryUnit;
}

export interface InquiryFilters {
    status_id: string;

    unit: string;

    user: string;
}

export interface InquiryStatusOption {
    id: number;
    name: string;
    is_edit: boolean;
}

export interface InquiriesResponse {
    data: InquiryListItem[];

    statuses?: InquiryStatusOption[];

    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface InquiryPosition {
    id: number;

    notes: string;

    quantity: number;

    price: string;

    price_tax: string;

    total_amount: string;

    total_amount_tax: string;

    product: InquiryItemProduct;
}

export interface InquiryDetails {
    id: number;

    name: string;

    description: string;

    price: string;

    price_tax: string;

    created_at: string;

    updated_at: string;

    status: InquiryStatus;

    user: InquiryUser;

    unit: InquiryUnit;

    positions: InquiryPosition[];
}

export interface InquiryDetailsResponse {
    data: InquiryDetails;
}

export interface InquirySubmitItem {
    id: number | null;

    product_id: number;

    quantity: number;

    price: number;

    notes: string | null;
}

export interface InquirySubmitPayload {
    name: string;

    description: string;

    action: "draft" | "send";

    items: InquirySubmitItem[];
}

export interface InquiryFormExpose {
    setBackendErrors: (
        errors: Record<string, string[]>
    ) => void;

    setFormData: (
        data: InquiryDetails
    ) => void;
}

export interface InquirySaveResponse {
    success: boolean;
    id: number;
}