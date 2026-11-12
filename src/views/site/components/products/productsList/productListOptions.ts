export type ProductsViewType = 'list' | 'grid';

export const productSortOptions = [
  'default',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
  'newest',
  'oldest',
] as const;
export type ProductSort = typeof productSortOptions[number];

export function normalizeProductSort(value: unknown): ProductSort {
  return productSortOptions.includes(value as ProductSort) ? value as ProductSort : 'default';
}
