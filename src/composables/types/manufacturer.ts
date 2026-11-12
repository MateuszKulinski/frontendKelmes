// ─── Admin ─────────────────────────────────────────────────────────────────

export interface ManufacturerLang {
    lang_id: number;
    description: string | null;
}

export interface ManufacturerListItem {
    id: number;
    erp_id_producent: number;
    name: string | null;
    website: string | null;
    is_active: boolean;
    is_on_page: boolean;
    updating?: boolean;
    has_logo: boolean;
    logo_url: string | null;
    created_at: string;
}

export interface ManufacturerDetail {
    id: number;
    erp_id_producent: number;
    name: string | null;
    website: string | null;
    is_active: boolean;
    is_on_page: boolean;
    has_logo: boolean;
    logo_url: string | null;
    created_at: string;
    langs: ManufacturerLang[];
}

export interface ManufacturerListResponse {
    data: ManufacturerListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface ManufacturerFormState {
    erp_id_producent: number | null;
    name: string;
    website: string;
    is_active: boolean;
    langs: ManufacturerLangForm[];
}

export interface ManufacturerLangForm {
    lang_id: number;
    description: string;
}
