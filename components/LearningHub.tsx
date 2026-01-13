import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../types';
import { ArrowRight, GraduationCap, Calendar, User, Tag } from 'lucide-react';

interface LearningHubProps {
    posts: BlogPost[];
}

export const LearningHub: React.FC<LearningHubProps> = ({ posts }) => {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-social-black dark:text-white font-bold mb-2">
                            <GraduationCap size={24} />
                            <span className="uppercase tracking-wider text-sm">Learning Hub</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Master the Art of 3D Printing
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                            Expert guides, tutorials, and tips to help you get the best results from your printer.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="flex items-center font-bold text-social-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        View All Articles <ArrowRight size={20} className="ml-2" />
                    </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    {posts.map((post, index) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="relative min-w-[260px] sm:min-w-[300px] aspect-[3/4] rounded-2xl overflow-hidden snap-center group cursor-pointer border border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 bg-gray-200 dark:bg-dark-bg">
                                {post.coverImage ? (
                                    <Image
                                        src={post.coverImage}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 300px, 320px"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Tag size={48} className="opacity-20" />
                                    </div>
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            </div>

                            {/* Category Badge */}
                            {post.category && (
                                <div className="absolute top-4 left-4 px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                    {post.category}
                                </div>
                            )}

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-white/80 mb-2 uppercase tracking-wider">
                                    <Calendar size={12} />
                                    <span>
                                        {(() => {
                                            if (!post.createdAt) return 'Recently';
                                            const date = typeof post.createdAt === 'string'
                                                ? new Date(post.createdAt)
                                                : post.createdAt.toDate
                                                    ? post.createdAt.toDate()
                                                    : new Date(post.createdAt);
                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        })()}
                                    </span>
                                </div>

                                <h3 className="text-lg sm:text-xl font-bold leading-tight mb-3 line-clamp-2 group-hover:text-white transition-colors drop-shadow-sm">
                                    {post.title}
                                </h3>

                                <div className="flex items-center gap-2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    Read Story <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
