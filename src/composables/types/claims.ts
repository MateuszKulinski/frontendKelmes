export type ClaimType = 1 | 2;

export interface ClaimStatus {
  id: number;
  code: string;
  is_editable: boolean;
  is_final: boolean;
  admin_only: boolean;
  langs: Array<{ pivot: { name: string } }>;
}

export interface ClaimSummary {
  id: number;
  claim_type: ClaimType;
  status_id: number;
  created_at: string;
  claim_status: ClaimStatus;
  document?: { number: number | string | null } | null;
  unit?: { id: number; name: string } | null;
  user?: { id: number; fullname?: string; name?: string } | null;
}

export interface ClaimsListResponse {
  data: ClaimSummary[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ClaimHistoryEntry {
  id: number;
  status_id: number | null;
  message: string | null;
  created_at: string;
  claim_status?: ClaimStatus | null;
  user?: { fullname?: string; name?: string } | null;
}

export interface ClaimFileItem {
  id: number;
  file_path: string;
  file_type?: string | null;
}

export interface ClaimDetails extends ClaimSummary {
  description: string | null;
  claim_status_histories: ClaimHistoryEntry[];
  claim_files: ClaimFileItem[];
  claim_items: Array<{
    id: number;
    document_position_id: number;
    notes: string | null;
    quantity_returned: number;
    claim_item_files: ClaimFileItem[];
    document_position?: {
      id: number;
      name?: string;
      indeks?: string;
      quantity?: number;
      product?: { name?: string } | null;
    } | null;
  }>;
  document?: {
    id: number;
    number: number | string | null;
  } | null;
}

export interface ClaimDocumentListItem {
  id: number;
  name: string | null;
  number: number | null;
  price: number | null;
  price_tax: number | null;
  outstanding_amount: number | null;
  date_add: string | null;
  date_payment: string | null;

  unit?: {
    id: number;
    name: string;
  } | null;

  currency?: {
    id: number;
    name: string;
    code?: string;
  } | null;

  agent?: {
    id: number;
    firstname: string;
    lastname: string;
  } | null;
}
export interface ClaimDocumentPosition {
  id: number;
  name: string | null;
  indeks: string | null;

  quantity: number;

  price: number | null;
  price_tax: number | null;
  total_amount: number | null;
  total_amount_tax: number | null;

  already_claimed: number;
  available_quantity: number;

  product?: {
    id: number;
    name: string;
    indeks: string | null;
    url?: string | null;
    unit?: {
      name: string;
    } | null;
  } | null;

  form_quantity?: number;
  form_notes?: string;
  files?: File[];
}

export interface ClaimableDocument {
  id: number;
  name: string | null;
  number: number | null;
  price: number | null;
  price_tax: number | null;
  outstanding_amount: number | null;
  date_add: string | null;
  date_payment: string | null;

  unit?: any;
  currency?: any;
  document_type?: any;

  positions: ClaimDocumentPosition[];
}

export interface ClaimsDocumentsResponse {
  data: ClaimDocumentListItem[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
