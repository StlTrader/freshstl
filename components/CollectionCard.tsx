import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Collection } from '../types';
import { ArrowRight, Layers } from 'lucide-react';

interface CollectionCardProps {
    collection: Collection;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
    return (
        <Link href={`/collections/${collection.id}`} className="group block h-full">
            <div className="relative h-full bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                {/* Image Container */}
                <div className="relative h-64 w-full overflow-hidden">
                    {collection.imageUrl ? (
                        <Image
                            src={collection.imageUrl}
                            alt={collection.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
                            <Layers className="text-gray-300" size={48} />
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/10">
                                Collection
                            </span>
                            <span className="text-xs font-medium text-white/80">
                                {collection.productIds.length} Items
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold mb-2 leading-tight group-hover:text-white transition-colors">
                            {collection.title}
                        </h3>

                        <p className="text-sm text-gray-200 line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            {collection.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                            View Collection <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
