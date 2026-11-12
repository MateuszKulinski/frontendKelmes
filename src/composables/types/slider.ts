export interface SliderLang {
    lang_id: number;
    title: string | null;
    content: string | null;
    link: string | null;
    button_text: string | null;
}

export interface SliderListItem {
    id: number;
    image: string | null;
    sort_order: number;
    category_id: number | null;
    is_active: boolean;
    created_at: string;
    title: string | null;
}

export interface SliderDetail {
    id: number;
    image: string | null;
    image_file: string | null;
    sort_order: number;
    category_id: number | null;
    is_active: boolean;
    created_at: string;
    langs: SliderLang[];
}

export interface SliderListResponse {
    data: SliderListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface SliderFormState {
    sort_order: number;
    category_id: number | null;
    is_active: boolean;
    langs: SliderLangForm[];
}

export interface SliderLangForm {
    lang_id: number;
    title: string;
    content: string;
    link: string;
    button_text: string;
}
