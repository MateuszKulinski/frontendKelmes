
import type { ModuleTranslations } from "./buildLang";

const unit: ModuleTranslations = {
    pl: {
        title: "Kontrahenci",

        name: "Nazwa",
        number: "Numer",

        logisticsMin: "Minimum logistyczne",
        merchantLimit: "Limit kupiecki",
        receivables: "Należności",
        overdueReceivables: "Przeterminowane należności",

        status: "Status",
        mainAddress: "Adres główny",
        description: "Opis",
        addresses: "Pozostałe adresy",

        users: "Użytkownicy firmy",
        checkoutDefaults: "Domyślne metody koszyka",
        defaultDelivery: "Domyślna dostawa",
        defaultPayment: "Domyślna płatność",
        useConfiguration: "Użyj konfiguracji sklepu",
        saveDefaults: "Zapisz metody",
        defaultsSaved: "Domyślne metody zapisane",
        defaultsSaveError: "Nie udało się zapisać domyślnych metod",
    },

    en: {
        title: "Customers",

        name: "Name",
        number: "Number",

        logisticsMin: "Logistics minimum",
        merchantLimit: "Credit limit",
        receivables: "Receivables",
        overdueReceivables: "Overdue receivables",

        status: "Status",
        mainAddress: "Main address",
        description: "Description",
        addresses: "Additional addresses",

        users: "Company users",
        checkoutDefaults: "Default checkout methods",
        defaultDelivery: "Default delivery",
        defaultPayment: "Default payment",
        useConfiguration: "Use shop configuration",
        saveDefaults: "Save methods",
        defaultsSaved: "Default methods saved",
        defaultsSaveError: "Could not save default methods",
    },

    de: {
        title: "Geschäftspartner",

        name: "Name",
        number: "Nummer",

        logisticsMin: "Mindestbestellwert",
        merchantLimit: "Kreditlimit",
        receivables: "Forderungen",
        overdueReceivables: "Überfällige Forderungen",

        status: "Status",
        mainAddress: "Hauptadresse",
        description: "Beschreibung",
        addresses: "Weitere Adressen",

        users: "Unternehmensnutzer",
        checkoutDefaults: "Standardmethoden für den Warenkorb",
        defaultDelivery: "Standardlieferung",
        defaultPayment: "Standardzahlung",
        useConfiguration: "Shop-Konfiguration verwenden",
        saveDefaults: "Methoden speichern",
        defaultsSaved: "Standardmethoden gespeichert",
        defaultsSaveError: "Standardmethoden konnten nicht gespeichert werden",
    },
};

export default unit;
