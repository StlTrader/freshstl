import React from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy | FreshSTL',
    description: 'Information about how FreshSTL uses cookies and similar technologies to provide, improve, and protect our services.',
};

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <Cookie size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Cookie Policy</h1>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm prose dark:prose-invert max-w-none text-gray-600 dark:text-dark-text-secondary">
                    <p className="lead text-lg mb-6">
                        This Cookie Policy explains how FreshSTL ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website at freshstl.com.
                    </p>

                    <h3>1. What are cookies?</h3>
                    <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

                    <h3>2. Why do we use cookies?</h3>
                    <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.</p>

                    <h3>3. Types of Cookies We Use</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Essential Cookies:</strong> These are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas.</li>
                        <li><strong>Performance and Functionality Cookies:</strong> These are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.</li>
                        <li><strong>Analytics and Customization Cookies:</strong> These collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.</li>
                    </ul>

                    <h3>4. How can I control cookies?</h3>
                    <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.</p>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-border text-sm text-gray-500">
                        Last Updated: January 2026
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
