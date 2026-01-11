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
        <Link href={`/blog/${post.slug}`} className="group relative block h-full min-h-[320px] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-dark-surface shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md border border-white/10">
                        Insight
                    </span>
                    {post.category && (
                        <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                            {post.category}
                        </span>
                    )}
                </div>

                <h3 className="mb-2 text-xl font-bold leading-tight text-white drop-shadow-sm line-clamp-2">
                    {post.title}
                </h3>

                <div className="flex items-center text-sm font-medium text-white/90 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    Read Article <ArrowRight size={16} className="ml-2" />
                </div>
            </div>
        </Link>
    );
};
