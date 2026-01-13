import React from 'react';
import { getPosts } from '../../services/firebaseService';
import { adminDb } from '../../services/firebaseAdmin';
import { Metadata } from 'next';
import BlogList from '../../components/BlogList';

export const metadata: Metadata = {
    title: 'Blog | FreshSTL',
    description: 'Latest news, updates, and tutorials from FreshSTL.',
    alternates: {
        canonical: '/blog',
    },
};

export default async function BlogPage() {
    console.log("[BlogPage] Fetching posts (Server Side)...");

    let posts: any[] = [];

    try {
        if (adminDb) {
            console.log("[BlogPage] Using Admin SDK");
            const postsRef = adminDb.collection('posts');
            // Fetch all posts ordered by date, then filter in memory to avoid composite index requirement
            const snapshot = await postsRef
                .orderBy('createdAt', 'desc')
                .get();

            console.log(`[BlogPage] Found ${snapshot.size} total posts via Admin SDK`);

            posts = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // Serialize dates
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                        lastIndexedAt: data.lastIndexedAt?.toDate ? data.lastIndexedAt.toDate().toISOString() : data.lastIndexedAt
                    };
                })
                .filter((post: any) => post.published); // Filter in memory
        } else {
            console.warn("[BlogPage] Admin DB not initialized. Check server logs.");
            // Fallback to client SDK if Admin SDK fails
            const rawPosts = await getPosts(true);
            posts = rawPosts.map(post => ({
                ...post,
                createdAt: post.createdAt?.toDate ? post.createdAt.toDate().toISOString() : post.createdAt,
                updatedAt: post.updatedAt?.toDate ? post.updatedAt.toDate().toISOString() : post.updatedAt
            }));
        }
    } catch (error) {
        console.error("[BlogPage] Error fetching posts:", error);
    }

    // Fetch latest products for sidebar
    let products: any[] = [];
    try {
        if (adminDb) {
            const productsRef = adminDb.collection('products');
            const snapshot = await productsRef
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            // Fallback
            const { getProducts } = await import('../../services/firebaseService');
            products = await getProducts();
            products = products.slice(0, 5);
        }
    } catch (error) {
        console.error("[BlogPage] Error fetching products:", error);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-24 pb-12">
            {/* Minimal Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                    The <span className="text-brand-600 dark:text-brand-400">Fresh</span> Blog
                </h1>
                <p className="text-lg text-gray-500 dark:text-dark-text-secondary max-w-2xl">
                    Insights, tutorials, and news from the world of 3D printing.
                </p>
            </div>

            <BlogList initialPosts={posts} products={products} />
        </div>
    );
}
