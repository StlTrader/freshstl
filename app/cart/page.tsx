'use client';

import React from 'react';
import { useStore } from '../../contexts/StoreContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Lock } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, clearCart, processCheckout, user } = useStore();
    const router = useRouter();

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                    Looks like you haven't added any 3D models to your cart yet. Browse our collection to find something amazing to print.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                >
                    Browse Store
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-4">
                        {cart.map((item) => (
                            <div key={item.cartItemId} className="bg-white dark:bg-dark-surface rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border flex gap-4 sm:gap-6">
                                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-bg shrink-0">
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ShoppingBag size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                                            <button
                                                onClick={() => removeFromCart(item.cartItemId)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.category}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-xl font-bold text-brand-600 dark:text-brand-400">
                                            ${(item.price / 100).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${(subtotal / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-100 dark:border-dark-border">
                                    <span>Total</span>
                                    <span>${(subtotal / 100).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-social-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                            >
                                Proceed to Checkout
                                <ArrowRight size={20} />
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                <Lock size={12} />
                                <span>Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
