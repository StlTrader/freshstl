import React from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | FreshSTL',
    description: 'Get in touch with the FreshSTL team. We are here to help with any questions or inquiries you may have.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Contact Us</h1>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm text-gray-600 dark:text-dark-text-secondary">
                    <p className="lead text-lg mb-8">
                        Have a question, suggestion, or just want to say hello? We'd love to hear from you. Choose the best way to reach us below.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-brand-50 dark:bg-brand-900/10 p-6 rounded-xl border border-brand-100 dark:border-brand-900/30 hover:shadow-md transition-all">
                            <Mail className="w-8 h-8 text-brand-500 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">General Inquiries</h3>
                            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">For general questions about our products, licensing, or partnerships.</p>
                            <a href="mailto:hello@freshstl.com" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">hello@freshstl.com</a>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-all">
                            <MessageSquare className="w-8 h-8 text-blue-500 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">Technical Support</h3>
                            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">Issues with downloads, account access, or file integrity.</p>
                            <a href="mailto:support@freshstl.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">support@freshstl.com</a>
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-gray-100 dark:border-dark-border">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" /> Business Address
                        </h3>
                        <address className="not-italic text-gray-600 dark:text-dark-text-secondary">
                            FreshSTL Ltd.<br />
                            123 Maker Street, Suite 404<br />
                            Digital City, DC 10101<br />
                            United Kingdom
                        </address>
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
