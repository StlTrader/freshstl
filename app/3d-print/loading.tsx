import { ProductCardSkeleton } from '../../components/LoadingSkeleton';

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
                {/* Search Bar Skeleton */}
                <div className="h-16 bg-gray-100 dark:bg-dark-surface rounded-2xl animate-pulse" />

                {/* Grid Skeleton */}
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-6 space-y-3 md:space-y-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid">
                            <ProductCardSkeleton />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
