'use client';

import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { Package, Download, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const PurchasesList = () => {
    const { orders, user, isLoadingPurchases } = useStore();

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
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            {item.imageUrl && (
                                                <Link href={item.slug ? `/3d-print/${item.slug}` : `/product/${item.id}`}>
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="rounded-lg object-cover bg-gray-100 dark:bg-dark-bg"
                                                    />
                                                </Link>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary group-hover:text-brand-600 transition-colors">
                                                    <Link href={item.slug ? `/3d-print/${item.slug}` : `/product/${item.id}`}>{item.name}</Link>
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">${(item.price / 100).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Download Button - In a real app, this would link to a secure download URL */}
                                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-surface rounded-lg text-sm font-medium transition-colors">
                                                <Download size={16} />
                                                <span className="hidden sm:inline">Download</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
