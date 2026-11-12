export interface OfferCompany {
    id: number;
    name: string;
    city: string;
    address: string;
    authorized_person: string;
    created_by: {
        fullname: string | null;
    };
}

export interface OfferCompanyFilters {
    city: string;
    authorized_person: string;
    created_by: string;
}

export interface OfferCompaniesResponse {
    data: OfferCompany[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface OfferCompanyUser {
    fullname: string;
}

export interface OfferCompany {
    id: number;

    name: string;

    street: string;
    house_number: string;
    apartment: string;

    zip_code: string;
    city: string;

    phone_1: string;
    phone_2: string;

    email_1: string;
    email_2: string;

    authorized_person: string;

    is_for_others: boolean;
    is_archive: boolean;

    created_at: string;
    updated_at: string;

    user?: OfferCompanyUser;
}

export interface OfferCompanySubmitPayload {
    name: string;
    street: string;
    house_number: string;
    apartment: string;
    zip_code: string;
    city: string;

    phone_1: string;
    phone_2: string;

    email_1: string;
    email_2: string;

    authorized_person: string;

    is_for_others: boolean;
    is_archive: boolean;
}

export interface OfferCompanyFormExpose {
    setBackendErrors(errors: Record<string, string[]>): void;
    setFormData(data: OfferCompanyDetails): void;
}

export interface OfferCompanyDetails extends OfferCompanySubmitPayload {
    id: number;
}