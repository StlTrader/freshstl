'use client';

import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import * as firebaseService from '../services/firebaseService';
import { useRouter } from 'next/navigation';

// Simple Google Icon SVG
const GoogleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.52 12.29C23.52 11.43 23.44 10.6 23.3 9.8H12V14.51H18.46C18.18 15.99 17.34 17.25 16.08 18.1L19.94 21.1C22.2 19.01 23.52 15.92 23.52 12.29Z" fill="#4285F4" />
        <path d="M12 24C15.24 24 17.96 22.92 19.94 21.1L16.08 18.1C15 18.83 13.62 19.26 12 19.26C8.87 19.26 6.22 17.15 5.27 14.29L1.29 17.38C3.26 21.3 7.31 24 12 24Z" fill="#34A853" />
        <path d="M5.27 14.29C5.03 13.57 4.9 12.8 4.9 12C4.9 11.2 5.03 10.43 5.27 9.71L1.29 6.62C0.47 8.24 0 10.06 0 12C0 13.94 0.47 15.76 1.29 17.38L5.27 14.29Z" fill="#FBBC05" />
        <path d="M12 4.74C13.76 4.74 15.34 5.35 16.58 6.54L20.03 3.09C17.96 1.15 15.24 0 12 0C7.31 0 3.26 2.7 1.29 6.62L5.27 9.71C6.22 6.85 8.87 4.74 12 4.74Z" fill="#EA4335" />
    </svg>
);

interface AuthBarrierProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AuthBarrier: React.FC<AuthBarrierProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isEmailMode, setIsEmailMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await firebaseService.signInWithGoogle();
            onSuccess();
        } catch (e: any) {
            setError(e.message || 'Google sign in failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await firebaseService.login(email, password);
            onSuccess();
        } catch (e: any) {
            setError(e.message || 'Email sign in failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign in to Complete Your Purchase
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Secure your downloads and sync across devices
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {!isEmailMode ? (
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border/50 text-gray-900 dark:text-white py-3.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                        >
                            <GoogleIcon />
                            <span>Continue with Google</span>
                        </button>

                        <button
                            onClick={() => setIsEmailMode(true)}
                            className="w-full flex items-center justify-center gap-3 bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-500/30"
                        >
                            <Mail size={20} />
                            <span>Sign in with Email</span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEmailMode(false)}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            Back to options
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        New to FreshSTL? <button onClick={() => router.push('/login')} className="text-brand-600 hover:underline font-medium">Create an account</button> to access your downloads forever.
                    </p>
                </div>
            </div>
        </div>
    );
};
