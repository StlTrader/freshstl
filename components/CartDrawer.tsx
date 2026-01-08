'use client';

import React, { useState } from 'react';
import { X, Trash2, CreditCard, Loader2, AlertCircle, Ticket, Check, ArrowLeft, User, Mail, MapPin, Phone } from 'lucide-react';
import { getStripeConfig } from '../services/paymentService';
import * as firebaseService from '../services/firebaseService';
import { StripeCheckout } from './StripeCheckout';
import { SUPPORTED_COUNTRIES } from '../constants';
import { useStore } from '../contexts/StoreContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CheckoutStep = 'cart' | 'customer-info' | 'payment';

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, clearCart, user, processCheckout } = useStore();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');

  // Auth State for Checkout
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'US'
  });

  React.useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        const profile = await firebaseService.getUserProfile(user.uid);
        if (profile) {
          setCustomerInfo(prev => ({
            ...prev,
            ...profile,
            email: user.email || profile.email || prev.email,
            fullName: user.displayName || profile.fullName || prev.fullName
          }));
        }
      };
      loadProfile();
    }
  }, [user]);

  // Prevent body scroll when cart is open
  React.useEffect(() => {
    if (isCartOpen) {
      // Lock scroll on both body and html to ensure it works across browsers
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
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponStatus('validating');
    const coupon = await firebaseService.validateCoupon(couponCode);
    if (coupon) {
      setDiscountPercent(coupon.discountPercent);
      setCouponStatus('valid');
    } else {
      setDiscountPercent(0);
      setCouponStatus('invalid');
    }
  };

  const handleProceedToInfo = () => {
    setCheckoutStep('customer-info');
  };

  const handleProceedToPayment = async () => {
    // Validate customer info
    if (!customerInfo.email) {
      setError('Email is required.');
      return;
    }

    // If not logged in, require password
    if (!user && !password) {
      setError('Password is required to create an account.');
      return;
    }

    if (!isLoginMode && !user && !customerInfo.fullName) {
      setError('Full Name is required.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Handle Auth if not logged in
      if (!user) {
        if (isLoginMode) {
          await firebaseService.login(customerInfo.email, password);
        } else {
          await firebaseService.register(customerInfo.email, password, customerInfo.fullName);
        }
      }

      const config = getStripeConfig();
      // For Extension, we only need the public key on the client
      if (config.publicKey) {
        setCheckoutStep('payment');
      } else {
        setError("Stripe is not configured. Please check your environment variables.");
      }
    } catch (e: any) {
      console.error("Auth failed:", e);
      setError(e.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (checkoutStep === 'payment') {
      setCheckoutStep('customer-info');
    } else if (checkoutStep === 'customer-info') {
      setCheckoutStep('cart');
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string, paymentMethod?: any) => {
    try {
      const cardBrand = paymentMethod?.card?.brand || 'unknown';
      const cardLast4 = paymentMethod?.card?.last4 || '0000';

      await processCheckout(
        cart,
        paymentIntentId,
        discountAmount,
        customerInfo,
        {
          cardBrand,
          cardLast4
        }
      );
      clearCart();
      resetCheckout();
      setIsCartOpen(false);

      // Redirect to purchases or show success modal (handled by StoreContext or App)
      // For now, let's redirect to purchases if logged in
      router.push('/purchases');

    } catch (e) {
      console.error("Checkout processing failed", e);
      setError("Payment succeeded but order processing failed. Please contact support.");
    }
  };

  const resetCheckout = () => {
    setDiscountPercent(0);
    setCouponCode('');
    setCouponStatus('idle');
    setCheckoutStep('cart');
    setCustomerInfo({ fullName: '', email: '', phone: '', address: '', city: '', zipCode: '', country: 'US' });
  };

  const getStepTitle = () => {
    switch (checkoutStep) {
      case 'cart': return 'Your Cart';
      case 'customer-info': return 'Billing Details';
      case 'payment': return 'Payment';
    }
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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
              {checkoutStep !== 'cart' && (
                <button onClick={handleBack} className="mr-2 hover:bg-gray-100 dark:hover:bg-dark-surface/80 p-1 rounded-full">
                  <ArrowLeft size={20} />
                </button>
              )}
              {getStepTitle()}
              {checkoutStep === 'cart' && <span className="text-brand-600 dark:text-brand-400 text-sm font-normal">({cart.length} items)</span>}
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-dark-text-primary">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Indicator */}
          {cart.length > 0 && (
            <div className="px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${checkoutStep === 'cart' ? 'bg-brand-600 text-white' : 'bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'}`}>1</div>
                <div className={`flex-1 h-1 rounded ${checkoutStep !== 'cart' ? 'bg-brand-500' : 'bg-gray-200 dark:bg-dark-border'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${checkoutStep === 'customer-info' ? 'bg-brand-600 text-white' : checkoutStep === 'payment' ? 'bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'bg-gray-200 dark:bg-dark-border text-gray-500'}`}>2</div>
                <div className={`flex-1 h-1 rounded ${checkoutStep === 'payment' ? 'bg-brand-500' : 'bg-gray-200 dark:bg-dark-border'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${checkoutStep === 'payment' ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-500'}`}>3</div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* CART STEP */}
            {checkoutStep === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-dark-text-secondary space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-dark-surface rounded-full">
                      <CreditCard className="w-8 h-8 opacity-50" />
                    </div>
                    <p>Your cart is empty.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Browse Store
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.cartItemId} className="bg-gray-50 dark:bg-dark-surface rounded-lg p-3 flex gap-3 animate-in slide-in-from-right-4 duration-300 border border-gray-100 dark:border-dark-border">
                      <Link href={`/3d-print/${item.slug}`} onClick={() => setIsCartOpen(false)}>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-md bg-gray-200 dark:bg-dark-bg"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-md bg-gray-200 dark:bg-dark-bg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary line-clamp-1">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary line-clamp-1">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* CUSTOMER INFO STEP */}
            {checkoutStep === 'customer-info' && (
              <div className="animate-in slide-in-from-right duration-300 space-y-4">

                {!user && (
                  <div className="flex gap-2 p-1 bg-gray-100 dark:bg-dark-surface rounded-lg mb-4">
                    <button
                      onClick={() => setIsLoginMode(false)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLoginMode ? 'bg-white dark:bg-dark-surface shadow text-brand-600 dark:text-brand-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-secondary'}`}
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => setIsLoginMode(true)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLoginMode ? 'bg-white dark:bg-dark-surface shadow text-brand-600 dark:text-brand-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-secondary'}`}
                    >
                      Log In
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {(!isLoginMode || user) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={customerInfo.fullName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                          placeholder="John Doe"
                          disabled={!!user}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        placeholder="john@example.com"
                        disabled={!!user}
                      />
                    </div>
                  </div>

                  {!user && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Password *</label>
                      <div className="relative">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        placeholder="123 Main St, Apt 4"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">City</label>
                      <input
                        type="text"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Zip Code</label>
                      <input
                        type="text"
                        value={customerInfo.zipCode}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Country</label>
                    <select
                      value={customerInfo.country}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-dark-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
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
            )}

            {/* PAYMENT STEP */}
            {checkoutStep === 'payment' && (
              <div className="animate-in slide-in-from-right duration-300">
                <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-2">Billing to:</p>
                  <p className="font-medium text-gray-900 dark:text-dark-text-primary">{customerInfo.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{customerInfo.email}</p>
                  {customerInfo.address && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{customerInfo.address}, {customerInfo.city} {customerInfo.zipCode}</p>}
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 dark:text-dark-text-primary font-medium">${(subtotal / 100).toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm mb-2 text-green-600">
                      <span>Discount</span>
                      <span>-${(discountAmount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-dark-border pt-2 mt-2">
                    <span className="text-gray-900 dark:text-dark-text-primary">Total</span>
                    <span className="text-brand-600 dark:text-brand-400">${(total / 100).toFixed(2)}</span>
                  </div>
                </div>

                {total > 0 ? (
                  <StripeCheckout
                    amount={total}
                    onSuccess={handleStripeSuccess}
                    onCancel={() => setCheckoutStep('customer-info')}
                    customerInfo={customerInfo}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                      <Check size={16} /> Order is free! No payment required.
                    </div>
                    <button
                      onClick={() => handleStripeSuccess('free_order', { card: { brand: 'none', last4: '0000' } })}
                      disabled={isProcessing}
                      className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 dark:disabled:bg-brand-900 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/30 dark:shadow-brand-900/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                        </>
                      ) : (
                        'Complete Order'
                      )}
                    </button>
                    <button
                      onClick={() => setCheckoutStep('customer-info')}
                      className="w-full text-gray-500 hover:text-gray-900 dark:hover:text-dark-text-primary text-sm"
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {checkoutStep === 'cart' && cart.length > 0 && (
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Coupon Code Input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase mb-1">Coupon Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponStatus('idle'); }}
                      className={`w-full bg-white dark:bg-dark-bg border rounded-lg px-3 py-2 text-sm outline-none transition-colors uppercase ${couponStatus === 'invalid' ? 'border-red-500 text-red-600' : couponStatus === 'valid' ? 'border-green-500 text-green-600' : 'border-gray-300 dark:border-dark-border dark:text-dark-text-primary'}`}
                      placeholder="FRESH10"
                      disabled={couponStatus === 'valid'}
                    />
                    {couponStatus === 'valid' && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={16} />}
                    {couponStatus === 'invalid' && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={16} />}
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponStatus === 'valid' || !couponCode}
                    className="bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-dark-surface/80 disabled:opacity-50"
                  >
                    {couponStatus === 'validating' ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                  </button>
                </div>
                {couponStatus === 'valid' && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Discount applied successfully!</p>}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center justify-between text-gray-600 dark:text-dark-text-secondary">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1"><Ticket size={14} /> Discount ({discountPercent}%)</span>
                    <span>-${(discountAmount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-dark-text-primary pt-2 border-t border-gray-200 dark:border-dark-border">
                  <span>Total</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToInfo}
                disabled={isProcessing}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 dark:disabled:bg-brand-900 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/30 dark:shadow-brand-900/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Checkout Securely
              </button>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1 text-[10px] text-gray-500 dark:text-dark-text-secondary">
                  <div className="p-1.5 bg-white dark:bg-dark-surface rounded-full shadow-sm">
                    <Check size={12} className="text-green-500" />
                  </div>
                  <span>Instant Access</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[10px] text-gray-500 dark:text-dark-text-secondary">
                  <div className="p-1.5 bg-white dark:bg-dark-surface rounded-full shadow-sm">
                    <Ticket size={12} className="text-blue-500" />
                  </div>
                  <span>Secure Payment</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[10px] text-gray-500 dark:text-dark-text-secondary">
                  <div className="p-1.5 bg-white dark:bg-dark-surface rounded-full shadow-sm">
                    <AlertCircle size={12} className="text-brand-500" />
                  </div>
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === 'customer-info' && (
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="flex justify-between text-sm mb-4 p-3 bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border">
                <span className="text-gray-500">Order Total</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">${(total / 100).toFixed(2)}</span>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 dark:disabled:bg-brand-900 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/30 dark:shadow-brand-900/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    {user ? 'Continue to Payment' : isLoginMode ? 'Login & Continue' : 'Create Account & Continue'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};