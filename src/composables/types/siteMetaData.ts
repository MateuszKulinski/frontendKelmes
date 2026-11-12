export interface SiteMetaDataTranslation {
    lang_id: number;
    code: string | null;
    language_name: string | null;
    meta_title: string | null;
    meta_description: string | null;
}

export interface PublicSiteMetaData {
    name: string;
    lang_id: number;
    meta_title: string | null;
    meta_description: string | null;
}

export interface SiteMetaDataRecord {
    id: number;
    name: string;
    langs: SiteMetaDataTranslation[];
    updated_at: string | null;
}

export interface SiteMetaDataPayload {
    name?: string;
    langs: {
        lang_id: number;
        meta_title: string | null;
        meta_description: string | null;
    }[];
}

export interface SiteMetaDataPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SiteMetaDataListResponse {
    data: SiteMetaDataRecord[];
    meta: SiteMetaDataPagination;
}
