// /core/utils/slug.ts
export function getIdFromSlug(slug: string): number {
    return Number(slug.split('-')[0])
}