import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import * as firebaseService from '../services/firebaseService';

interface PostPurchaseSignupProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
}

export const PostPurchaseSignup: React.FC<PostPurchaseSignupProps> = ({ isOpen, onClose, email }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            await firebaseService.convertGuestToRegistered(password);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error("Signup failed:", err);
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-dark-border">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Order Successful! 🎉</h2>
                            <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
                                Save your order history by creating an account.
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-dark-text-primary">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Account Created!</h3>
                            <p className="text-gray-500 dark:text-dark-text-secondary">Redirecting you to your purchases...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Email</p>
                                <p className="text-gray-900 dark:text-dark-text-primary">{email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                    Create Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                                    placeholder="Min. 6 characters"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                                    placeholder="Re-enter password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-2 text-sm text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary"
                            >
                                No thanks, I'll continue as guest
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
