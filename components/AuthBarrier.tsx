'use client';

import React, { useState } from 'react';
import { X, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import * as firebaseService from '../services/firebaseService';
import { useRouter } from 'next/navigation';

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
    </svg>
);

interface AuthBarrierProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AuthBarrier: React.FC<AuthBarrierProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isRegister) {
                if (password.length < 6) throw new Error("Password must be at least 6 characters");
                await firebaseService.register(email, password, name);
            } else {
                await firebaseService.login(email, password);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') {
                setError("Invalid email or password.");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("Email is already registered.");
            } else {
                setError(err.message || "An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleFacebookSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await firebaseService.signInWithFacebook();
            onSuccess();
        } catch (e: any) {
            setError(e.message || 'Facebook sign in failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-[480px] bg-white dark:bg-dark-surface rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-dark-border">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {isRegister ? "Create Account" : "Sign in to Checkout"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {isRegister ? "Join to sync your library across devices" : "Secure your downloads and sync across devices"}
                    </p>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-all duration-200 group disabled:opacity-50"
                    >
                        <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Google</span>
                    </button>
                    <button
                        onClick={handleFacebookSignIn}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-all duration-200 group disabled:opacity-50"
                    >
                        <FacebookIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Facebook</span>
                    </button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-dark-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-dark-surface text-gray-500 dark:text-dark-text-secondary font-medium">Or continue with email</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-3">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div className="space-y-1.5 animate-in slide-in-from-left-4 fade-in duration-300">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={isRegister}
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-white outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-white outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-white outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-social-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black py-4 rounded-xl font-bold transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {isRegister ? "Create Account" : "Sign In"} <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isRegister ? "Already have an account?" : "New to FreshSTL?"}{" "}
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(null); }}
                            className="text-gray-900 dark:text-white font-bold hover:underline transition-colors"
                        >
                            {isRegister ? "Sign In" : "Create an account"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
