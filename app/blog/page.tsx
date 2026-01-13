import React from 'react';
import { getPosts } from '../../services/firebaseService';
import { adminDb } from '../../services/firebaseAdmin';
import { Metadata } from 'next';
import BlogList from '../../components/BlogList';

export const metadata: Metadata = {
    title: 'Blog | FreshSTL',
    description: 'Latest news, updates, and tutorials from FreshSTL.',
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-24 pb-12">
            {/* Hero Section */}
            <div className="relative bg-brand-900 text-white py-24 mb-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615818499660-30356690c534?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        The <span className="text-brand-400">Fresh</span> Blog
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        Discover the latest in 3D printing, design tips, and community showcases.
                    </p>
                </div>
            </div>

            <BlogList initialPosts={posts} />
        </div>
    );
}
