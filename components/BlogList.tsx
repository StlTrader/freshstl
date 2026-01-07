'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogListProps {
    initialPosts: BlogPost[];
}

export default function BlogList({ initialPosts }: BlogListProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Get unique categories from posts
    const categories = ['All', ...Array.from(new Set(initialPosts.map(post => post.category).filter(Boolean)))];

    const filteredPosts = initialPosts.filter(post => {
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                {/* Categories */}
                {categories.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 ${selectedCategory === cat
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                                    : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-border hover:border-brand-500 hover:text-brand-500'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-dark-surface rounded-3xl border border-gray-200 dark:border-dark-border shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-bg mb-4">
                        <Tag size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">No posts found</h3>
                    <p className="text-gray-500 dark:text-dark-text-secondary">Try adjusting your search or category.</p>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post, index) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <article className="bg-white dark:bg-dark-surface rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 border border-gray-100 dark:border-dark-border h-full flex flex-col group-hover:-translate-y-1">
                                {/* Image */}
                                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200 dark:bg-dark-bg relative">
                                    {post.coverImage ? (
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-dark-surface">
                                            <Tag size={48} className="opacity-20" />
                                        </div>
                                    )}
                                    {post.category && (
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                            {post.category}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-brand-500" />
                                            <span>
                                                <span>
                                                    {(() => {
                                                        if (!post.createdAt) return 'Recently';
                                                        // Handle Firestore Timestamp (if on client/mock) or ISO string (serialized from server)
                                                        const date = typeof post.createdAt === 'string'
                                                            ? new Date(post.createdAt)
                                                            : post.createdAt.toDate
                                                                ? post.createdAt.toDate()
                                                                : new Date(post.createdAt); // Fallback

                                                        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                                    })()}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-dark-border"></div>
                                        <div className="flex items-center gap-1.5">
                                            <User size={14} className="text-brand-500" />
                                            <span>{post.authorName}</span>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-tight">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-600 dark:text-dark-text-secondary mb-6 line-clamp-3 flex-1 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 mt-auto group/btn">
                                        Read Article
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
