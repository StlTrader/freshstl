import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | FreshSTL',
    description: 'Read our Terms of Service to understand the rules and regulations for using FreshSTL and purchasing our digital products.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <FileText size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Terms of Service</h1>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm prose dark:prose-invert max-w-none text-gray-600 dark:text-dark-text-secondary">
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using freshstl.com, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, and others who access or use the Service.</p>

                    <h3>2. Digital Products</h3>
                    <p>All products sold on freshstl.com are digital files (STL/GLB format) intended for 3D printing. No physical products will be shipped. Access to purchased files is granted immediately upon successful payment.</p>

                    <h3>3. Refund Policy</h3>
                    <p>Due to the nature of digital goods, <strong>all sales are final</strong>. We do not offer refunds once the files have been downloaded or accessed, except in cases where the file is technically defective and cannot be fixed by our support team.</p>

                    <h3>4. User Accounts</h3>
                    <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>

                    <h3>5. Modifications</h3>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-border text-sm text-gray-500">
                        Last Updated: December 2025
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
