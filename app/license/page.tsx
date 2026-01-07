import React from 'react';
import Link from 'next/link';
import { Scale, CheckCircle, XCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'License Agreement | FreshSTL',
    description: 'Understand the usage rights for our digital 3D models. Read our standard license agreement for personal and commercial use.',
};

export default function LicensePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <Scale size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">License Agreement</h1>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm text-gray-600 dark:text-dark-text-secondary">
                    <p className="lead text-lg mb-6">All digital files purchased from freshstl.com are subject to the following standard license agreement.</p>

                    <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                            <h4 className="text-green-800 dark:text-green-300 font-bold flex items-center gap-2 mb-4">
                                <CheckCircle size={20} /> You Can
                            </h4>
                            <ul className="space-y-3 text-sm text-green-900 dark:text-green-100">
                                <li className="flex gap-2"><span className="text-green-500">•</span> Print the files for personal use unlimited times.</li>
                                <li className="flex gap-2"><span className="text-green-500">•</span> Resize or modify the files for your personal projects.</li>
                                <li className="flex gap-2"><span className="text-green-500">•</span> Post photos/videos of your prints on social media.</li>
                            </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                            <h4 className="text-red-800 dark:text-red-300 font-bold flex items-center gap-2 mb-4">
                                <XCircle size={20} /> You Cannot
                            </h4>
                            <ul className="space-y-3 text-sm text-red-900 dark:text-red-100">
                                <li className="flex gap-2"><span className="text-red-500">•</span> Sell, share, or distribute the digital files.</li>
                                <li className="flex gap-2"><span className="text-red-500">•</span> Sell physical prints of the models (unless you hold a Commercial Merchant tier).</li>
                                <li className="flex gap-2"><span className="text-red-500">•</span> Upload the files to other file-sharing platforms or torrent sites.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <h3>Commercial Use</h3>
                        <p>This standard license is for <strong>Private Use Only</strong>. If you wish to sell 3D prints of our models, you must subscribe to our Commercial Merchant Tier (coming soon) or contact the individual artist for a separate commercial license.</p>

                        <h3>Copyright</h3>
                        <p>All designs and digital files remain the intellectual property of freshstl.com and the respective artists. Purchasing a file does not transfer copyright ownership.</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-brand-600 dark:text-brand-400 font-medium hover:underline inline-flex items-center gap-2"
                    >
                        &larr; Return to Store
                    </Link>
                </div>
            </div>
        </div>
    );
}
