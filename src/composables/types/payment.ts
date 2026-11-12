export interface PaymentMethodItem {
    id: number;
    code: string;
    name: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    icon_url: string | null;
}

export interface PaymentMethodsResponse {
    data: PaymentMethodItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface Payment {
    id: number;
    code: string;
    name: string;
    is_active: boolean;
    sort_order: number;
    commission_percent: string;
    created_at: string;
    icon_url: string | null;

    langs: PaymentLang[];
    configs: PaymentConfig[];
}

export interface PaymentLang {
    id: number;
    lang_id: number;
    code: string;
    name: string;
}

export interface PaymentConfig {
    id: number;

    // 🔥 zamiast region_code
    country: PaymentCountry | null;

    currency: PaymentCurrency | null;

    account_number: string | null;
    iban: string | null;
    swift: string | null;
    bank_name: string | null;
    account_owner: string | null;
}

export interface PaymentCountry {
    id: number;
    code: string;
    name: string;
}

export interface PaymentCurrency {
    id: number;
    code: string;
    symbol: string;
}


// 🔥 payload do API (CREATE / UPDATE)
export interface PaymentPayload {
    name: string;
    code: string;
    is_active: boolean;
    sort_order: number;
    commission_percent: number;

    langs: {
        lang_id: number;
        name: string;
    }[];

    configs: {
        id?: number;

        // 🔥 zamiast region_code
        country_id: number | null;

        currency_id: number | null;

        account_number: string | null;
        iban: string | null;
        swift: string | null;
        bank_name: string | null;
        account_owner: string | null;
    }[];
}

export interface PaymentLangForm {
    lang_id: number;
    name: string;
    code: string;
}


export interface PaymentConfigForm {
    id?: number;
    country_id: number | null;
    currency_id: number | null;

    account_number: string;
    iban: string;
    swift: string;
    bank_name: string;
    account_owner: string;
};

export interface PaymentFormState {
    name: string;
    code: string;
    is_active: boolean;
    sort_order: number;
    commission_percent: number;

    langs: PaymentLangForm[];
    configs: PaymentConfigForm[];
};