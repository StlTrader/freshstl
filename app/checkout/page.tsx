'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, ShieldCheck, CreditCard, User, Mail, MapPin, Phone, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { StripeCheckout } from '../../components/StripeCheckout';
import * as firebaseService from '../../services/firebaseService';
import { SUPPORTED_COUNTRIES } from '../../constants';

interface CustomerInfo {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
}

export default function CheckoutPage() {
    const { cart, user, processCheckout, clearCart } = useStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: 'US'
    });

    useEffect(() => {
        // Redirect if cart is empty
        if (cart.length === 0) {
            router.push('/cart'); // Or back to store
            return;
        }

        // Redirect if not logged in (double check)
        if (!user) {
            // Ideally show auth modal or redirect to login
            // For now, let's assume CartDrawer handled this, but if they land here directly:
            // router.push('/'); 
            // Actually, let's just let them fill it out if we want to support guest checkout eventually, 
            // but the requirement says "No Guest Purchase".
            // So we should redirect or show a "Please login" state.
            // But since we have the AuthBarrier in CartDrawer, we can assume they might be logged in.
            // If not, we can show a login prompt here too or redirect.
            // Let's load profile if user exists.
        }

        if (user) {
            const loadProfile = async () => {
                try {
                    const profile = await firebaseService.getUserProfile(user.uid);
                    if (profile) {
                        setCustomerInfo(prev => ({
                            ...prev,
                            ...profile,
                            email: user.email || profile.email || prev.email,
                            fullName: user.displayName || profile.fullName || prev.fullName
                        }));
                    }
                } catch (e) {
                    console.error("Failed to load profile", e);
                } finally {
                    setIsLoading(false);
                }
            };
            loadProfile();
        } else {
            setIsLoading(false);
        }
    }, [user, cart, router]);

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal; // Add tax/shipping logic here if needed

    const handleStripeSuccess = async (paymentIntentId: string, paymentMethod?: any) => {
        try {
            const cardBrand = paymentMethod?.card?.brand || 'unknown';
            const cardLast4 = paymentMethod?.card?.last4 || '0000';

            await processCheckout(
                cart,
                paymentIntentId,
                0, // discount amount
                customerInfo,
                {
                    cardBrand,
                    cardLast4
                }
            );
            clearCart();
            router.push('/purchases');
        } catch (e) {
            console.error("Checkout processing failed", e);
            setError("Payment succeeded but order processing failed. Please contact support.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <Lock className="w-12 h-12 text-brand-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in Required</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Please sign in to complete your purchase and secure your downloads.</p>
                    <button
                        onClick={() => router.push('/')} // Or open auth modal if we could trigger it globally
                        className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors"
                    >
                        Back to Store
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Store
                    </Link>
                    <div className="ml-auto flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full text-sm font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        Secure Checkout
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Billing Details */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">1</div>
                                Billing Details
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={customerInfo.fullName}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                value={customerInfo.email}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                                                placeholder="john@example.com"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={customerInfo.address}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                                            placeholder="123 Main St"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">City</label>
                                        <input
                                            type="text"
                                            value={customerInfo.city}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                                            placeholder="New York"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Zip Code</label>
                                        <input
                                            type="text"
                                            value={customerInfo.zipCode}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                                            placeholder="10001"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Country</label>
                                    <select
                                        value={customerInfo.country}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    >
                                        {SUPPORTED_COUNTRIES.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary (Mobile only, usually hidden on desktop but let's keep it simple or maybe just list items) */}
                        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Items</h3>
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.cartItemId} className="flex gap-4">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-bg shrink-0">
                                            {item.imageUrl && (
                                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                                            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-1">${(item.price / 100).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment & Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 sm:p-8 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">2</div>
                                Payment Method
                            </h2>

                            <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                                <div className="flex justify-between text-sm mb-2 text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${(subtotal / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-dark-border">
                                    <span>Total</span>
                                    <span>${(total / 100).toFixed(2)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <StripeCheckout
                                amount={total}
                                onSuccess={handleStripeSuccess}
                                onCancel={() => { }}
                                customerInfo={customerInfo}
                            />

                            <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale">
                                {/* Icons for payment methods */}
                                <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                <div className="h-8 w-12 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
