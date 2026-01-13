import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../types';
import { ArrowRight, BookOpen } from 'lucide-react';

interface InsightCardCardProps {
    post: BlogPost;
}

export const InsightCard: React.FC<InsightCardCardProps> = ({ post }) => {
    return (
        <Link href={`/blog/${post.slug}`} className="group relative block h-full min-h-[240px] md:min-h-[320px] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-dark-surface shadow-sm transition-all hover:shadow-xl hover:scale-[1.02] border border-gray-100 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600">
            {/* Background Image */}
            <div className="absolute inset-0 h-full w-full">
                {post.coverImage ? (
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400">
                        <BookOpen size={48} />
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 text-white">
                <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] md:text-xs font-medium backdrop-blur-md border border-white/10">
                        Insight
                    </span>
                    {post.category && (
                        <span className="text-[10px] md:text-xs font-medium text-gray-300 uppercase tracking-wide">
                            {post.category}
                        </span>
                    )}
                </div>

                <h3 className="mb-1 md:mb-2 text-lg md:text-xl font-bold leading-tight text-white drop-shadow-sm line-clamp-2">
                    {post.title}
                </h3>

                <div className="flex items-center text-xs md:text-sm font-medium text-white/90 opacity-100 md:opacity-0 md:transform md:translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    Read Article <ArrowRight size={14} className="ml-1 md:ml-2" />
                </div>
            </div>
        </Link>
    );
};
