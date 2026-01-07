import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as paymentService from '../services/paymentService';
import { Loader2, AlertCircle, Lock, TestTube2, Zap, CreditCard } from 'lucide-react';
import { auth } from '../services/firebaseService';
import { PaymentMethod } from '../types';
import { useStore } from '../contexts/StoreContext';

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
}

const CheckoutForm = ({ onSuccess, amount, saveCard, setSaveCard }: { onSuccess: (id: string) => void, amount: number, saveCard: boolean, setSaveCard: (val: boolean) => void }) => {
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
            },
            redirect: "if_required",
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
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <PaymentElement />
            </div>

            <div className="flex items-center gap-3 px-1">
                <input
                    type="checkbox"
                    id="save-card"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
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
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 dark:disabled:bg-brand-800 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4" /> Pay ${(amount / 100).toFixed(2)}
                    </>
                )}
            </button>

            <div className="flex justify-center gap-4 text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1 text-xs">
                    <Lock size={10} /> 256-bit SSL Secure
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
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 dark:disabled:bg-brand-800 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4" /> Pay ${(amount / 100).toFixed(2)} with Saved Card
                    </>
                )}
            </button>
        </div>
    );
};

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ amount, onSuccess, onCancel, customerInfo }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
    const [useNewCard, setUseNewCard] = useState(false);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [saveCard, setSaveCard] = useState(false);
    const { isDarkMode } = useStore();

    // Fetch saved methods on mount
    useEffect(() => {
        const fetchMethods = async () => {
            if (auth && auth.currentUser) {
                try {
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
        fetchMethods();
    }, []);

    // Initialize Payment Intent whenever selection changes (New vs Saved, or different Saved card)
    useEffect(() => {
        const initPayment = async () => {
            // Only init if we are done loading methods
            if (loadingMethods) return;

            setClientSecret(null); // Reset while loading new intent
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
                    'usd',
                    customerInfo,
                    useNewCard ? saveCard : false, // Only save if using new card
                    isUsingSaved ? selectedMethodId! : undefined
                );

                if (result) {
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
    }, [amount, useNewCard, selectedMethodId, saveCard, loadingMethods]);

    if (loadingMethods) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
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
                <button onClick={onCancel} className="mt-4 text-brand-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const stripePromise = paymentService.getStripe();
    if (!stripePromise) return null;

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

    return (
        <div className="p-1">
            {/* Mode Indicator */}
            <div className={`mb-4 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${mode === 'test'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                }`}>
                {mode === 'test' ? (
                    <>
                        <TestTube2 size={16} />
                        <span>Test Mode - No real charges</span>
                    </>
                ) : (
                    <>
                        <Zap size={16} />
                        <span>Live Mode - Real payment</span>
                    </>
                )}
            </div>

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
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500'
                                    : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-border'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-gray-200 dark:bg-dark-surface rounded flex items-center justify-center text-[10px] font-bold uppercase text-gray-600 dark:text-dark-text-secondary">
                                        {method.brand}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-900 dark:text-dark-text-primary">•••• {method.last4}</span>
                                        <span className="text-gray-500 dark:text-dark-text-secondary ml-2 text-xs">Exp {method.expiryMonth}/{method.expiryYear}</span>
                                    </div>
                                </div>
                                {(!useNewCard && selectedMethodId === method.id) && (
                                    <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                )}
                            </div>
                        ))}

                        <div
                            onClick={() => setUseNewCard(true)}
                            className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${useNewCard
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500'
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
                                <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!clientSecret ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                    <p className="text-gray-500">Preparing secure checkout...</p>
                </div>
            ) : (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: isDarkMode ? 'night' : 'stripe' } }}>
                    {useNewCard ? (
                        <CheckoutForm
                            onSuccess={handleInternalSuccess}
                            amount={amount}
                            saveCard={saveCard}
                            setSaveCard={setSaveCard}
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
