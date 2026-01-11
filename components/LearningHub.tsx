import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../types';
import { ArrowRight, GraduationCap } from 'lucide-react';

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
                        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold mb-2">
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
                        className="flex items-center font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                    >
                        View All Articles <ArrowRight size={20} className="ml-2" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                            <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-dark-border hover:-translate-y-1">
                                <div className="relative h-48 w-full overflow-hidden">
                                    {post.coverImage ? (
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-dark-bg" />
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 dark:text-white">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-1">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center text-brand-600 dark:text-brand-400 font-bold text-sm mt-auto">
                                        Read More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
