export type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  permission_id?: number;
  unit_id?: number;
};

export type Unit = {
  id: number;
  name: string;
  number: string;
  logistics_min: number | null;
  free_delivery?: {
    threshold: number | null;
    always_free: boolean;
  };
  merchant_limit: number;
  receivables: number;
  overdue_receivables: number;
};

export type Context = {
  current_unit_id: number;
  can_switch_unit: boolean;
  available_units_count: number;
};

export type MeResponse = {
  user: User;
  unit: Unit;
  context: Context;
  abilities: string[];
};
export type AuthState = {
  user: User | null;
  context: Context | null;
  unit: Unit | null;
  abilities: string[];
  loading: boolean;
  initialized: boolean;
  fetchPromise: Promise<void> | null;
};
