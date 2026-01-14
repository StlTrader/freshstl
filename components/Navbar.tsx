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
  };

  // Helper to check active state
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-[60] w-full bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group z-50">
            <div className="bg-brand-500 p-2 rounded-full mr-3 group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold tracking-tight text-social-black dark:text-white">
              freshstl.com
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-colors font-medium ${isActive('/')
                ? 'bg-social-black text-white dark:bg-white dark:text-social-black'
                : 'text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover'
                }`}
            >
              <span className="text-sm">Store</span>
            </Link>

            <Link
              href="/blog"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-colors font-medium ${isActive('/blog')
                ? 'bg-social-black text-white dark:bg-white dark:text-social-black'
                : 'text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover'
                }`}
            >
              <span className="text-sm">Blog</span>
            </Link>

            {/* Only show Dashboard if logged in (not anonymous) */}
            {!isAnonymous && (
              <Link
                href="/purchases"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-colors font-medium ${isActive('/purchases')
                  ? 'bg-social-black text-white dark:bg-white dark:text-social-black'
                  : 'text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover'
                  }`}
              >
                <span className="text-sm">Dashboard</span>
              </Link>
            )}

            {/* Admin Link - Only visible to admin@freshstl.com */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-colors font-medium ${isActive('/admin')
                  ? 'bg-social-black text-white dark:bg-white dark:text-social-black'
                  : 'text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover'
                  }`}
              >
                <span className="text-sm">Admin</span>
              </Link>
            )}

            <div className="h-6 w-px bg-gray-200 dark:bg-dark-border mx-2 hidden md:block transition-colors"></div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover transition-colors"
              title={mounted ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : "Switch Theme"}
              aria-label={mounted ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : "Switch Theme"}
            >
              {mounted ? (isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>

            {/* Auth Buttons */}
            {isAnonymous ? (
              <Link
                href="/login"
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all font-bold text-sm ${isActive('/login')
                  ? 'bg-brand-600 text-white'
                  : 'bg-social-light-hover dark:bg-social-dark-hover text-social-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <span>Log in</span>
              </Link>
            ) : (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-social-light-hover dark:hover:bg-social-dark-hover transition-colors"
                  aria-label="User Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border mb-2">
                    <p className="text-sm font-bold text-social-black dark:text-white truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link href="/purchases" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover mx-2 rounded-lg">
                    <Package className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/purchases" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover mx-2 rounded-lg">
                    <User className="w-4 h-4" /> Profile
                  </Link>

                  <div className="my-2 border-t border-gray-100 dark:border-dark-border" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 text-left mx-2 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover transition-colors rounded-full ml-1"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-dark-bg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover transition-colors"
              aria-label={mounted ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : "Switch Theme"}
            >
              {mounted ? (isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-social-black dark:text-dark-text-primary hover:bg-social-light-hover dark:hover:bg-social-dark-hover transition-colors rounded-full"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-dark-bg">
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