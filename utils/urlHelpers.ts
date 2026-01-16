export const STORAGE_BUCKET = 'freshstlstore-99511217-ca510.firebasestorage.app';

export function getCategoryPath(category: string): string {
    if (!category) return 'misc';
    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return slug;
}

export function getCleanImageUrl(imageUrl: string, category: string): string {
    if (!imageUrl) return '';

    try {
        if (imageUrl.includes('firebasestorage.googleapis.com')) {
            const url = new URL(imageUrl);
            const pathParts = url.pathname.split('/o/');
            if (pathParts.length > 1) {
                const encodedPath = pathParts[1];
                const path = decodeURIComponent(encodedPath);

                // Match new structure: products/[category]/[slug]/public/images/[filename]
                // We want to serve this as: /assets/[category]/[slug]/images/[filename]

                // Regex to match: products/category/slug/public/type/filename
                const match = path.match(/^products\/([^\/]+)\/([^\/]+)\/public\/([^\/]+)\/(.+)$/);
                if (match) {
                    const [, cat, slug, type, filename] = match;
                    return `/assets/${cat}/${slug}/${type}/${filename}`;
                }

                // Fallback for legacy paths or direct category paths
                const categoryPath = getCategoryPath(category);
                if (path.startsWith(categoryPath + '/')) {
                    const filename = path.split('/').pop();
                    return `/assets/${categoryPath}/${filename}`;
                }
            }
        }
    } catch (e) {
        console.error("Error parsing image URL:", e);
    }

    return imageUrl;
}

export type StorageFileType = 'image' | 'preview' | 'source' | 'builder';

export function getStoragePathForUpload(category: string, slug: string, type: StorageFileType, filename: string): string {
    const catSlug = getCategorySlug(category);
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const basePath = `products/${catSlug}/${cleanSlug}`;

    switch (type) {
        case 'image':
            return `${basePath}/public/images/${filename}`;
        case 'preview':
            return `${basePath}/public/preview/${filename}`;
        case 'source':
            return `${basePath}/private/3d-models/${filename}`;
        case 'builder':
            return `${basePath}/private/builder/${filename}`;
        default:
            return `${basePath}/misc/${filename}`;
    }
}

export function getCategorySlug(category: string): string {
    if (!category) return 'misc';
    return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getProductUrl(product: { category: string; slug: string }): string {
    const categorySlug = getCategorySlug(product.category);
    return `/${categorySlug}/${product.slug}`;
}
