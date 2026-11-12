export interface NewsCategoryListItem {
    id: number;
    is_active: boolean;
    title: string;
    slug: string | null;
    created_at: string;
    updated_at: string;
}

export interface NewsCategoryFilters {
    is_active: "" | 0 | 1;
}

export interface NewsCategoriesResponse {
    data: NewsCategoryListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface NewsCategoryLang {
    lang_id: number;
    title: string;
    slug: string;
    short_description: string;
    image: string | null;
}

export interface NewsCategoryDetail {
    id: number;
    is_active: boolean;
    langs: NewsCategoryLang[];
}

export interface NewsCategoryFormLang {
    lang_id: number;
    title: string;
    slug: string;
    short_description: string;
    image: File | null;
}

export interface NewsCategoryPayload {
    is_active: number;
    langs: NewsCategoryFormLang[];
}