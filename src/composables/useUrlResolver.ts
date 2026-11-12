import { useI18n } from 'vue-i18n'
import { reverseTypeMap } from '@/core/utils/typeMap'
// import type { RouteLocationRaw } from 'vue-router'

export type UrlObject =
    | { type: 'category'; id: number; slug: string }
    | { type: 'manufacturer'; id: number; slug: string }
    | { type: 'product'; id: number; slug: string }
    | { type: 'cms'; id: number; slug: string }
    | { type: 'news_category'; id: number; slug: string }
    | { type: 'external'; url: string }
    | string
    | null

export function isExternalUrl(url: string): boolean {
    if (/^(mailto:|tel:|sms:)/i.test(url)) {
        return true
    }

    try {
        return new URL(url, window.location.origin).origin !== window.location.origin
    } catch {
        return true
    }
}

export function toInternalUrl(url: string): string {
    const parsedUrl = new URL(url, window.location.origin)

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
}

export function useUrlResolver() {
    const { locale } = useI18n()

    const resolve = (url: UrlObject): string => {
        if (!url) return '#'

        if (typeof url === 'string') {
            return url
        }

        if (url.type === 'external') {
            return url.url
        }

        if (url.type === 'news_category') {
            const newsPath = ({ pl: 'aktualnosci', en: 'news', de: 'neuigkeiten' } as Record<string, string>)[locale.value] || 'news'
            return `/${newsPath}?category_id=${url.id}`
        }

        const prefix = reverseTypeMap[locale.value]?.[url.type]

        if (!prefix) {
            console.warn('Missing prefix for:', url.type, locale.value)
            return '#'
        }

        return `/${prefix}/${url.id}-${url.slug}`
    }

    return { resolve }
}
