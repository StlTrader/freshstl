import { FieldPath } from 'firebase-admin/firestore';
import React from 'react';
import { ProductGrid } from '../components/ProductGrid';
import { Hero } from '../components/Hero';
import { LearningHub } from '../components/LearningHub';
import { adminDb } from '../services/firebaseAdmin';
import { Product, BlogPost, Collection } from '../types';
import { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'FreshSTL | Premium 3D Print Files & Models',
    description: 'Discover high-quality 3D print files, STL models, and creative designs for your 3D printer. Shop our curated collection of premium 3D models.',
    keywords: '3D print files, STL models, 3D printing, digital downloads, premium 3D models',
    openGraph: {
        title: 'FreshSTL | Premium 3D Print Files & Models',
        description: 'Discover high-quality 3D print files, STL models, and creative designs for your 3D printer.',
        type: 'website',
        locale: 'en_US',
        siteName: 'FreshSTL',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FreshSTL | Premium 3D Print Files & Models',
        description: 'Discover high-quality 3D print files, STL models, and creative designs for your 3D printer.',
    },
};

// Server Component
export default async function Home() {
    // Fetch products on the server
    let products: Product[] = [];
    let recentBlogPosts: BlogPost[] = [];
    let collections: Collection[] = [];

    try {
        if (adminDb) {
            // Fetch Products
            const snapshot = await adminDb.collection('products').get();
            products = snapshot.docs.map(doc => {
                const data = doc.data();

                const serializeTimestamp = (ts: any) => {
                    if (!ts) return null;
                    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
                    if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
                    return ts; // Fallback (e.g. already string)
                };

                return {
                    id: doc.id,
                    ...(data as any),
                    createdAt: serializeTimestamp(data.createdAt),
                    updatedAt: serializeTimestamp(data.updatedAt),
                    lastIndexedAt: serializeTimestamp(data.lastIndexedAt),
                } as Product;
            }).map(product => {
                // Ensure status is set, default to published if missing for legacy data
                if (!product.status) product.status = 'published';
                return product;
            });

            // Fetch Recent Blog Posts
            const blogSnapshot = await adminDb.collection('posts')
                .where('published', '==', true)
                .limit(6) // Fetch enough for grid + hub
                .get();

            recentBlogPosts = blogSnapshot.docs.map(doc => {
                const data = doc.data();
                const serializeTimestamp = (ts: any) => {
                    if (!ts) return null;
                    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
                    if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
                    return ts;
                };
                return {
                    id: doc.id,
                    ...data,
                    createdAt: serializeTimestamp(data.createdAt),
                    updatedAt: serializeTimestamp(data.updatedAt),
                    lastIndexedAt: serializeTimestamp(data.lastIndexedAt),
                } as BlogPost;
            }).sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            // Fetch Collections
            const collectionsSnapshot = await adminDb.collection('collections')
                .where('status', '==', 'published')
                .get();

            collections = collectionsSnapshot.docs.map(doc => {
                const data = doc.data();
                const serializeTimestamp = (ts: any) => {
                    if (!ts) return null;
                    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
                    if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
                    return ts;
                };
                return {
                    id: doc.id,
                    ...(data as any),
                    createdAt: serializeTimestamp(data.createdAt),
                } as Collection;
            });

        } else {
            console.error("Admin DB not initialized. Check environment variables.");
        }
    } catch (error) {
        console.error("Error fetching data server-side:", error);
    }

    // Fetch Hero Config
    let heroProducts: Product[] = [];
    let heroConfig: any = { mode: 'auto', autoType: 'newest' };
    try {
        if (adminDb) {
            const settingsDoc = await adminDb.collection('settings').doc('hero').get();
            if (settingsDoc.exists) {
                heroConfig = settingsDoc.data();
            }

            if (heroConfig?.mode === 'custom' && heroConfig.customProductIds) {
                // Fetch specific products
                // Note: Firestore 'in' query supports up to 10 items
                if (heroConfig.customProductIds.length > 0) {
                    const customDocs = await adminDb.collection('products')
                        .where(FieldPath.documentId(), 'in', heroConfig.customProductIds)
                        .get();

                    const fetchedProducts = customDocs.docs.map(doc => {
                        const data = doc.data();
                        const serializeTimestamp = (ts: any) => {
                            if (!ts) return null;
                            if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
                            if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
                            return ts;
                        };
                        return {
                            id: doc.id,
                            ...(data as any),
                            createdAt: serializeTimestamp(data.createdAt),
                            updatedAt: serializeTimestamp(data.updatedAt),
                            lastIndexedAt: serializeTimestamp(data.lastIndexedAt),
                        } as Product;
                    });

                    // Sort by the order in customProductIds
                    heroProducts = heroConfig.customProductIds
                        .map((id: string) => fetchedProducts.find(p => p.id === id))
                        .filter((p: Product | undefined): p is Product => !!p);
                }
            } else {
                // Auto mode
                let sortedProducts = [...products];
                if (heroConfig?.autoType === 'popular') {
                    sortedProducts.sort((a, b) => (b.sales || 0) - (a.sales || 0));
                } else if (heroConfig?.autoType === 'random') {
                    sortedProducts.sort(() => Math.random() - 0.5);
                } else {
                    // Newest (default) - already sorted by fetch usually, or we sort here
                    // Assuming products are already fetched, let's just use them or sort them
                    sortedProducts.sort((a, b) => {
                        const dateA = new Date(a.createdAt).getTime();
                        const dateB = new Date(b.createdAt).getTime();
                        return dateB - dateA;
                    });
                }
                heroProducts = sortedProducts.slice(0, 4);
            }
        }
    } catch (error) {
        console.error("Error fetching hero config:", error);
        heroProducts = products.slice(0, 4); // Fallback
    }

    // If heroProducts is empty (e.g. custom selection but no products found), fallback
    if (heroProducts.length === 0) {
        heroProducts = products.slice(0, 4);
    }

    return (
        <div className="min-h-screen">
            <Hero products={heroProducts} config={heroConfig} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                        Latest Arrivals
                    </h2>
                    {/* Filter controls could go here, managed by client state in ProductGrid or a wrapper */}
                </div>
                <ProductGrid initialProducts={products} blogPosts={recentBlogPosts} collections={collections} />
            </div>

            <LearningHub posts={recentBlogPosts.slice(0, 3)} />
        </div>
    );
}
