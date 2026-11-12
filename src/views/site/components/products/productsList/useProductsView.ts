import { ref, watch } from 'vue';
import type { ProductsViewType } from './productListOptions';

const storageKey = 'products-view-type';

export function useProductsView(defaultView: ProductsViewType = 'list') {
  const savedView = typeof window === 'undefined' ? null : window.localStorage.getItem(storageKey);
  const viewType = ref<ProductsViewType>(savedView === 'grid' || savedView === 'list' ? savedView : defaultView);

  watch(viewType, value => window.localStorage.setItem(storageKey, value));

  return { viewType };
}
