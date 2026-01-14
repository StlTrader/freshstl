"use client";

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-16 text-center">
            <div className="mb-8 relative">
                <div className="text-9xl font-black text-gray-200 dark:text-dark-surface">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">Page Not Found</div>
                </div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
                >
                    <Home className="mr-2 h-5 w-5" />
                    Back to Home
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-dark-border text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface/80 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Go Back
                </button>
            </div>
        </div>
    );
}
