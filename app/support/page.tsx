import React from 'react';
import Link from 'next/link';
import { HelpCircle, Mail, FileText } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Support Center | FreshSTL',
    description: 'Get help with your orders, downloads, and 3D printing questions. Contact our support team or browse our FAQs.',
};

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <HelpCircle size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Support Center</h1>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm text-gray-600 dark:text-dark-text-secondary">
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-brand-50 dark:bg-brand-900/10 p-6 rounded-xl border border-brand-100 dark:border-brand-900/30">
                            <Mail className="w-8 h-8 text-brand-500 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">Email Support</h3>
                            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">Need help with an order or file? Our team usually responds within 24 hours.</p>
                            <a href="mailto:support@freshstl.com" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">support@freshstl.com</a>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                            <FileText className="w-8 h-8 text-gray-500 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">Documentation</h3>
                            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">Check our printing guides for recommended settings for FDM and SLA printers.</p>
                            <button className="text-brand-600 dark:text-brand-400 font-bold hover:underline">View Guides</button>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <h3>Frequently Asked Questions</h3>

                        <div className="space-y-6 mt-6 not-prose">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-dark-text-primary text-lg mb-2">I didn't receive my download link. What do I do?</h4>
                                <p>Check your spam folder first. If it's not there, verify that your transaction was completed in your Dashboard. If problems persist, email us with your Order ID.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-dark-text-primary text-lg mb-2">What software do I need?</h4>
                                <p>You will need a Slicer software (like Cura, PrusaSlicer, or Lychee) to prepare the STL files for your 3D printer.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-dark-text-primary text-lg mb-2">Are the models pre-supported?</h4>
                                <p>Most of our "Miniature" category items come with both unsupported and pre-supported versions. Check the product description for details.</p>
                            </div>
                        </div>
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
