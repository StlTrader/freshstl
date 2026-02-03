import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, Server, RefreshCw } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | FreshSTL',
    description: 'Learn how FreshSTL collects, uses, and protects your personal information in compliance with Tunisian data protection law.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Privacy Policy</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Last updated: February 3, 2026</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm prose dark:prose-invert max-w-none text-gray-600 dark:text-dark-text-secondary">
                    <section className="mb-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-4">
                            <Lock className="w-5 h-5 text-brand-500" />
                            <h3 className="m-0">1. Data Controller and Legal Framework</h3>
                        </div>
                        <p>
                            FreshSTL, operated by Yassine Bouomrine (RNE: 1905292R), acts as the data controller for your personal information. We take data protection seriously and comply with <strong>Tunisian Organic Law No. 2004-63 of July 27, 2004</strong>, relating to the protection of personal data.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-4">
                            <Eye className="w-5 h-5 text-brand-500" />
                            <h3 className="m-0">2. Information We Collect</h3>
                        </div>
                        <p>We collect and process the following categories of data:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Identity Data:</strong> Name, username, and professional identifiers if applicable.</li>
                            <li><strong>Contact Data:</strong> Email address, delivery address, and phone number.</li>
                            <li><strong>Transaction Data:</strong> Details about payments (processed securely via Stripe or Flouci) and products you have purchased.</li>
                            <li><strong>Technical Data:</strong> IP address, login data, browser type, and version, time zone setting, and location (used for regional pricing).</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-4">
                            <Server className="w-5 h-5 text-brand-500" />
                            <h3 className="m-0">3. Purpose and Legal Basis for Processing</h3>
                        </div>
                        <p>We process your data for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Contractual Necessity:</strong> To fulfill your orders and provide access to digital downloads.</li>
                            <li><strong>Legal Obligation:</strong> To maintain accounting records and comply with Tunisian tax and trade regulations.</li>
                            <li><strong>Legitimate Interest:</strong> To improve our platform, prevent fraud, and ensure the security of our services.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-4">
                            <Shield className="w-5 h-5 text-brand-500" />
                            <h3 className="m-0">4. Data Sharing and International Transfers</h3>
                        </div>
                        <p>
                            We host our platform using <strong>Google Firebase</strong>. Your data may be stored on servers located in the European Union or the United States. We ensure that our service providers adhere to strict security standards. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-4">
                            <RefreshCw className="w-5 h-5 text-brand-500" />
                            <h3 className="m-0">5. Your Rights</h3>
                        </div>
                        <p>Under Tunisian law, you have the following rights regarding your personal data:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Right of Access:</strong> You can request a copy of the data we hold about you.</li>
                            <li><strong>Right of Rectification:</strong> You can ask us to correct inaccurate or incomplete data.</li>
                            <li><strong>Right of Objection:</strong> You can object to the processing of your data for marketing or other legitimate interests.</li>
                            <li><strong>Right to Erasure:</strong> You can request the deletion of your data when it is no longer necessary for the purposes for which it was collected.</li>
                        </ul>
                        <p className="mt-4">To exercise these rights, please contact us at <strong>privacy@freshstl.com</strong>.</p>
                    </section>

                    <section className="mb-10">
                        <h3 className="text-gray-900 dark:text-white font-bold mb-4">6. Security</h3>
                        <p>
                            We implement robust technical and organizational measures, including 256-bit SSL encryption, to protect your data. However, no method of transmission over the internet is 100% secure.
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
