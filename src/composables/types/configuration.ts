export interface ConfigurationOption {
    id: number | null;
    erp_id_defceny?: number;
    name: string;
}

export interface ConfigurationItem {
    id: number;
    name: string;
    value: string | number | null;
    options?: ConfigurationOption[];
}