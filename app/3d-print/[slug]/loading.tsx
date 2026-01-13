import { Skeleton } from '../../../components/LoadingSkeleton';

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-4 pb-32 lg:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb Skeleton */}
                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-8 space-y-6">
                        {/* Main Media Skeleton */}
                        <Skeleton className="w-full aspect-[4/3] lg:aspect-[16/9] rounded-2xl" />

                        {/* Thumbnails Skeleton */}
                        <div className="flex gap-3 overflow-hidden">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="w-20 h-20 rounded-xl flex-shrink-0" />
                            ))}
                        </div>

                        {/* Mobile Info Skeleton */}
                        <div className="lg:hidden space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-40 w-full rounded-2xl" />
                        </div>

                        {/* Tabs Skeleton */}
                        <div className="hidden lg:block bg-white dark:bg-dark-surface rounded-2xl p-8 border border-gray-200 dark:border-dark-border">
                            <div className="flex gap-6 mb-6 border-b border-gray-100 dark:border-dark-border pb-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-4 hidden lg:block">
                        <div className="bg-white dark:bg-dark-surface rounded-2xl p-8 border border-gray-200 dark:border-dark-border space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-5 w-32" />
                            </div>

                            <div className="flex items-end gap-2">
                                <Skeleton className="h-12 w-32" />
                                <Skeleton className="h-6 w-12 mb-2" />
                            </div>

                            <Skeleton className="h-14 w-full rounded-xl" />
                            <Skeleton className="h-14 w-full rounded-xl" />

                            <div className="flex justify-center gap-6">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
