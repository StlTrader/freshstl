'use client';

import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { Package, Download, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getProductUrl, getCleanImageUrl } from '../utils/urlHelpers';

export const PurchasesList = () => {
    const { orders, purchases, user, isLoadingPurchases } = useStore();

    if (isLoadingPurchases) {
        return <div className="flex justify-center py-20">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Please log in to view your purchases</h2>
                <Link href="/login" className="text-brand-600 hover:underline">Go to Login</Link>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">No purchases yet</h2>
                <p>Your purchased items will appear here.</p>
                <Link href="/" className="mt-4 inline-block bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition-colors">
                    Browse Store
                </Link>
            </div>
        );
    }

    const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

    const handleDownload = async (productId: string, downloadLink?: string) => {
        try {
            // If it's a direct public URL, just open it
            if (downloadLink && downloadLink.startsWith('http')) {
                window.open(downloadLink, '_blank');
                return;
            }

            setDownloadingId(productId);

            // Otherwise, use the secure download function
            const { getSecureDownloadUrl } = await import('../services/firebaseService');
            const url = await getSecureDownloadUrl(productId);

            window.open(url, '_blank');
        } catch (error: any) {
            console.error("Failed to get download URL", error);
            let msg = "Failed to download file.";
            if (error.message?.includes('permission') || error.code === 'storage/unauthorized') {
                msg = "Permission denied. Please refresh and try again.";
            }
            alert(msg);
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">My Purchases</h1>
            <div className="grid gap-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
                        <div className="bg-gray-50 dark:bg-dark-bg/50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-b border-gray-200 dark:border-dark-border">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">Order ID</p>
                                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-dark-text-primary">{order.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                                <Calendar size={16} />
                                <span>{order.date ? new Date(order.date.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="font-bold text-gray-900 dark:text-dark-text-primary">
                                ${(order.amount / 100).toFixed(2)}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {order.items.map((item, index) => {
                                    // Find matching purchase record to get the correct download link
                                    // We match by productId and transactionId (order.transactionId)
                                    const purchase = purchases.find(p => p.productId === item.id && p.transactionId === order.transactionId);

                                    return (
                                        <div key={index} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                {item.imageUrl && (
                                                    <Link href={getProductUrl({ category: item.category || 'misc', slug: item.slug || item.id })}>
                                                        <Image
                                                            src={getCleanImageUrl(item.imageUrl)}
                                                            alt={item.name}
                                                            width={64}
                                                            height={64}
                                                            className="rounded-lg object-cover bg-gray-100 dark:bg-dark-bg"
                                                        />
                                                    </Link>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-dark-text-primary group-hover:text-brand-600 transition-colors">
                                                        <Link href={getProductUrl({ category: item.category || 'misc', slug: item.slug || item.id })}>{item.name}</Link>
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">${(item.price / 100).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* Download Button */}
                                                <button
                                                    onClick={() => handleDownload(item.id, purchase?.downloadLink)}
                                                    disabled={downloadingId === item.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-surface rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={purchase?.downloadLink ? "Download File" : "Download not available"}
                                                >
                                                    {downloadingId === item.id ? (
                                                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                                    ) : (
                                                        <Download size={16} />
                                                    )}
                                                    <span className="hidden sm:inline">
                                                        {downloadingId === item.id ? 'Preparing...' : 'Download'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
