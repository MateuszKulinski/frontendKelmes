// ─── Public ────────────────────────────────────────────────────────────────

export interface CmsPage {
    id: number;
    type: string;
    title: string | null;
    content: string | null;
    slug: string | null;
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export interface CmsLang {
    lang_id: number;
    title: string | null;
    slug: string | null;
}

export interface CmsLangDetail extends CmsLang {
    content: string | null;
}

export interface CmsLangForm {
    lang_id: number;
    title: string;
    content: string;
    slug: string;
}

export interface CmsListItem {
    id: number;
    is_active: boolean;
    created_at: string;
    langs: CmsLang[];
}

export interface CmsDetail {
    id: number;
    is_active: boolean;
    created_at: string;
    langs: CmsLangDetail[];
}

export interface CmsListResponse {
    data: CmsListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface CmsFormState {
    is_active: boolean;
    langs: CmsLangForm[];
}
