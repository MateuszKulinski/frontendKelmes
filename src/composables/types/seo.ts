export type SeoEntityType = 'product' | 'category';
export type SeoStatus = 'all' | 'missing' | 'complete';

export interface SeoRecord {
    id: number;
    type: SeoEntityType;
    lang_id: number;
    name: string | null;
    description_short: string | null;
    meta_title: string | null;
    meta_description: string | null;
    is_active: boolean;
    identifier: string | null;
    updated_at: string | null;
}

export interface SeoUpdatePayload {
    meta_title: string | null;
    meta_description: string | null;
}

export interface SeoPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SeoListResponse {
    data: SeoRecord[];
    meta: SeoPagination;
}
