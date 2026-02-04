import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as paymentService from '../services/paymentService';
import { Loader2, AlertCircle, Lock, TestTube2, Zap, CreditCard, ShieldCheck } from 'lucide-react';
import { auth, getUserProfile, subscribeToFlouciConfig, subscribeToGlobalPaymentConfig } from '../services/firebaseService';
import * as flouciService from '../services/flouciService';
import { Smartphone } from 'lucide-react';
import { PaymentMethod, GlobalPaymentConfig } from '../types';
import { useStore } from '../contexts/StoreContext';
import { formatPrice } from '../utils/currencyHelpers';

const CardIcon = ({ brand }: { brand: string }) => {
    const b = brand.toLowerCase();
    if (b === 'visa') return (
        <div className="w-10 h-7 bg-[#1A1F71] rounded flex items-center justify-center text-white font-bold italic text-[10px] tracking-wider shadow-sm">
            VISA
        </div>
    );
    if (b === 'mastercard') return (
        <div className="w-10 h-7 bg-[#252525] rounded flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="w-4 h-4 rounded-full bg-[#EB001B] opacity-90 -mr-1"></div>
            <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-90 -ml-1"></div>
        </div>
    );
    if (b === 'amex') return (
        <div className="w-10 h-7 bg-[#2E77BB] rounded flex items-center justify-center text-white font-bold text-[8px] tracking-tighter shadow-sm">
            AMEX
        </div>
    );
    return (
        <div className="w-10 h-7 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm">
            <CreditCard size={16} />
        </div>
    );
};

interface StripeCheckoutProps {
    amount: number; // in cents
    onSuccess: (paymentIntentId: string, paymentMethod?: any) => void;
    onCancel: () => void;
    customerInfo?: {
        fullName: string;
        email: string;
        address?: string;
        city?: string;
        zipCode?: string;
        country?: string;
    };
    items: any[]; // Added items prop
}

const CheckoutForm = ({ onSuccess, amount, saveCard, setSaveCard, customerInfo }: {
    onSuccess: (id: string) => void,
    amount: number,
    saveCard: boolean,
    setSaveCard: (val: boolean) => void,
    customerInfo?: {
        fullName: string;
        email: string;
        address?: string;
        city?: string;
        zipCode?: string;
        country?: string;
    }
}) => {
    const { currency } = useStore();
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message || "An error occurred");
            setIsProcessing(false);
            return;
        }

        // Confirm the payment
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
                payment_method_data: {
                    billing_details: {
                        name: customerInfo?.fullName,
                        email: customerInfo?.email,
                        address: {
                            line1: customerInfo?.address,
                            city: customerInfo?.city,
                            postal_code: customerInfo?.zipCode,
                            country: customerInfo?.country,
                        }
                    }
                }
            },
            redirect: "if_required",
        });

        if (error) {
            setError(error.message || "Payment failed");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Note: We cannot easily retrieve card details on the client to save them to Firestore
            // without a backend endpoint. The 'Save Card' checkbox currently relies on
            // setup_future_usage which attaches it to the customer in Stripe, 
            // but it won't appear in our Firestore list automatically.
            onSuccess(paymentIntent.id);
        } else {
            setError("Payment status unknown.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement options={{
                defaultValues: {
                    billingDetails: {
                        email: customerInfo?.email || '',
                        name: customerInfo?.fullName || '',
                        address: {
                            line1: customerInfo?.address || '',
                            city: customerInfo?.city || '',
                            postal_code: customerInfo?.zipCode || '',
                            country: customerInfo?.country || '',
                        }
                    }
                },
                fields: {
                    billingDetails: {
                        email: 'never',
                    }
                }
            }} />


            <div className="flex items-center gap-3 px-1">
                <input
                    type="checkbox"
                    id="save-card"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 text-social-black dark:text-white rounded border-gray-300 focus:ring-social-black dark:focus:ring-white"
                />
                <label htmlFor="save-card" className="text-sm text-gray-600 dark:text-dark-text-secondary cursor-pointer select-none">
                    Save this card for future purchases
                </label>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in slide-in-from-top-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-social-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white dark:text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4" /> Pay {formatPrice(amount, currency)}
                    </>
                )}
            </button>

            <div className="flex justify-center gap-4 text-gray-400 dark:text-gray-500 mt-6">
                <div className="flex items-center gap-1.5 text-xs font-medium bg-gray-50 dark:bg-dark-bg px-3 py-1.5 rounded-full border border-gray-100 dark:border-dark-border">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>256-bit SSL Secure Encrypted Payment</span>
                </div>
            </div>
        </form>
    );
};

const SavedCardPaymentForm = ({
    onSuccess,
    amount,
    paymentMethodId,
    clientSecret
}: {
    onSuccess: (id: string) => void,
    amount: number,
    paymentMethodId: string,
    clientSecret: string
}) => {
    const { currency } = useStore();
    const stripe = useStripe();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePay = async () => {
        if (!stripe) return;
        setIsProcessing(true);
        setError(null);

        try {
            // Confirm the payment using the client secret (which already has the PM attached)
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethodId
            });

            if (error) {
                setError(error.message || "Payment failed");
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id);
            } else {
                setError("Payment status unknown.");
                setIsProcessing(false);
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in slide-in-from-top-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <button
                onClick={handlePay}
                disabled={!stripe || isProcessing}
                className="w-full bg-social-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white dark:text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4" /> Pay {formatPrice(amount, currency)} with Saved Card
                    </>
                )}
            </button>
        </div>
    );
};

const FlouciCheckout = ({ amount, customerInfo, items, onCancel }: {
    amount: number,
    customerInfo?: { fullName: string; email: string },
    items: any[],
    onCancel: () => void
}) => {
    const { currency } = useStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    const handleFlouciPay = async () => {
        setIsProcessing(true);
        setError(null);
        setPaymentUrl(null);
        try {
            // Save pending order data to sessionStorage for retrieval after redirect
            sessionStorage.setItem('pending_flouci_order', JSON.stringify({
                items: items,
                total: amount,
                customerInfo: customerInfo
            }));

            const result = await flouciService.initiateFlouciPayment(
                amount,
                customerInfo || { email: '', fullName: 'Guest' },
                items
            );

            if (result?.url) {
                console.log('[Flouci] Payment URL received:', result.url);
                setPaymentUrl(result.url);

                // Create a hidden form and submit it for reliable redirect
                const form = document.createElement('form');
                form.method = 'GET';
                form.action = result.url;
                form.target = '_self';
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);
            } else {
                console.error('[Flouci] No URL in result:', result);
                sessionStorage.removeItem('pending_flouci_order');
                throw new Error("Failed to get payment link");
            }
        } catch (e: any) {
            sessionStorage.removeItem('pending_flouci_order');
            setError(e.message || "Failed to initiate Flouci payment");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 text-center animate-in fade-in duration-500">
            <div className="p-6 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30">
                <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
                    <Smartphone className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">Pay with Flouci</h3>
                <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
                    Secure payment via Flouci wallet or bank card (Tunisia).
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Show direct link if redirect fails */}
            {paymentUrl && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-700 dark:text-green-400 text-sm mb-2">Payment link ready! Click below if not redirected:</p>
                    <a
                        href={paymentUrl}
                        className="text-brand-600 hover:text-brand-500 font-bold underline"
                        rel="noopener noreferrer"
                    >
                        → Go to Payment Page
                    </a>
                </div>
            )}

            <button
                onClick={handleFlouciPay}
                disabled={isProcessing}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Initializing...
                    </>
                ) : (
                    <>
                        <Zap className="w-4 h-4" /> Pay {formatPrice(amount, currency)} with Flouci
                    </>
                )}
            </button>
        </div>
    );
};

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ amount, onSuccess, onCancel, customerInfo, items }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
    const [useNewCard, setUseNewCard] = useState(false);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [saveCard, setSaveCard] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [flouciPublicConfig, setFlouciPublicConfig] = useState<any>(null);
    const [globalPaymentConfig, setGlobalPaymentConfig] = useState<GlobalPaymentConfig>({ activeGateway: 'stripe' });
    const { isDarkMode, user, currency } = useStore();

    // Fetch saved methods and check admin status on mount
    useEffect(() => {
        const fetchMethods = async () => {
            if (auth && auth.currentUser) {
                try {
                    // Check admin status
                    const profile = await getUserProfile(auth.currentUser.uid);
                    setIsAdmin(profile?.role === 'admin');

                    const methods = await paymentService.getSavedPaymentMethods(auth.currentUser.uid);
                    setSavedMethods(methods);
                    if (methods.length > 0) {
                        setSelectedMethodId(methods[0].id);
                        setUseNewCard(false);
                    } else {
                        setUseNewCard(true);
                    }
                } catch (e) {
                    console.error("Failed to fetch payment methods", e);
                    setUseNewCard(true);
                } finally {
                    setLoadingMethods(false);
                }
            } else {
                setLoadingMethods(false);
                setUseNewCard(true);
            }
        };
        const unsubFlouci = subscribeToFlouciConfig(setFlouciPublicConfig);
        const unsubGlobal = subscribeToGlobalPaymentConfig(setGlobalPaymentConfig);
        return () => {
            unsubFlouci();
            unsubGlobal();
        };
    }, []);

    const [stripeInstance, setStripeInstance] = useState<Promise<any> | null>(null);

    // Determine Flouci activation early
    const isFlouciActive = globalPaymentConfig.activeGateway === 'flouci';
    const isAutoGateway = globalPaymentConfig.activeGateway === 'auto';
    const shouldUseFlouci = isFlouciActive || (isAutoGateway && currency === 'DT');

    // Initialize Payment Intent whenever selection changes (New vs Saved, or different Saved card)
    // Skip Stripe initialization entirely if Flouci is active
    useEffect(() => {
        // Skip if Flouci is active - no need to init Stripe
        if (shouldUseFlouci) {
            setLoadingMethods(false);
            return;
        }

        const initPayment = async () => {
            // Only init if we are done loading methods
            if (loadingMethods) return;

            setClientSecret(null); // Reset while loading new intent
            setStripeInstance(null); // Reset Stripe instance
            setError(null);

            const config = paymentService.getStripeConfig();
            if (!config.isConnected) {
                // Handle not connected
            }

            try {
                // Determine params based on state
                const isUsingSaved = !useNewCard && selectedMethodId;

                const result = await paymentService.createPaymentIntent(
                    amount,
                    currency.toLowerCase(),
                    customerInfo,
                    useNewCard ? saveCard : false, // Only save if using new card
                    isUsingSaved ? selectedMethodId! : undefined,
                    items // Pass items
                );

                if (result) {
                    // Explicitly get the Stripe instance for the mode returned by the server
                    console.log(`[StripeCheckout] Server returned mode: ${result.mode}`);
                    console.log(`[StripeCheckout] Client Secret prefix: ${result.clientSecret.substring(0, 10)}...`);

                    const stripe = paymentService.getStripe(result.mode);
                    setStripeInstance(stripe);
                    setClientSecret(result.clientSecret);
                }
            } catch (e: any) {
                console.error("Payment init failed", e);
                setError(e.message || "Failed to initialize payment");
            }
        };

        // Debounce slightly to avoid rapid re-creation if user clicks around fast
        const timer = setTimeout(() => {
            initPayment();
        }, 500);

        return () => clearTimeout(timer);
    }, [amount, useNewCard, selectedMethodId, saveCard, loadingMethods, user, shouldUseFlouci]);

    // EARLY RETURN: If Flouci is the active gateway, render it immediately
    if (shouldUseFlouci) {
        return (
            <div className="p-1">
                <FlouciCheckout
                    amount={amount * 10} // Convert cents (100 per DT) to millimes (1000 per DT)
                    customerInfo={customerInfo}
                    items={items}
                    onCancel={onCancel}
                />
                <div className="mt-4 text-center">
                    <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-dark-text-primary">Cancel Payment</button>
                </div>
            </div>
        );
    }

    if (loadingMethods) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-social-black dark:text-white" />
                <p className="text-gray-500">Loading payment options...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="text-red-500 mb-2"><AlertCircle className="mx-auto w-8 h-8" /></div>
                <p className="text-gray-900 dark:text-dark-text-primary font-medium">Payment Initialization Failed</p>
                <p className="text-gray-500 text-sm mt-1">{error}</p>
                <button onClick={onCancel} className="mt-4 text-social-black dark:text-white hover:underline">Go Back</button>
            </div>
        );
    }

    // Wait for both clientSecret and stripeInstance
    if (!clientSecret || !stripeInstance) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-social-black dark:text-white" />
                <p className="text-gray-500">Preparing secure checkout...</p>
            </div>
        );
    }

    const mode = paymentService.getStripeMode();

    const handleInternalSuccess = (paymentIntentId: string) => {
        let pmDetails = undefined;
        if (!useNewCard && selectedMethodId) {
            const method = savedMethods.find(m => m.id === selectedMethodId);
            if (method) {
                pmDetails = {
                    card: {
                        brand: method.brand,
                        last4: method.last4
                    }
                };
            }
        }
        onSuccess(paymentIntentId, pmDetails);
    };

    // Flouci check already handled above via early return

    return (
        <div className="p-1">
            {/* Mode Indicator - Only visible to admins */}
            {isAdmin && (
                <div className={`mb-4 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${mode === 'test'
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    }`}>
                    {mode === 'test' ? (
                        <>
                            <TestTube2 size={16} />
                            <span>Test Mode (Tester Access)</span>
                        </>
                    ) : (
                        <>
                            <Zap size={16} />
                            <span>Live Mode - Real payment</span>
                        </>
                    )}
                </div>
            )}

            {/* Saved Cards Selection */}
            {savedMethods.length > 0 && (
                <div className="mb-6 space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Select Payment Method</h3>
                    <div className="space-y-2">
                        {savedMethods.map(method => (
                            <div
                                key={method.id}
                                onClick={() => {
                                    setSelectedMethodId(method.id);
                                    setUseNewCard(false);
                                }}
                                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${!useNewCard && selectedMethodId === method.id
                                    ? 'border-social-black dark:border-white bg-gray-50 dark:bg-dark-bg ring-1 ring-social-black dark:ring-white'
                                    : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-border'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-4">
                                        <CardIcon brand={method.brand} />
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900 dark:text-dark-text-primary">•••• {method.last4}</span>
                                            <span className="text-gray-500 dark:text-dark-text-secondary ml-2 text-xs">Exp {method.expiryMonth}/{method.expiryYear}</span>
                                        </div>
                                    </div>
                                    {(!useNewCard && selectedMethodId === method.id) && (
                                        <div className="w-4 h-4 rounded-full bg-social-black dark:bg-white flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white dark:bg-black rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div
                            onClick={() => setUseNewCard(true)}
                            className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${useNewCard
                                ? 'border-social-black dark:border-white bg-gray-50 dark:bg-dark-bg ring-1 ring-social-black dark:ring-white'
                                : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-border'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-6 flex items-center justify-center">
                                    <CreditCard size={20} className="text-gray-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">Use a new card</span>
                            </div>
                            {useNewCard && (
                                <div className="w-4 h-4 rounded-full bg-social-black dark:bg-white flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white dark:bg-black rounded-full" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!clientSecret || !stripeInstance ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-social-black dark:text-white" />
                    <p className="text-gray-500">Preparing secure checkout...</p>
                </div>
            ) : (
                <Elements
                    key={clientSecret}
                    stripe={stripeInstance}
                    options={{
                        clientSecret,
                        appearance: {
                            theme: isDarkMode ? 'night' : 'stripe',
                            variables: {
                                colorPrimary: isDarkMode ? '#ffffff' : '#111111',
                                colorBackground: isDarkMode ? '#212121' : '#ffffff',
                                colorText: isDarkMode ? '#ffffff' : '#111111',
                                colorDanger: '#ef4444',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif',
                                fontSizeBase: '15px',
                                spacingUnit: '4px',
                                borderRadius: '12px',
                                fontWeightNormal: '400',
                                fontWeightMedium: '500',
                            },
                            rules: {
                                '.Tab': {
                                    border: isDarkMode ? '1px solid #3f3f3f' : '1px solid #e5e7eb',
                                    backgroundColor: isDarkMode ? '#111111' : '#ffffff',
                                    boxShadow: 'none',
                                    padding: '14px 16px',
                                },
                                '.Tab:hover': {
                                    backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb',
                                    border: isDarkMode ? '1px solid #4a4a4a' : '1px solid #d1d5db',
                                },
                                '.Tab--selected': {
                                    border: isDarkMode ? '1px solid #ffffff' : '1px solid #111111',
                                    backgroundColor: isDarkMode ? '#212121' : '#ffffff',
                                    boxShadow: isDarkMode ? '0 0 0 1px #ffffff' : '0 0 0 1px #111111',
                                },
                                '.Tab--selected:hover': {
                                    border: isDarkMode ? '1px solid #ffffff' : '1px solid #111111',
                                    backgroundColor: isDarkMode ? '#212121' : '#ffffff',
                                },
                                '.Input': {
                                    border: isDarkMode ? '1px solid #3f3f3f' : '1px solid #e5e7eb',
                                    backgroundColor: isDarkMode ? '#111111' : '#ffffff',
                                    boxShadow: 'none',
                                    padding: '14px 16px',
                                    fontSize: '15px',
                                },
                                '.Input:hover': {
                                    border: isDarkMode ? '1px solid #4a4a4a' : '1px solid #d1d5db',
                                },
                                '.Input:focus': {
                                    border: isDarkMode ? '1px solid #ffffff' : '1px solid #111111',
                                    boxShadow: isDarkMode ? '0 0 0 2px rgba(255, 255, 255, 0.15)' : '0 0 0 2px rgba(17, 17, 17, 0.15)',
                                    outline: 'none',
                                },
                                '.Label': {
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: isDarkMode ? '#e9e9e9' : '#111111',
                                    marginBottom: '6px',
                                },
                                '.Error': {
                                    color: '#ef4444',
                                    fontSize: '13px',
                                },
                                '.Block': {
                                    backgroundColor: isDarkMode ? '#111111' : '#ffffff',
                                    border: isDarkMode ? '1px solid #3f3f3f' : '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: 'none',
                                    padding: '16px',
                                },
                                '.BlockDivider': {
                                    backgroundColor: isDarkMode ? '#3f3f3f' : '#e5e7eb',
                                },
                                '.TabLabel': {
                                    fontSize: '15px',
                                    fontWeight: '500',
                                },
                                '.TabIcon': {
                                    fill: isDarkMode ? '#ffffff' : '#111111',
                                },
                                '.TabIcon--selected': {
                                    fill: isDarkMode ? '#ffffff' : '#111111',
                                },
                            }
                        },


                    }}
                >
                    {useNewCard ? (
                        <CheckoutForm
                            onSuccess={handleInternalSuccess}
                            amount={amount}
                            saveCard={saveCard}
                            setSaveCard={setSaveCard}
                            customerInfo={customerInfo}
                        />
                    ) : (
                        <SavedCardPaymentForm
                            onSuccess={handleInternalSuccess}
                            amount={amount}
                            paymentMethodId={selectedMethodId!}
                            clientSecret={clientSecret}
                        />
                    )}
                </Elements>
            )}

            <div className="mt-4 text-center">
                <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-dark-text-primary">Cancel Payment</button>
            </div>
        </div>
    );
};
