'use client';

import React, { useState } from 'react';
import { X, Trash2, CreditCard, Loader2, AlertCircle, Ticket, Check, ArrowLeft, Lock } from 'lucide-react';
import * as firebaseService from '../services/firebaseService';
import { useStore } from '../contexts/StoreContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthBarrier } from './AuthBarrier';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, user } = useStore();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthBarrier, setShowAuthBarrier] = useState(false);

  // Prevent body scroll when cart is open
  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isCartOpen]);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal; // Discounts will be handled in checkout page

  const handleCheckout = () => {
    if (!user) {
      setShowAuthBarrier(true);
    } else {
      setIsCartOpen(false);
      router.push('/checkout');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthBarrier(false);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsCartOpen(false)}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-dark-surface border-l border-gray-200 dark:border-dark-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Your Cart
              <span className="bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full font-medium">
                {cart.length}
              </span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg rounded-full flex items-center justify-center">
                  <CreditCard className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto">
                    Looks like you haven't added any 3D models yet.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
                >
                  Start Browsing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="group relative flex gap-4 bg-white dark:bg-dark-bg p-3 rounded-2xl border border-gray-100 dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-900/50 transition-all shadow-sm hover:shadow-md">
                    <Link href={`/3d-print/${item.slug}`} onClick={() => setIsCartOpen(false)} className="shrink-0">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-surface">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.category}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-lg text-brand-600 dark:text-brand-400">
                          ${(item.price / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] z-20">
              {!user && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl flex gap-3 items-start">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
                    <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    <span className="font-semibold">Sign in</span> to sync your library across devices and access downloads anytime.
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xl font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-dark-border">
                  <span>Total</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Secure Checkout <Lock className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Check className="w-3 h-3" /> 100% Secure Payment via Stripe
              </p>
            </div>
          )}
        </div>
      </div>

      <AuthBarrier
        isOpen={showAuthBarrier}
        onClose={() => setShowAuthBarrier(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};