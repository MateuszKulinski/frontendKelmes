import { useI18n } from 'vue-i18n'

export function useRoutePath() {
    const { t } = useI18n()

    const routePath = (name: string): string => {
        const key = `url.routes.${name}`
        const translated = t(key) as string

        if (translated === key) {
            return `/${name}`
        }

        return translated
    }

    return {
        routePath
    }
}