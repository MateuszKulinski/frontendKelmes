// entities/productSearch.ts

export interface ProductSearchItem {
  id: number;
  name: string;
  catalog_number: string;
  price: string;
  image: string | null;

  url: {
    id: number;
    type: string;
    slug: string;
  };
}
