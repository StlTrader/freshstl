import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-dark-border rounded-xl ${className}`} />
    );
};

export const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border h-full flex flex-col">
            <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-dark-border animate-pulse" />
            <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                <div className="mt-auto flex justify-between items-center pt-2">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-dark-border rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export const BlogCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-dark-surface rounded-3xl overflow-hidden border border-gray-100 dark:border-dark-border h-full flex flex-col">
            <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-dark-border animate-pulse" />
            <div className="p-8 flex-1 flex flex-col gap-4">
                <div className="h-3 w-1/3 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
            </div>
        </div>
    );
};
