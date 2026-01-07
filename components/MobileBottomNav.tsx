'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, ShoppingCart, Menu, X, Sun, Moon, LogIn, LogOut, ShieldCheck, HelpCircle, FileText, Shield, ChevronRight, BookOpen } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import * as firebaseService from '../services/firebaseService';

export const MobileBottomNav: React.FC = () => {
    const { user, cart, setIsCartOpen, isDarkMode, toggleTheme } = useStore();
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const cartCount = cart.length;
    const isAnonymous = user?.isAnonymous || !user;
    const isAdmin = user?.email === 'stltraderltd@gmail.com';

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        await firebaseService.logout();
        router.push('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            {/* Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border z-[100] pb-safe transition-all duration-300">
                <div className="flex justify-around items-center h-16">
                    {/* Store (Home) */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-dark-text-primary'}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Store</span>
                    </Link>

                    {/* Dashboard / Profile */}
                    <Link
                        href={isAnonymous ? '/login' : '/purchases'}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/purchases') || isActive('/login') ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-dark-text-primary'}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {isAnonymous ? <LogIn className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                        <span className="text-[10px] font-medium">{isAnonymous ? 'Sign In' : 'Dashboard'}</span>
                    </Link>

                    {/* Cart */}
                    <button
                        onClick={() => {
                            setIsCartOpen(true);
                            setIsMenuOpen(false);
                        }}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-900 dark:text-dark-text-primary relative"
                    >
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white dark:border-dark-bg">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">Cart</span>
                    </button>

                    {/* Menu (More) */}
                    <button
                        onClick={toggleMenu}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isMenuOpen ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-dark-text-primary'}`}
                    >
                        <Menu className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </div>
            </div>

            {/* Bottom Sheet Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden" style={{ bottom: '64px' }}>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Sheet Content */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-surface rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-dark-border overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-border rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-dark-border">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">Menu</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 dark:bg-dark-surface rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 space-y-2 pb-8">
                            {/* User Info Card */}
                            {!isAnonymous && (
                                <div className="bg-gray-50 dark:bg-dark-bg/50 p-4 rounded-2xl flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xl">
                                        {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-dark-text-primary truncate">{user?.displayName || 'User'}</p>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">{user?.email}</p>
                                    </div>
                                </div>
                            )}

                            {/* Admin Link */}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg/30 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-dark-text-primary">Admin Panel</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </Link>
                            )}

                            {/* Links Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href="/blog"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-dark-bg/30 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors gap-2"
                                >
                                    <BookOpen className="w-6 h-6 text-gray-500 dark:text-dark-text-secondary" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Blog</span>
                                </Link>
                                <Link
                                    href="/support"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-dark-bg/30 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors gap-2"
                                >
                                    <HelpCircle className="w-6 h-6 text-gray-500 dark:text-dark-text-secondary" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Support</span>
                                </Link>
                                <Link
                                    href="/license"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-dark-bg/30 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors gap-2"
                                >
                                    <FileText className="w-6 h-6 text-gray-500 dark:text-dark-text-secondary" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">License</span>
                                </Link>
                                <Link
                                    href="/terms"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-dark-bg/30 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors gap-2"
                                >
                                    <Shield className="w-6 h-6 text-gray-500 dark:text-dark-text-secondary" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Terms</span>
                                </Link>
                                <Link
                                    href="/privacy"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-dark-bg/30 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors gap-2"
                                >
                                    <ShieldCheck className="w-6 h-6 text-gray-500 dark:text-dark-text-secondary" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Privacy</span>
                                </Link>
                            </div>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg/30 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-dark-text-primary">Appearance</span>
                                </div>
                                <span className="text-sm text-gray-500">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                            </button>

                            {/* Logout / Login */}
                            {isAnonymous ? (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 p-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 mt-4"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </Link>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors mt-4"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
