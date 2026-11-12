export interface CategoryItem {
  id: number;
  erp_id_kategoria: number | null;
  erp_id_rodzgrupkart: number | null;
  parent_category_id: number | null;
  parent_name: string | null;
  name: string | null;
  is_active: boolean;
  has_children: boolean;
  lavel: number | null;
  created_at: string | null;
}

export interface CategoriesResponse {
  data: CategoryItem[];

  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
