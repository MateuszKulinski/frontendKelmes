import type { ModuleTranslations } from "./buildLang";

const features: ModuleTranslations = {
    pl: {
        title: "Cechy produktu",
        name: "Nazwa",
        type: "Typ",
        search: "Szukaj po nazwie...",
        is_filterable: "Filtrowanie",
        is_visible: "Widoczna",
        is_exact_filter: "Dokładne wartości (AND)",
        sort_order: "Kolejność",

        types: {
            select: "Pojedynczy wybór",
            multiselect: "Wielokrotny wybór",
            range: "Zakres",
        },
    },

    en: {
        title: "Product Features",
        name: "Name",
        type: "Type",
        search: "Search by name...",
        is_filterable: "Filterable",
        is_visible: "Visible",
        is_exact_filter: "Exact values (AND)",
        sort_order: "Order",

        types: {
            select: "Single selection",
            multiselect: "Multiple selection",
            range: "Range",
        },
    },

    de: {
        title: "Produkteigenschaften",
        name: "Name",
        type: "Typ",
        search: "Nach Namen suchen...",
        is_filterable: "Filterbar",
        is_visible: "Sichtbar",
        is_exact_filter: "Exakte Werte (AND)",
        sort_order: "Reihenfolge",

        types: {
            select: "Einzelauswahl",
            multiselect: "Mehrfachauswahl",
            range: "Bereich",
        },
    },
};

export default features;