export interface UserUnit {
    id: number;
    name: string;
}

export interface UserPermission {
    id: number;
    display_name: string;
    permission_name: string;
}

export interface UserListItem {
    id: number;
    name: string;
    email: string;
    firstname: string;
    lastname: string;
    unit_id: number;
    permission_id: number;
    is_active: boolean;
    unit?: UserUnit;
    permission?: UserPermission;
}

export interface PermissionOption {
    id: number;
    display_name: string;
}

export interface UserFilters {
    email: string;
    firstname: string;
    lastname: string;
    unit: string;
    permission_id: string;
    is_active: "" | number;
}

export interface UsersResponse {
    data: UserListItem[];
    permissions: PermissionOption[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}