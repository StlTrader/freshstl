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
                    <p className="text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">General Terms and Conditions of Sale (GTC)</p>

                    <h3>1. Object and Seller Identity</h3>
                    <p>
                        These terms govern the sale of 3D models (digital) and 3D prints (physical goods) via freshstl.com. <br />
                        <strong>Seller:</strong> Yassine Bouomrine (Auto-entrepreneur)<br />
                        <strong>Address:</strong> Near Abassi St, Bir Lahmar, 3212 Tataouine, Tunisia<br />
                        <strong>Unique Identifier (RNE):</strong> 1905292R
                    </p>

                    <h3>2. Products</h3>
                    <p>
                        FreshSTL offers:
                        <ul className="list-disc pl-6">
                            <li><strong>Digital Goods:</strong> 3D files (STL/GLB format) for personal or commercial use (as specified by the license).</li>
                            <li><strong>Physical Goods:</strong> On-demand 3D printed objects.</li>
                        </ul>
                    </p>

                    <h3>3. Pricing and Payments</h3>
                    <p>
                        Prices are displayed in the applicable currency. All payments are securely processed through <strong>Flouci</strong>.
                        We support <strong>Visa, Mastercard, and Click to Pay</strong>.
                        Access to digital files is granted immediately upon successful payment. Physical items will be processed after payment confirmation.
                    </p>

                    <h3>4. Delivery</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Digital Files:</strong> Available via direct download link in your account and via email.</li>
                        <li><strong>Physical Prints:</strong> Shipped via local Tunisian couriers from Bir Lahmar, Tataouine. Estimated delivery times are provided at checkout based on production time and carrier schedules.</li>
                    </ul>

                    <h3>5. Right of Withdrawal and Refunds (Tunisian Law No. 2000-83)</h3>
                    <p>In accordance with Article 30 and 31 of Law No. 2000-83:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Digital Goods:</strong> By commencing the download or accessing the file, you expressly waive your right of withdrawal. All digital sales are final.</li>
                        <li><strong>Personalized Physical Prints:</strong> Products made to customer specifications or clearly personalized are exempt from the right of withdrawal and are non-refundable unless defective.</li>
                        <li><strong>Standard Physical Prints:</strong> Customers have a period of 10 working days from receipt to exercise their right of withdrawal for non-personalized items.</li>
                        <li><strong>Defects:</strong> If a file is technicaly defective or a physical item arrives damaged, we will offer a replacement or refund within 30 days.</li>
                    </ul>

                    <h3>6. Intellectual Property</h3>
                    <p>Purchase of a digital model does not transfer ownership of the intellectual property. Users must comply with the specific license attached to each model (Standard, Royalty-Free, or Commercial).</p>

                    <h3>7. Governing Law</h3>
                    <p>These terms and conditions are governed by and construed in accordance with the laws of Tunisia. Any disputes shall be subject to the exclusive jurisdiction of the Tunisian courts.</p>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-border text-sm text-gray-500">
                        Last Updated: February 2025
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
