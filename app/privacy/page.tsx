import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | FreshSTL',
    description: 'Learn how FreshSTL collects, uses, and protects your personal information. We value your privacy and data security.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Privacy Policy</h1>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm prose dark:prose-invert max-w-none text-gray-600 dark:text-dark-text-secondary">
                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This may include:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Name and email address</li>
                        <li>Transaction history (we do not store full credit card numbers)</li>
                        <li>Usage data and download history</li>
                    </ul>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send you technical notices, updates, and support messages</li>
                    </ul>

                    <h3>3. Data Storage</h3>
                    <p>We use Google Firebase to securely store your user data and files. By using our service, you acknowledge that your data may be stored on servers located outside of your country of residence.</p>

                    <h3>4. Cookies</h3>
                    <p>We use local storage and cookies to maintain your login session and shopping cart preferences. You can control cookies through your browser settings.</p>

                    <h3>5. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at privacy@freshstl.com.</p>
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
