import type { UrlObject } from '@/composables/useUrlResolver'
export interface CategoryTreeElement {
    id: number
    name: string | null
    url: UrlObject
    children: CategoryTreeElement[]
}
