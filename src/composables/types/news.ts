export interface NewsListCategory {
    id: number;
    title: string;
    slug: string | null;
}

export interface NewsListItem {
    id: number;
    news_category_id: number;
    category: NewsListCategory | null;

    title: string;
    slug: string | null;

    is_active: boolean;
    publish_date: string | null;

    created_at: string;
    updated_at: string;
}

export interface NewsResponse {
    data: NewsListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}