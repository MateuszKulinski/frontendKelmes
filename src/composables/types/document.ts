export interface DocumentType {
    name: string;
    short_name: string;
}

export interface ProductUnit {
    id: number;
    name: string;
}

export interface ProductUrl {
    id: number;
    type: string;
    slug: string;
}

export interface Product {
    id: number;
    name: string;
    url?: ProductUrl;
    unit?: ProductUnit;
}

export interface DocumentPosition {
    id: number;
    name: string;
    quantity: number;
    price: string;
    price_tax: string;
    total_amount: string;
    total_amount_tax: string;
    product?: Product;
}

export interface Document {
    id: number;
    name: string;
    number: number;
    price: string;
    price_tax: string;
    outstanding_amount: string;
    date_add: string;
    date_payment: string;
    tracking_number: string;
    description: string;
    unit: string;
    document_type?: DocumentType;
    positions: DocumentPosition[];
}

export interface DocumentListItem {
    id: number;
    name: string;
    number: number;
    price: string;
    price_tax: string;
    outstanding_amount: string;
    date_add: string;
    date_payment: string;
    unit: string;
    document_type?: {
        name: string;
        short_name: string;
    };
}

export interface DocumentTypeOption {
    id: number;
    name: string;
    short_name: string;
}

export interface DocumentsResponse {
    data: DocumentListItem[];
    document_types: DocumentTypeOption[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}