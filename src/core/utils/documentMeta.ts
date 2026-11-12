export interface ContentMeta {
    meta_title?: string | null;
    meta_description?: string | null;
}

function normalize(value: unknown): string | null {
    if (typeof value !== "string") return null;

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
}

function appName(): string {
    return normalize(import.meta.env.VITE_APP_NAME) ?? "";
}

function setDescription(content: string | null): void {
    const selector = 'meta[name="description"]';
    const existing = document.head.querySelector<HTMLMetaElement>(selector);

    if (!content) {
        existing?.remove();
        return;
    }

    const element = existing ?? document.createElement("meta");
    element.name = "description";
    element.content = content;

    if (!existing) {
        document.head.appendChild(element);
    }
}

export function applyRouteDocumentMeta(routeTitle?: string | null): void {
    const name = appName();
    const title = normalize(routeTitle);

    document.title = title ?? name;
    setDescription(null);
}

export function applyContentDocumentMeta(content: ContentMeta): void {
    const name = appName();
    const metaTitle = normalize(content.meta_title);

    document.title = metaTitle ?? name;
    setDescription(normalize(content.meta_description));
}
