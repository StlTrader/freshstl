"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Tag, ArrowRight, ShoppingBag, Star, Clock, Mail, TrendingUp } from 'lucide-react';
import { BlogPost, Product } from '../types';
import { getCleanImageUrl } from '../utils/urlHelpers';

interface BlogListProps {
    initialPosts: BlogPost[];
    products?: Product[];
}

export default function BlogList({ initialPosts, products = [] }: BlogListProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [email, setEmail] = useState('');

    // Get unique categories from posts
    const categories = ['All', ...Array.from(new Set(initialPosts.map(post => post.category).filter(Boolean)))];

    // Filter posts
    const filteredPosts = initialPosts.filter(post => {
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Featured Post (First post if no filter/search, otherwise none)
    const featuredPost = (selectedCategory === 'All' && !searchQuery && filteredPosts.length > 0) ? filteredPosts[0] : null;
    const listPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Subscribed with ${email}! (Mock)`);
        setEmail('');
    };

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
                                    ? 'bg-social-black dark:bg-white text-white dark:text-black shadow-lg'
                                    : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-border hover:border-social-black dark:hover:border-white hover:text-social-black dark:hover:text-white'
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
                        className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-social-black dark:focus:ring-white focus:border-transparent outline-none transition-all shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Featured Post */}
                    {featuredPost && (
                        <div className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="flex items-center gap-2 mb-4 text-social-black dark:text-white font-bold uppercase tracking-wider text-sm">
                                <TrendingUp size={18} />
                                <span>Featured Story</span>
                            </div>
                            <Link href={`/blog/${featuredPost.slug}`} className="group block relative rounded-3xl overflow-hidden aspect-[16/9] shadow-xl hover:shadow-2xl transition-all duration-500">
                                {featuredPost.coverImage ? (
                                    <Image
                                        src={getCleanImageUrl(featuredPost.coverImage)}
                                        alt={featuredPost.title}
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 dark:bg-dark-bg flex items-center justify-center">
                                        <Tag size={48} className="text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                                    <div className="flex items-center gap-4 text-gray-300 text-sm mb-3">
                                        <span className="bg-social-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                            {featuredPost.category}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            <span>5 min read</span>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-gray-200 transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-gray-300 line-clamp-2 md:line-clamp-3 max-w-2xl text-lg mb-6">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-white font-bold group/btn">
                                        Read Full Story
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Post List */}
                    {listPosts.length === 0 ? (
                        <div className="text-center py-24 bg-white dark:bg-dark-surface rounded-3xl border border-gray-200 dark:border-dark-border shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-bg mb-4">
                                <Tag size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">No posts found</h3>
                            <p className="text-gray-500 dark:text-dark-text-secondary">Try adjusting your search or category.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {listPosts.map((post, index) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group block animate-in fade-in slide-in-from-bottom-8 duration-700"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <article className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-border flex flex-row h-32 sm:h-48 lg:h-52 group-hover:-translate-y-1">
                                        {/* Image */}
                                        <div className="w-1/3 sm:w-2/5 lg:w-1/3 relative overflow-hidden bg-gray-200 dark:bg-dark-bg shrink-0">
                                            {post.coverImage ? (
                                                <Image
                                                    src={getCleanImageUrl(post.coverImage)}
                                                    alt={post.title}
                                                    fill
                                                    sizes="(max-width: 768px) 33vw, 33vw"
                                                    className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-dark-surface">
                                                    <Tag size={24} className="opacity-20" />
                                                </div>
                                            )}
                                            {post.category && (
                                                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm text-social-black dark:text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded sm:rounded-lg shadow-sm">
                                                    {post.category}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 text-xs font-bold text-gray-400 dark:text-dark-text-secondary mb-2 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-social-black dark:text-white" />
                                                        <span>
                                                            {(() => {
                                                                if (!post.createdAt) return 'Recently';
                                                                const date = typeof post.createdAt === 'string'
                                                                    ? new Date(post.createdAt)
                                                                    : post.createdAt.toDate
                                                                        ? post.createdAt.toDate()
                                                                        : new Date(post.createdAt);
                                                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-dark-border"></div>
                                                    <div className="hidden sm:flex items-center gap-1.5">
                                                        <Clock size={12} className="text-social-black dark:text-white" />
                                                        <span>5 min read</span>
                                                    </div>
                                                </div>

                                                <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2 group-hover:text-social-black dark:group-hover:text-white transition-colors line-clamp-2 leading-tight">
                                                    {post.title}
                                                </h2>

                                                <p className="hidden sm:block text-gray-500 dark:text-dark-text-secondary mb-4 text-sm leading-relaxed">
                                                    {post.excerpt.split(' ').slice(0, 15).join(' ')}{post.excerpt.split(' ').length > 15 ? '...' : ''}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs font-bold text-social-black dark:text-white mt-auto group/btn">
                                                Read Article
                                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-24 space-y-8">

                        {/* Newsletter Widget */}
                        <div className="bg-social-black dark:bg-dark-surface rounded-2xl p-6 text-white relative overflow-hidden border border-gray-800 dark:border-dark-border">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gray-700 rounded-full opacity-50 blur-2xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3 text-gray-300 font-bold uppercase tracking-wider text-xs">
                                    <Mail size={14} />
                                    <span>Newsletter</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                                <p className="text-gray-400 text-sm mb-4">Get the latest design tips and free models delivered to your inbox.</p>
                                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                                        required
                                    />
                                    <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                                        Subscribe
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Popular Tags Widget */}
                        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                                <Tag size={18} className="text-social-black dark:text-white" />
                                Popular Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['3D Printing', 'Design', 'Tutorials', 'Cosplay', 'Miniatures', 'Tech'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-text-secondary text-xs font-bold rounded-md hover:bg-social-light-hover dark:hover:bg-social-dark-hover hover:text-social-black dark:hover:text-white cursor-pointer transition-colors">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Ad Widget */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615818499660-30356690c534?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2">Premium 3D Models</h4>
                                <p className="text-gray-300 text-sm mb-4">Unlock exclusive designs and support creators.</p>
                                <Link href="/store" className="inline-block bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors shadow-lg">
                                    Shop Now
                                </Link>
                            </div>
                        </div>

                        {/* Latest Products Widget */}
                        {products.length > 0 && (
                            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-social-black dark:text-white" />
                                    Latest Arrivals
                                </h3>
                                <div className="space-y-4">
                                    {products.map((product) => (
                                        <Link key={product.id} href={`/product/${product.id}`} className="flex gap-4 group">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden shrink-0 relative">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={getCleanImageUrl(product.imageUrl)}
                                                        alt={product.name}
                                                        fill
                                                        sizes="64px"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <ShoppingBag size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary truncate group-hover:text-social-black dark:group-hover:text-white transition-colors">
                                                    {product.name}
                                                </h4>
                                                <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
                                                    <Star size={10} fill="currentColor" />
                                                    <span className="text-gray-500 dark:text-dark-text-secondary">{product.rating || 'New'}</span>
                                                </div>
                                                <div className="text-sm font-bold text-social-black dark:text-white">
                                                    ${(product.price / 100).toFixed(2)}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link href="/store" className="block mt-6 text-center text-xs font-bold text-social-black dark:text-white hover:underline uppercase tracking-wider">
                                    View All Products
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
