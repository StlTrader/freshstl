import { MetadataRoute } from 'next';
import { adminDb } from '../services/firebaseAdmin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://freshstl.com';

    // Static routes
    const routes = [
        '',
        '/login',
        '/support',
        '/license',
        '/terms',
        '/terms',
        '/privacy',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic product routes
    let productRoutes: MetadataRoute.Sitemap = [];
    let blogRoutes: MetadataRoute.Sitemap = [];

    if (adminDb) {
        try {
            const productsSnapshot = await adminDb.collection('products').get();
            productRoutes = productsSnapshot.docs
                .filter(doc => doc.data().status !== 'draft')
                .map((doc) => {
                    const data = doc.data();
                    // Handle Firestore Timestamp or other date formats
                    let lastModified = new Date();
                    if (data.updatedAt) {
                        if (typeof data.updatedAt.toDate === 'function') {
                            lastModified = data.updatedAt.toDate();
                        } else if (data.updatedAt instanceof Date) {
                            lastModified = data.updatedAt;
                        } else {
                            lastModified = new Date(data.updatedAt);
                        }
                    }

                    return {
                        url: `${baseUrl}/3d-print/${data.slug || doc.id}`,
                        lastModified: lastModified,
                        changeFrequency: 'weekly' as const,
                        priority: 0.9,
                    };
                });

            const postsSnapshot = await adminDb.collection('posts').where('published', '==', true).get();
            blogRoutes = postsSnapshot.docs.map((doc) => {
                const data = doc.data();
                let lastModified = new Date();
                if (data.updatedAt) {
                    if (typeof data.updatedAt.toDate === 'function') {
                        lastModified = data.updatedAt.toDate();
                    } else if (data.updatedAt instanceof Date) {
                        lastModified = data.updatedAt;
                    } else {
                        lastModified = new Date(data.updatedAt);
                    }
                }

                return {
                    url: `${baseUrl}/blog/${data.slug}`,
                    lastModified: lastModified,
                    changeFrequency: 'weekly' as const,
                    priority: 0.8,
                };
            });
        } catch (error) {
            console.error('Error fetching products for sitemap:', error);
        }
    }

    return [...routes, ...productRoutes, ...blogRoutes];
}
