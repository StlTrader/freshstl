import React from 'react';
import { getPostBySlug, getRelatedPosts } from '../../../services/firebaseService';
import { adminDb } from '../../../services/firebaseAdmin';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Tag, Share2, Clock, ArrowRight, Facebook, Twitter, Linkedin, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { BlogPost } from '../../../types';
import { AdminEditButton } from '../../../components/AdminEditButton';
import { getCleanImageUrl, getAbsoluteImageUrl } from '../../../utils/urlHelpers';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    let post: BlogPost | null = null;

    if (adminDb) {
        const snapshot = await adminDb.collection('posts').where('slug', '==', slug).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            post = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                lastIndexedAt: data.lastIndexedAt?.toDate ? data.lastIndexedAt.toDate().toISOString() : data.lastIndexedAt
            } as BlogPost;
        }
    } else {
        post = await getPostBySlug(slug);
    }

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} | FreshSTL Blog`,
        description: post.excerpt,
        alternates: {
            canonical: `/blog/${post.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toISOString() : undefined,
            authors: [post.authorName],
            images: post.coverImage ? [getAbsoluteImageUrl(post.coverImage, 'blog')] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [getAbsoluteImageUrl(post.coverImage, 'blog')] : [],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;

    let post: BlogPost | null = null;
    let relatedPosts: BlogPost[] = [];

    if (adminDb) {
        // Fetch Post
        const postsRef = adminDb.collection('posts');
        const snapshot = await postsRef.where('slug', '==', slug).limit(1).get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            post = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                lastIndexedAt: data.lastIndexedAt?.toDate ? data.lastIndexedAt.toDate().toISOString() : data.lastIndexedAt
            } as BlogPost;
        }

        // Fetch Related Posts
        if (post) {
            // Fetch more posts to filter in memory (avoid composite index)
            const relatedSnapshot = await postsRef
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            relatedPosts = relatedSnapshot.docs
                .map((doc: any) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                        lastIndexedAt: data.lastIndexedAt?.toDate ? data.lastIndexedAt.toDate().toISOString() : data.lastIndexedAt
                    } as BlogPost;
                })
                .filter((p: any) => p.published && p.slug !== slug)
                .slice(0, 3);
        }
    } else {
        // Fallback (Client SDK on Server - unreliable)
        post = await getPostBySlug(slug);
        if (post) {
            post = {
                ...post,
                createdAt: post.createdAt?.toDate ? post.createdAt.toDate().toISOString() : post.createdAt,
                updatedAt: post.updatedAt?.toDate ? post.updatedAt.toDate().toISOString() : post.updatedAt,
                lastIndexedAt: post.lastIndexedAt?.toDate ? post.lastIndexedAt.toDate().toISOString() : post.lastIndexedAt
            };
            const rawRelated = await getRelatedPosts(slug, 3);
            relatedPosts = rawRelated.map(p => ({
                ...p,
                createdAt: p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : p.createdAt,
                updatedAt: p.updatedAt?.toDate ? p.updatedAt.toDate().toISOString() : p.updatedAt,
                lastIndexedAt: p.lastIndexedAt?.toDate ? p.lastIndexedAt.toDate().toISOString() : p.lastIndexedAt
            }));
        }
    }

    if (!post) {
        notFound();
    }

    // Extract Headings for TOC
    const headings = post.content.split('\n')
        .filter(line => line.startsWith('# ') || line.startsWith('## '))
        .map(line => {
            const level = line.startsWith('## ') ? 2 : 1;
            const text = line.replace(/^#+ /, '').trim();
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            return { level, text, id };
        });

    // Simple Markdown Parser (Enhanced)
    const renderMarkdown = (text: string) => {
        if (!text) return null;

        const lines = text.split('\n');
        return lines.map((line, index) => {
            // Headers
            if (line.startsWith('# ')) {
                const text = line.slice(2).trim();
                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                return <h1 id={id} key={index} className="scroll-mt-32 text-3xl md:text-4xl font-black mt-12 mb-6 text-gray-900 dark:text-dark-text-primary leading-tight tracking-tight">{text}</h1>;
            }
            if (line.startsWith('## ')) {
                const text = line.slice(3).trim();
                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                return <h2 id={id} key={index} className="scroll-mt-32 text-2xl md:text-3xl font-bold mt-10 mb-5 text-gray-900 dark:text-dark-text-primary leading-tight tracking-tight border-b border-gray-100 dark:border-dark-border pb-3">{text}</h2>;
            }
            if (line.startsWith('### ')) return <h3 key={index} className="text-xl md:text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-dark-text-primary leading-tight">{line.slice(4)}</h3>;

            // Lists
            if (line.startsWith('- ')) return <li key={index} className="ml-6 list-disc text-gray-700 dark:text-dark-text-secondary mb-2 pl-2 marker:text-brand-500 text-lg leading-relaxed">{parseInline(line.slice(2))}</li>;
            if (line.startsWith('* ')) return <li key={index} className="ml-6 list-disc text-gray-700 dark:text-dark-text-secondary mb-2 pl-2 marker:text-brand-500 text-lg leading-relaxed">{parseInline(line.slice(2))}</li>;
            if (line.match(/^\d+\. /)) return <li key={index} className="ml-6 list-decimal text-gray-700 dark:text-dark-text-secondary mb-2 pl-2 marker:text-brand-500 marker:font-bold text-lg leading-relaxed">{parseInline(line.replace(/^\d+\. /, ''))}</li>;

            // Blockquotes
            if (line.startsWith('> ')) return <blockquote key={index} className="border-l-4 border-brand-500 pl-6 italic text-xl text-gray-600 dark:text-dark-text-secondary my-8 py-2 bg-gray-50 dark:bg-dark-surface/50 rounded-r-xl">{parseInline(line.slice(2))}</blockquote>;

            // Images ![alt](url)
            const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
            if (imgMatch) {
                return (
                    <figure key={index} className="my-10 group">
                        <div className="rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-dark-surface relative aspect-video">
                            <Image
                                src={getCleanImageUrl(imgMatch[2], 'blog')}
                                alt={imgMatch[1]}
                                fill
                                className="object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        </div>
                        {imgMatch[1] && (
                            <figcaption className="text-center text-sm font-medium text-gray-500 mt-3 flex items-center justify-center gap-2">
                                <span className="w-8 h-px bg-gray-300 dark:bg-dark-border"></span>
                                {imgMatch[1]}
                                <span className="w-8 h-px bg-gray-300 dark:bg-dark-border"></span>
                            </figcaption>
                        )}
                    </figure>
                );
            }

            // Empty lines
            if (line.trim() === '') return <div key={index} className="h-4"></div>;

            // Paragraphs
            return <p key={index} className="mb-6 text-lg text-gray-700 dark:text-dark-text-secondary leading-relaxed font-serif-safe">{parseInline(line)}</p>;
        });
    };

    const parseInline = (text: string) => {
        // Bold **text**
        let parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-gray-900 dark:text-dark-text-primary">{part.slice(2, -2)}</strong>;
            }
            // Links [text](url)
            const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
            if (linkMatch) {
                const [full, label, url] = linkMatch;
                const [before, after] = part.split(full);
                const isProductLink = url.includes('/3d-print/');

                return (
                    <span key={i}>
                        {before}
                        <a
                            href={url}
                            className={`font-medium transition-all ${isProductLink
                                ? 'text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-900/30 px-1 rounded hover:bg-brand-100 dark:hover:bg-brand-900/50 no-underline border-b-2 border-brand-200 dark:border-brand-800 hover:border-brand-500'
                                : 'text-brand-600 hover:text-brand-700 underline decoration-2 decoration-brand-200 hover:decoration-brand-500'
                                }`}
                            target={url.startsWith('/') ? undefined : "_blank"}
                            rel={url.startsWith('/') ? undefined : "noopener noreferrer"}
                        >
                            {label} {isProductLink && <ArrowRight size={14} className="inline-block ml-0.5 -mt-0.5" />}
                        </a>
                        {after}
                    </span>
                );
            }
            return part;
        });
    };

    // JSON-LD for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.coverImage ? [getAbsoluteImageUrl(post.coverImage, 'blog')] : [],
        datePublished: post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toISOString() : undefined,
        dateModified: post.updatedAt?.toDate ? new Date(post.updatedAt.toDate()).toISOString() : undefined,
        author: [{
            '@type': 'Person',
            name: post.authorName,
        }],
        description: post.excerpt,
        articleBody: post.content,
        publisher: {
            '@type': 'Organization',
            name: 'FreshSTL',
            logo: {
                '@type': 'ImageObject',
                url: 'https://freshstl.store/logo.png' // Replace with actual logo URL
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://freshstl.store/blog/${post.slug}`
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-dark-bg pt-24 pb-20 selection:bg-brand-100 dark:selection:bg-brand-900/50 selection:text-brand-900 dark:selection:text-brand-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Progress Bar (Simulated) */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 dark:bg-dark-surface z-50">
                <div className="h-full bg-gradient-to-r from-brand-500 to-purple-600 w-1/3 animate-pulse"></div>
            </div>

            <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation */}
                <nav className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Link href="/blog" className="group inline-flex items-center text-gray-500 hover:text-brand-600 font-medium transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mr-2 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 transition-colors shadow-sm">
                            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-sm font-bold">Back to Blog</span>
                    </Link>
                </nav>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8">
                        {/* Header */}
                        <header className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.category && (
                                    <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-brand-100 dark:border-brand-800">
                                        {post.category}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-dark-text-primary mb-6 leading-[1.1] tracking-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-dark-text-secondary">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center text-white shadow-md">
                                        <User size={14} />
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-dark-text-primary">{post.authorName}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-dark-border"></div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    <span>
                                        {post.createdAt?.toDate
                                            ? new Date(post.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'Unknown'}
                                    </span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-dark-border"></div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    <span>5 min read</span>
                                </div>
                            </div>
                        </header>

                        {/* Cover Image */}
                        {post.coverImage && (
                            <div className="mb-12 rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-black/50 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 relative aspect-[16/9]">
                                <Image
                                    src={getCleanImageUrl(post.coverImage, 'blog')}
                                    alt={post.title}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-img:rounded-2xl prose-img:shadow-lg">
                            {renderMarkdown(post.content)}
                        </div>

                        {/* Footer / Tags */}
                        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-dark-border">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary rounded-lg text-xs font-bold hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Table of Contents (Sticky) */}
                        <div className="sticky top-32 space-y-8">
                            {headings.length > 0 && (
                                <div className="bg-gray-50 dark:bg-dark-surface rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                                        On this page
                                    </h3>
                                    <nav className="space-y-1">
                                        {headings.map((heading, index) => (
                                            <a
                                                key={index}
                                                href={`#${heading.id}`}
                                                className={`block text-sm py-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${heading.level === 1
                                                    ? 'font-bold text-gray-700 dark:text-dark-text-secondary'
                                                    : 'pl-4 text-gray-500 dark:text-dark-text-secondary'
                                                    }`}
                                            >
                                                {heading.text}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Share Widget */}
                            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-gray-100 dark:border-dark-border shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary uppercase tracking-wider mb-4">Share this article</h3>
                                <div className="flex gap-2">
                                    <button className="flex-1 h-10 flex items-center justify-center rounded-lg bg-[#1877F2] text-white hover:opacity-90 transition-opacity">
                                        <Facebook size={18} />
                                    </button>
                                    <button className="flex-1 h-10 flex items-center justify-center rounded-lg bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity">
                                        <Twitter size={18} />
                                    </button>
                                    <button className="flex-1 h-10 flex items-center justify-center rounded-lg bg-[#0A66C2] text-white hover:opacity-90 transition-opacity">
                                        <Linkedin size={18} />
                                    </button>
                                    <button className="flex-1 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-border transition-colors">
                                        <LinkIcon size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Posts Section */}
                {relatedPosts.length > 0 && (
                    <div className="mt-24 pt-16 border-t border-gray-200 dark:border-dark-border">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary mb-2">Read Next</h3>
                                <p className="text-gray-500 dark:text-dark-text-secondary text-sm">More articles you might like</p>
                            </div>
                            <Link href="/blog" className="hidden sm:flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors text-sm bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-full">
                                View all posts <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedPosts.map((relatedPost) => (
                                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block h-full">
                                    <article className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 h-full flex flex-row sm:flex-col hover:-translate-y-1">
                                        <div className="w-1/3 sm:w-full aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-dark-bg shrink-0">
                                            {relatedPost.coverImage ? (
                                                <Image
                                                    src={getCleanImageUrl(relatedPost.coverImage, 'blog')}
                                                    alt={relatedPost.title}
                                                    fill
                                                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 50vw, 25vw"
                                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-dark-text-secondary">
                                                    <Tag size={24} className="opacity-20" />
                                                </div>
                                            )}
                                            {relatedPost.category && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md rounded text-[9px] sm:text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide shadow-sm">
                                                    {relatedPost.category}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {relatedPost.createdAt?.toDate
                                                        ? new Date(relatedPost.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                        : 'Recent'}
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary mb-1 sm:mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                                                    {relatedPost.title}
                                                </h4>
                                            </div>
                                            <div className="mt-auto pt-1 sm:pt-2 flex items-center text-[10px] sm:text-[11px] font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                                                <span className="hidden sm:inline">Read Now</span>
                                                <span className="sm:hidden">Read</span>
                                                <ArrowRight size={12} className="ml-1" />
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
            <AdminEditButton type="post" id={post.id} />
        </div>
    );
}
