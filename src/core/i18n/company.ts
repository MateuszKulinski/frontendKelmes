import type { ModuleTranslations } from './buildLang'

const company: ModuleTranslations = {
    pl: {
        opening_hours: {
            week: "Pn–Pt: {hours}",
            saturday: "Sb: {hours}"
        }
    },

    en: {
        opening_hours: {
            week: "Mon–Fri: {hours}",
            saturday: "Sat: {hours}"
        }
    },

    de: {
        opening_hours: {
            week: "Mo–Fr: {hours}",
            saturday: "Sa: {hours}"
        }
    }
}

export default company