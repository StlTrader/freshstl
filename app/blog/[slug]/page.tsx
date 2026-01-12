import React from 'react';
import { getPostBySlug, getRelatedPosts } from '../../../services/firebaseService';
import { adminDb } from '../../../services/firebaseAdmin';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Tag, Share2, Clock, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { BlogPost } from '../../../types';
import { AdminEditButton } from '../../../components/AdminEditButton';

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
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
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
            images: post.coverImage ? [post.coverImage] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [post.coverImage] : [],
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
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
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
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
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
                updatedAt: post.updatedAt?.toDate ? post.updatedAt.toDate().toISOString() : post.updatedAt
            };
            const rawRelated = await getRelatedPosts(slug, 3);
            relatedPosts = rawRelated.map(p => ({
                ...p,
                createdAt: p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : p.createdAt,
                updatedAt: p.updatedAt?.toDate ? p.updatedAt.toDate().toISOString() : p.updatedAt
            }));
        }
    }

    if (!post) {
        notFound();
    }

    // Simple Markdown Parser (Enhanced)
    const renderMarkdown = (text: string) => {
        if (!text) return null;

        const lines = text.split('\n');
        return lines.map((line, index) => {
            // Headers
            if (line.startsWith('# ')) return <h1 key={index} className="text-4xl md:text-5xl font-extrabold mt-16 mb-8 text-gray-900 dark:text-dark-text-primary leading-tight tracking-tight">{line.slice(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={index} className="text-3xl md:text-4xl font-bold mt-12 mb-6 text-gray-900 dark:text-dark-text-primary leading-tight tracking-tight border-b border-gray-100 dark:border-dark-border pb-4">{line.slice(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={index} className="text-2xl md:text-3xl font-bold mt-10 mb-5 text-gray-900 dark:text-dark-text-primary leading-tight">{line.slice(4)}</h3>;

            // Lists
            if (line.startsWith('- ')) return <li key={index} className="ml-6 list-disc text-gray-700 dark:text-dark-text-secondary mb-3 pl-2 marker:text-brand-500 text-lg leading-relaxed">{parseInline(line.slice(2))}</li>;
            if (line.startsWith('* ')) return <li key={index} className="ml-6 list-disc text-gray-700 dark:text-dark-text-secondary mb-3 pl-2 marker:text-brand-500 text-lg leading-relaxed">{parseInline(line.slice(2))}</li>;
            if (line.match(/^\d+\. /)) return <li key={index} className="ml-6 list-decimal text-gray-700 dark:text-dark-text-secondary mb-3 pl-2 marker:text-brand-500 marker:font-bold text-lg leading-relaxed">{parseInline(line.replace(/^\d+\. /, ''))}</li>;

            // Blockquotes
            if (line.startsWith('> ')) return <blockquote key={index} className="border-l-4 border-brand-500 pl-8 italic text-xl md:text-2xl text-gray-600 dark:text-dark-text-secondary my-10 py-4 bg-gray-50 dark:bg-dark-surface rounded-r-2xl shadow-sm">{parseInline(line.slice(2))}</blockquote>;

            // Images ![alt](url)
            const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
            if (imgMatch) {
                return (
                    <figure key={index} className="my-12 group">
                        <div className="rounded-3xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-dark-surface relative aspect-video">
                            <Image
                                src={imgMatch[2]}
                                alt={imgMatch[1]}
                                fill
                                className="object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        </div>
                        {imgMatch[1] && (
                            <figcaption className="text-center text-sm font-medium text-gray-500 mt-4 flex items-center justify-center gap-2">
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
            return <p key={index} className="mb-6 text-lg md:text-xl text-gray-700 dark:text-dark-text-secondary leading-relaxed font-serif-safe">{parseInline(line)}</p>;
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
        image: post.coverImage ? [post.coverImage] : [],
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
            <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-dark-surface z-50">
                <div className="h-full bg-gradient-to-r from-brand-500 to-purple-600 w-1/3 animate-pulse"></div>
            </div>

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation */}
                <nav className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Link href="/blog" className="group inline-flex items-center text-gray-500 hover:text-brand-600 font-medium transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mr-3 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 transition-colors shadow-sm">
                            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-sm uppercase tracking-wider font-bold">Back to Blog</span>
                    </Link>

                    <div className="flex gap-3">
                        <button
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors"
                            title="Share this article"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </nav>

                {/* Header */}
                <header className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {post.category && (
                            <span className="px-5 py-2 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/30 dark:to-purple-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-bold uppercase tracking-widest shadow-sm border border-brand-100 dark:border-brand-800">
                                {post.category}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-dark-text-primary mb-10 leading-[1.1] tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-gray-500 dark:text-dark-text-secondary border-y border-gray-100 dark:border-dark-border py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 ring-4 ring-white dark:ring-dark-bg">
                                <User size={22} />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Written by</div>
                                <div className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">{post.authorName}</div>
                            </div>
                        </div>

                        <div className="w-px h-12 bg-gray-200 dark:bg-dark-border hidden sm:block"></div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-dark-surface flex items-center justify-center text-gray-500 dark:text-dark-text-secondary border border-gray-100 dark:border-dark-border">
                                <Calendar size={22} />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Published on</div>
                                <div className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">
                                    {post.createdAt?.toDate
                                        ? new Date(post.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'Unknown'}
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-12 bg-gray-200 dark:bg-dark-border hidden sm:block"></div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-dark-surface flex items-center justify-center text-gray-500 dark:text-dark-text-secondary border border-gray-100 dark:border-dark-border">
                                <Clock size={22} />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Read Time</div>
                                <div className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">5 min read</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="mb-20 -mx-4 sm:-mx-0 rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-black/50 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 relative aspect-[21/9]">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-img:rounded-3xl prose-img:shadow-xl">
                    {renderMarkdown(post.content)}
                </div>

                {/* Footer / Tags */}
                <div className="mt-24 pt-12 border-t border-gray-200 dark:border-dark-border">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-sm">
                            <Tag size={18} />
                            <span>Related Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {post.tags.map(tag => (
                                <span key={tag} className="px-5 py-2 bg-gray-50 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary rounded-xl text-sm font-bold hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-all cursor-pointer border border-gray-100 dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-800">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Posts Section */}
                {relatedPosts.length > 0 && (
                    <div className="mt-32 pt-16 border-t border-gray-200 dark:border-dark-border">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Read Next</h3>
                            <Link href="/blog" className="hidden sm:flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
                                View all posts <ArrowRight size={20} />
                            </Link>
                        </div>

                        <div className="grid gap-10 md:grid-cols-3">
                            {relatedPosts.map((relatedPost) => (
                                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block h-full">
                                    <article className="bg-white dark:bg-dark-surface rounded-3xl overflow-hidden border border-gray-100 dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 h-full flex flex-col">
                                        <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-dark-bg relative">
                                            {relatedPost.coverImage ? (
                                                <Image
                                                    src={relatedPost.coverImage}
                                                    alt={relatedPost.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-dark-text-secondary">
                                                    <Tag size={48} className="opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-dark-bg/80 backdrop-blur-md rounded-full text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide shadow-sm">
                                                {relatedPost.category || 'Article'}
                                            </div>
                                        </div>
                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                                {relatedPost.createdAt?.toDate
                                                    ? new Date(relatedPost.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    : 'Recent'}
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-tight">
                                                {relatedPost.title}
                                            </h4>
                                            <p className="text-gray-500 dark:text-dark-text-secondary text-sm line-clamp-3 mb-6 leading-relaxed">
                                                {relatedPost.excerpt}
                                            </p>
                                            <div className="mt-auto flex items-center text-sm font-bold text-brand-600 dark:text-brand-400 group-hover:underline decoration-2 underline-offset-4">
                                                Read Article <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
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
