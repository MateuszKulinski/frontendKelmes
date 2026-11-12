// /core/utils/typeMap.ts

export const typeMap: Record<string, string> = {
  // PRODUCT
  produkt: "product",
  product: "product",

  // CATEGORY
  kategoria: "category",
  category: "category",
  kategorie: "category", // DE

  // CMS
  cms: "cms",

  // MANUFACTURER
  producent: "manufacturer",
  manufacturer: "manufacturer",
};

export const reverseTypeMap: Record<string, Record<string, string>> = {
  pl: {
    product: "produkt",
    category: "kategoria",
    cms: "cms",
    manufacturer: "producent",
  },
  en: {
    product: "product",
    category: "category",
    cms: "cms",
    manufacturer: "manufacturer",
  },
  de: {
    product: "produkt",
    category: "kategorie",
    cms: "cms",
    manufacturer: "producent",
  },
};
