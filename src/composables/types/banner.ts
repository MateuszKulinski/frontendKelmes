export interface Logo {
    logo: string | null;
    logo_dark: string | null;
}

export interface BannersByCategoryResponse {
    banners: Banner[];
    logo: Logo;
}

// Public
export interface Banner {
    id: number;
    image: string | null;
    mobile_image: string | null;
    link: string | null;
    target_blank: boolean;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    button_text: string | null;
}

// Admin
export interface BannerListItem {
    id: number;
    image: string | null;
    link: string | null;
    is_active: boolean;
    is_home: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    categories: number[];
    cms: number[];
    products: number[];
}

export interface BannerLang {
    lang_id: number;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    button_text: string | null;
}

export interface BannerLangForm {
    lang_id: number;
    title: string;
    subtitle: string;
    description: string;
    button_text: string;
}

export interface BannerDetail {
    id: number;
    image: string | null;
    image_file: string | null;
    mobile_image: string | null;
    mobile_image_file: string | null;
    link: string | null;
    target_blank: boolean;
    is_active: boolean;
    is_home: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    langs: BannerLang[];
    category_ids: number[];
    cms_ids: number[];
    product_ids: number[];
}

export interface BannersResponse {
    data: BannerListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface BannerFormState {
    link: string;
    target_blank: boolean;
    is_active: boolean;
    is_home: boolean;
    start_date: string;
    end_date: string;
    langs: BannerLangForm[];
    category_ids: number[];
    cms_ids: number[];
    product_ids: number[];
}
