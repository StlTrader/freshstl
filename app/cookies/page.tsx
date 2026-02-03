import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Info, Settings, MousePointer2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy | FreshSTL',
    description: 'Understand how FreshSTL uses cookies and local storage to provide a seamless 3D model marketplace experience.',
};

export default function CookiePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <Info size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Cookie Policy</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Last updated: February 3, 2026</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm prose dark:prose-invert max-w-none text-gray-600 dark:text-dark-text-secondary">
                    <section className="mb-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-4">
                            <ShieldCheck className="w-5 h-5 text-brand-500" />
                            <h3 className="m-0">1. What are Cookies?</h3>
                        </div>
                        <p>
                            Cookies are small text files stored on your device when you visit a website. They help the site recognize you and remember your preferences. On FreshSTL, we also use <strong>local storage</strong> to provide a faster and more private experience.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-4">
                            <Settings className="w-5 h-5 text-brand-500" />
                            <h3 className="m-0">2. Types of Cookies We Use</h3>
                        </div>
                        <p>We only use essential technologies required for the site to function:</p>
                        <ul className="list-disc pl-6 space-y-4">
                            <li>
                                <strong>Strictly Necessary:</strong> These are required for the site to function. We use them for:
                                <ul className="list-circle pl-6 mt-2">
                                    <li>Maintaining your user session/login status (Firebase Auth).</li>
                                    <li>Saving your shopping cart items (Local Storage).</li>
                                    <li>Remembering your light/dark mode preference.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Functional & Analytics:</strong> We may use basic analytics to understand which products are popular, but we do not use third-party tracking cookies or pixel tags for advertising.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-4">
                            <MousePointer2 className="w-5 h-5 text-brand-500" />
                            <h3 className="m-0">3. Managing Your Preferences</h3>
                        </div>
                        <p>
                            Most browsers allow you to block or delete cookies through their settings. However, if you disable all cookies, you will not be able to log in or complete a purchase on FreshSTL.
                        </p>
                        <p className="mt-4">
                            To learn more about how to manage cookies, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">allaboutcookies.org</a>.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h3 className="text-gray-900 dark:text-white font-bold mb-4">4. Updates to this Policy</h3>
                        <p>
                            We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons.
                        </p>
                    </section>
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
