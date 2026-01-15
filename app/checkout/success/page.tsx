'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '../../../contexts/StoreContext';

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('paymentId');
    const { clearCart } = useStore();

    // Ensure cart is cleared (redundant safety check)
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-surface p-8 sm:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100 dark:border-dark-border">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Confirmed!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                    Thank you for your purchase. Your files are now available in your library.
                </p>

                {paymentId && (
                    <div className="mb-8 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-500 dark:text-gray-400">
                        Transaction ID: <span className="font-mono text-gray-900 dark:text-white">{paymentId}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <Link
                        href="/purchases"
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Download className="w-5 h-5" />
                        Go to My Library
                    </Link>

                    <Link
                        href="/"
                        className="w-full bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-900 dark:text-white border border-gray-200 dark:border-dark-border py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
                    >
                        Continue Shopping
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
