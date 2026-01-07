'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Package, Home, Box, ShieldCheck, LogIn, LogOut, Sun, Moon, ChevronDown, User, BookOpen } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import * as firebaseService from '../services/firebaseService';

export const Navbar: React.FC = () => {
  const { user, cart, setIsCartOpen, isDarkMode, toggleTheme } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);


  const cartCount = cart.length;

  const isAnonymous = user?.isAnonymous || !user;
  const isAdmin = user?.email === 'stltraderltd@gmail.com';

  const handleLogout = async () => {
    await firebaseService.logout();
    router.push('/');
    await firebaseService.logout();
    router.push('/');
  };

  // Helper to check active state
  const isActive = (path: string) => pathname === path;



  return (
    <nav className="sticky top-0 z-[60] w-full backdrop-blur-lg bg-white/80 dark:bg-dark-bg/80 border-b border-gray-200 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="bg-gradient-to-tr from-brand-400 to-blue-500 p-2 rounded-lg mr-3 group-hover:scale-105 transition-transform shadow-lg shadow-brand-500/20">
              <Box className="w-6 h-6 text-white dark:text-dark-bg" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200">
              freshstl.com
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2 md:space-x-4">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive('/')
                ? 'text-brand-600 dark:text-brand-400 bg-gray-100 dark:bg-dark-surface'
                : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface/50'
                }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Store</span>
            </Link>

            <Link
              href="/blog"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive('/blog')
                ? 'text-brand-600 dark:text-brand-400 bg-gray-100 dark:bg-dark-surface'
                : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface/50'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Blog</span>
            </Link>

            {/* Only show Dashboard if logged in (not anonymous) */}
            {!isAnonymous && (
              <Link
                href="/purchases"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive('/purchases')
                  ? 'text-brand-600 dark:text-brand-400 bg-gray-100 dark:bg-dark-surface'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface/50'
                  }`}
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {/* Admin Link - Only visible to admin@freshstl.com */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive('/admin')
                  ? 'text-brand-600 dark:text-brand-400 bg-gray-100 dark:bg-dark-surface'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface/50'
                  }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}



            <div className="h-6 w-px bg-gray-200 dark:bg-dark-border mx-2 hidden md:block transition-colors"></div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
              title={mounted ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : "Switch Theme"}
              aria-label={mounted ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : "Switch Theme"}
            >
              {mounted ? (isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>

            {/* Auth Buttons */}
            {isAnonymous ? (
              <Link
                href="/login"
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${isActive('/login')
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface/80 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-dark-border'
                  }`}
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>
            ) : (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                  aria-label="User Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm border border-brand-200 dark:border-brand-800">
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-100 dark:border-dark-border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border mb-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link href="/purchases" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-brand-600 dark:hover:text-brand-400">
                    <Package className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/purchases" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-brand-600 dark:hover:text-brand-400">
                    <User className="w-4 h-4" /> Profile
                  </Link>

                  <div className="my-2 border-t border-gray-100 dark:border-dark-border" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-500 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface/80 rounded-full ml-1"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-dark-bg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
              title={mounted ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : "Switch Theme"}
              aria-label={mounted ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : "Switch Theme"}
            >
              {mounted ? (isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-500 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface/80 rounded-full"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-dark-bg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>


    </nav>
  );
};