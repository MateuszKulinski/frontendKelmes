export interface UnitListItem {
    id: number;
    name: string;
    number: string;
    is_active: boolean;
    logistics_min: string;
    merchant_limit: string;
    receivables: string;
    overdue_receivables: string;
}

export interface UnitFilters {
    name: string;
    number: string;
    is_active: "" | 0 | 1;
}

export interface UnitsResponse {
    data: UnitListItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}