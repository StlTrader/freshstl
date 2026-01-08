import React, { useState } from 'react';
import { X, CreditCard, Loader2, Lock } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { auth } from '../services/firebaseService';
import * as firebaseService from '../services/firebaseService';
import { PaymentMethod } from '../types';
import { useStore } from '../contexts/StoreContext';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (method: PaymentMethod) => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardHolderName, setCardHolderName] = useState('');
    const { isDarkMode } = useStore();

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || !auth || !auth.currentUser) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setIsProcessing(false);
            return;
        }

        try {
            // 1. Create a Token or PaymentMethod with Stripe
            // In a real app with SetupIntent, we would confirmSetup here.
            // For this demo/MVP, we'll create a PaymentMethod object to get the card details securely.
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: cardHolderName,
                    email: auth.currentUser.email || undefined,
                },
            });

            if (stripeError) {
                setError(stripeError.message || 'An error occurred');
                setIsProcessing(false);
                return;
            }

            if (paymentMethod && paymentMethod.card) {
                // 2. Save the non-sensitive details to our database
                // We DO NOT save the full token or sensitive data, just the display info
                // In a real app, you'd save the paymentMethod.id to the customer in Stripe via your backend
                const newMethod = await firebaseService.addUserPaymentMethod(auth.currentUser.uid, {
                    id: paymentMethod.id,
                    brand: paymentMethod.card.brand,
                    last4: paymentMethod.card.last4,
                    expiryMonth: paymentMethod.card.exp_month,
                    expiryYear: paymentMethod.card.exp_year,
                    isDefault: false // Logic to handle default can be added later
                });

                onSuccess(newMethod);
                onClose();
            }
        } catch (err: any) {
            console.error("Error adding card:", err);
            setError(err.message || 'Failed to add card');
            alert(`Error adding card: ${err.message || err}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                        <CreditCard className="text-brand-600" size={24} />
                        Add New Card
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-dark-text-secondary transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            required
                            value={cardHolderName}
                            onChange={(e) => setCardHolderName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                            Card Details
                        </label>
                        <div className="p-4 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg transition-colors">
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: isDarkMode ? '#ffffff' : '#424770',
                                            '::placeholder': {
                                                color: isDarkMode ? '#9ca3af' : '#aab7c4',
                                            },
                                        },
                                        invalid: {
                                            color: '#9e2146',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-text-secondary justify-center">
                        <Lock size={12} />
                        Your payment info is stored securely by Stripe.
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-bg/80 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!stripe || isProcessing}
                            className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Processing...
                                </>
                            ) : (
                                'Save Card'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCardModal;
