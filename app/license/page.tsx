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

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                    <p className="lead text-lg mb-8 uppercase tracking-widest text-xs font-bold text-gray-400">Standard License Agreement</p>
                    <p className="mb-6">All digital assets and physical goods are protected by intellectual property laws. By purchasing from freshstl.com, you agree to the following terms.</p>

                    <div className="grid md:grid-cols-2 gap-8 my-10 not-prose">
                        <div className="bg-green-50/50 dark:bg-green-900/10 p-8 rounded-2xl border border-green-100 dark:border-green-800/30">
                            <h4 className="text-green-800 dark:text-green-300 font-bold flex items-center gap-2 mb-6">
                                <CheckCircle size={24} className="text-green-500" /> Permitted Use
                            </h4>
                            <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex gap-3 items-start"><span className="text-green-500 font-bold mt-1">✔</span> 3D print the files for personal, non-commercial use an unlimited number of times.</li>
                                <li className="flex gap-3 items-start"><span className="text-green-500 font-bold mt-1">✔</span> Modify or adapt the models for your own personal projects.</li>
                                <li className="flex gap-3 items-start"><span className="text-green-500 font-bold mt-1">✔</span> Showcase your printed work on social media (Attribution to FreshSTL is appreciated).</li>
                            </ul>
                        </div>
                        <div className="bg-red-50/50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-100 dark:border-red-800/30">
                            <h4 className="text-red-800 dark:text-red-300 font-bold flex items-center gap-2 mb-6">
                                <XCircle size={24} className="text-red-500" /> Prohibited Use
                            </h4>
                            <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex gap-3 items-start"><span className="text-red-500 font-bold mt-1">✖</span> Redistribute, resell, share, or sub-license the digital files or any modified version.</li>
                                <li className="flex gap-3 items-start"><span className="text-red-500 font-bold mt-1">✖</span> Sell physical prints of the designs without an active Commercial Merchant License.</li>
                                <li className="flex gap-3 items-start"><span className="text-red-500 font-bold mt-1">✖</span> Use any part of our assets to train AI models or in NFT-related projects.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">1. Distribution of Digital Files</h3>
                            <p>Digital files are licensed to the individual purchaser only. You may not upload these files to public repositories, file-sharing platforms, or local networks for multi-user access.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">2. Commercial & Merchant Rights</h3>
                            <p>The Standard License is strictly <strong>non-commercial</strong>. If you intend to sell physical 3D prints of our work, you must obtain a Commercial License. Please contact us at hello@freshstl.com for merchant inquiry details.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">3. Physical Goods Intellectual Property</h3>
                            <p>For customers purchasing physical 3D prints, the ownership of the physical object is transferred, but all intellectual property rights and design copyrights remain with FreshSTL (Yassine Bouomrine). You may not use the physical item to create molds, casts, or scans for digital reproduction.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">4. Governing Law</h3>
                            <p>This License is governed by the laws of Tunisia, specifically Law No. 94-36 of February 24, 1994, relating to literary and artistic property.</p>
                        </section>
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
