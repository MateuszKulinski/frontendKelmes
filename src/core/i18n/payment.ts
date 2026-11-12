import type { ModuleTranslations } from './buildLang'

const payment: ModuleTranslations = {
    pl: {
        title: "Płatności",
        icon: "Ikona",
        upload_icon: "Wgraj ikonę",
        no_icon: "Brak ikony",

        // 🔹 sections
        langs: "Tłumaczenia",
        configs: "Konfiguracje",

        // 🔹 basic
        name: "Nazwa",
        code: "Kod",
        commission_percent: "Prowizja [%]",
        created_at: "Utworzono",

        // 🔹 langs
        lang_code: "Język",
        lang_name: "Nazwa",

        // 🔹 configs
        region_code: "Region",

        account_number: "Numer konta",
        iban: "IBAN",
        swift: "SWIFT",
        bank_name: "Bank",
        account_owner: "Właściciel konta",

        // 🔹 actions
        add_config: "Dodaj konfigurację",
        save: "Zapisz płatność",
        create: "Dodaj płatność",

        // 🔹 misc
        not_found: "Nie znaleziono płatności",

        edit: "Edycja płatności",
        errors: {
            name_required: "Nazwa jest wymagana",
            code_required: "Kod jest wymagany",
            lang_name_required: "Nazwa tłumaczenia jest wymagana",
        }
    },

    en: {
        title: "Payments",
        icon: "Icon",
        upload_icon: "Upload icon",
        no_icon: "No icon",

        // 🔹 sections
        langs: "Translations",
        configs: "Configurations",

        // 🔹 basic
        name: "Name",
        code: "Code",
        commission_percent: "Commission [%]",
        created_at: "Created at",

        // 🔹 langs
        lang_code: "Language",
        lang_name: "Name",

        // 🔹 configs
        region_code: "Region",

        account_number: "Account number",
        iban: "IBAN",
        swift: "SWIFT",
        bank_name: "Bank",
        account_owner: "Account owner",

        // 🔹 actions
        add_config: "Add configuration",
        save: "Save payment",
        create: "Add payment",

        // 🔹 misc
        not_found: "Payment not found",

        edit: "Edit payment",

        errors: {
            name_required: "Name is required",
            code_required: "Code is required",
            lang_name_required: "Translation name is required",
        }

    },

    de: {
        title: "Zahlungen",
        icon: "Symbol",
        upload_icon: "Symbol hochladen",
        no_icon: "Kein Symbol",

        // 🔹 sections
        langs: "Übersetzungen",
        configs: "Konfigurationen",

        // 🔹 basic
        name: "Name",
        code: "Code",
        commission_percent: "Provision [%]",
        created_at: "Erstellt am",

        // 🔹 langs
        lang_code: "Sprache",
        lang_name: "Name",

        // 🔹 configs
        region_code: "Region",

        account_number: "Kontonummer",
        iban: "IBAN",
        swift: "SWIFT",
        bank_name: "Bank",
        account_owner: "Kontoinhaber",

        // 🔹 actions
        add_config: "Konfiguration hinzufügen",
        save: "Zahlung speichern",
        create: "Zahlung hinzufügen",

        // 🔹 misc
        not_found: "Zahlung nicht gefunden",

        edit: "Zahlung bearbeiten",
        errors: {
            name_required: "Name is required",
            code_required: "Code is required",
            lang_name_required: "Translation name is required",
        }
    }
}

export default payment