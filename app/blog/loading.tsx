import { BlogCardSkeleton } from '../../components/LoadingSkeleton';

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <div className="flex gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-dark-border rounded-full animate-pulse" />
                    ))}
                </div>
                <div className="h-10 w-72 bg-gray-200 dark:bg-dark-border rounded-xl animate-pulse" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[400px]">
                        <BlogCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    );
}
