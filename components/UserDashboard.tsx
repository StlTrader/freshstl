'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Purchase, Product, PaymentMethod, Order } from '../types';
import { User } from 'firebase/auth';
import {
  Download,
  Calendar,
  FileBox,
  User as UserIcon,
  Settings,
  PieChart,
  Save,
  Loader2,
  Box,
  Heart,
  CreditCard,
  Plus,
  Trash2,
  ExternalLink,
  Camera,
  Lock,
  AlertTriangle,
  Upload,
  TestTube2
} from 'lucide-react';
import AddCardModal from './AddCardModal';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../services/paymentService';
import * as firebaseService from '../services/firebaseService';
import * as paymentService from '../services/paymentService';
import { SUPPORTED_COUNTRIES } from '../constants';
import { getProductUrl, getCleanImageUrl } from '../utils/urlHelpers';

interface UserDashboardProps {
  user: User | null;
  purchases: Purchase[];
  loading: boolean;
  products: Product[];
  wishlist: string[];
}

type Tab = 'library' | 'orders' | 'wishlist' | 'analytics' | 'payment' | 'settings';

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, purchases, loading, products, wishlist }) => {
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      linkedin: ''
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  // New Profile State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoURL || null);


  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Derived Wishlist Products
  const wishlistProducts = React.useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      // Load user profile data
      setAvatarPreview(user.photoURL);

      const loadProfile = async () => {
        const profile = await firebaseService.getUserProfile(user.uid);
        if (profile) {
          setCustomerInfo(prev => ({
            ...prev,
            ...profile,
            // Prioritize Auth object for core identity, but fallback to Firestore
            email: user.email || profile.email || prev.email,
            fullName: user.displayName || profile.fullName || prev.fullName,
            socialLinks: {
              twitter: profile.socialLinks?.twitter || '',
              instagram: profile.socialLinks?.instagram || '',
              facebook: profile.socialLinks?.facebook || '',
              linkedin: profile.socialLinks?.linkedin || ''
            }
          }));
        }
      };
      loadProfile();

      // Load Payment Methods
      loadPaymentMethods();

      // Load Orders
      const unsubscribeOrders = firebaseService.subscribeToUserOrders(user.uid, (data) => {
        setOrders(data);
      });

      return () => {
        unsubscribeOrders();
      };
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;
    setIsLoadingPayments(true);
    const methods = await paymentService.getSavedPaymentMethods(user.uid);
    setPaymentMethods(methods);
    setIsLoadingPayments(false);
  };

  const handleAddPaymentMethod = () => {
    console.log("Attempting to add payment method...");
    const stripe = getStripe();
    if (!stripe) {
      console.error("Stripe is not configured. Missing Publishable Key.");
      setMessage('Error: Stripe is not configured. Missing Publishable Key.');
      alert('Error: Stripe is not configured. Missing Publishable Key.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    console.log("Stripe configured, opening modal.");
    setIsAddCardModalOpen(true);
  };

  const handleCardAdded = (method: PaymentMethod) => {
    setPaymentMethods([...paymentMethods, method]);
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to remove this payment method?')) {
      await paymentService.deletePaymentMethod(user.uid, id);
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleDownload = async (productId: string, productName: string) => {
    try {
      setDownloadingId(productId);
      const url = await firebaseService.getSecureDownloadUrl(productId);
      window.open(url, '_blank');
    } catch (error: any) {
      console.error("Download failed:", error);
      setMessage(`Failed to download ${productName}: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (!user) return;

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (customerInfo.phone && !phoneRegex.test(customerInfo.phone)) {
      setMessage('Please enter a valid phone number (e.g., +1 555-123-4567)');
      setIsSaving(false);
      return;
    }

    try {
      if (avatarFile) {
        await firebaseService.updateUserAvatar(avatarFile);
      }
      if (customerInfo.email !== user.email) {
        await firebaseService.updateUserEmail(customerInfo.email);
      }
      await firebaseService.updateUserProfile(customerInfo.fullName);
      await firebaseService.updateUser(user.uid, customerInfo);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Update profile error:', error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage('Please log out and log back in to change your email.');
      } else {
        setMessage('Failed to update profile. ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await firebaseService.updateUserPassword(newPassword);
      setMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Update password error:', error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage('Please log out and log back in to change your password.');
      } else {
        setMessage('Failed to update password. ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete your account and all associated data. Are you absolutely sure?')) {
        try {
          await firebaseService.deleteUserAccount();
          window.location.href = '/';
        } catch (error: any) {
          console.error('Delete account error:', error);
          if (error.code === 'auth/requires-recent-login') {
            setMessage('Please log out and log back in to delete your account.');
          } else {
            setMessage('Failed to delete account. ' + error.message);
          }
        }
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    await firebaseService.toggleWishlist(user.uid, productId, false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Handle Firestore Timestamp
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    // Handle string or Date
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">My Dashboard</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary mt-1">Manage your purchases, wishlist, and account settings.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-dark-surface p-2 rounded-lg border border-gray-200 dark:border-dark-border shadow-sm">
          <div className="relative w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg overflow-hidden">
            {avatarPreview ? (
              <Image src={getCleanImageUrl(avatarPreview)} alt="Profile" fill className="object-cover" sizes="128px" />
            ) : user?.displayName ? (
              user.displayName.charAt(0).toUpperCase()
            ) : (
              <UserIcon size={20} />
            )}
          </div>
          <div className="pr-4">
            <div className="font-medium text-gray-900 dark:text-dark-text-primary text-sm">{user?.displayName || 'User'}</div>
            <div className="text-xs text-gray-500 dark:text-dark-text-secondary flex items-center gap-2">
              {user?.email}
              {user?.providerData[0]?.providerId === 'google.com' && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800">GOOGLE</span>
              )}
              {user?.providerData[0]?.providerId === 'facebook.com' && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800">FACEBOOK</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Sticky & Scrollable Pills */}
      <div className="sticky top-16 z-20 bg-gray-50/95 dark:bg-dark-bg/95 backdrop-blur-md py-2 md:py-4 mb-6 -mx-4 px-4 md:mx-0 md:px-0 border-b border-gray-200 dark:border-dark-border md:border-none md:static md:bg-transparent transition-all">
        <div className="grid grid-cols-3 gap-1.5 md:flex md:gap-3 md:overflow-x-auto md:no-scrollbar md:pb-0">
          {[
            { id: 'library', label: 'Library', icon: Box },
            { id: 'orders', label: 'Orders', icon: FileBox },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'analytics', label: 'Stats', icon: PieChart },
            { id: 'payment', label: 'Payments', icon: CreditCard },
            { id: 'settings', label: 'Profile', icon: UserIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-1.5 md:px-6 md:py-3 rounded-lg md:rounded-full font-bold text-[10px] md:text-sm transition-all shadow-sm ${activeTab === tab.id
                ? 'bg-social-black dark:bg-white text-white dark:text-black shadow-lg ring-1 md:ring-2 ring-social-black dark:ring-white ring-offset-1 md:ring-offset-2 ring-offset-gray-50 dark:ring-offset-dark-bg transform scale-[1.02]'
                : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-border hover:bg-social-light-hover dark:hover:bg-social-dark-hover hover:border-social-black dark:hover:border-white'
                }`}
            >
              <tab.icon className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-brand-500" size={32} />
              </div>
            ) : purchases.length > 0 ? (
              purchases.map((purchase) => {
                const product = products.find(p => p.id === purchase.productId);
                return (
                  <div key={purchase.id} className="bg-white dark:bg-dark-surface rounded-xl p-4 md:p-6 border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 group">
                    <div className="w-full aspect-video md:w-48 md:h-48 md:aspect-square bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden flex-shrink-0 relative shadow-inner">
                      <Link href={getProductUrl({ category: product?.category || 'misc', slug: product?.slug || purchase.productId })} className="block w-full h-full">
                        {product?.imageUrl ? (
                          <Image
                            src={getCleanImageUrl(product.imageUrl)}
                            alt={purchase.productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-dark-bg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="flex-1 w-full text-left">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-dark-text-primary line-clamp-2">{purchase.productName}</h3>
                        <span className="font-mono text-sm font-bold text-social-black dark:text-white bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded hidden md:inline-block">
                          ${((product?.price || 0) / 100).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 dark:text-dark-text-secondary mb-6">
                        <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> {formatDate(purchase.purchaseDate)}</span>
                        <span className="flex items-center gap-1.5"><FileBox size={16} className="text-gray-400" /> STL Format</span>
                        <span className="font-mono text-social-black dark:text-white md:hidden font-bold bg-gray-100 dark:bg-dark-bg px-2 py-0.5 rounded">${((product?.price || 0) / 100).toFixed(2)}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                          onClick={() => handleDownload(purchase.productId, purchase.productName)}
                          disabled={downloadingId === purchase.productId}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-social-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {downloadingId === purchase.productId ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Download size={18} />
                          )}
                          {downloadingId === purchase.productId ? 'Generating Link...' : 'Download Files'}
                        </button>
                        <Link
                          href={getProductUrl({ category: product?.category || 'misc', slug: product?.slug || purchase.productId })}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-bg/80 text-gray-700 dark:text-dark-text-primary px-6 py-3 rounded-xl transition-all font-medium text-sm hover:shadow-md active:scale-95"
                        >
                          <ExternalLink size={18} /> View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-gray-50 dark:bg-dark-surface/50 rounded-xl border border-dashed border-gray-300 dark:border-dark-border">
                <Box size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-1">Your library is empty</h3>
                <p className="text-gray-500 dark:text-dark-text-secondary">Purchased items will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-dark-surface rounded-xl p-5 border border-gray-200 dark:border-dark-border shadow-sm hover:border-social-black dark:hover:border-white transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between sm:justify-start gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">
                            #{(order.transactionId || order.paymentId || order.id).slice(-8).toUpperCase()}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${(order.status === 'completed' || order.status === 'paid' || order.status === 'succeeded') ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                            order.status === 'refunded' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                              'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                            }`}>
                            {order.status}
                          </span>
                          {(order.mode === 'test' || order.isTest) && (
                            <span className="px-2.5 py-1 bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                              <TestTube2 size={12} /> Test Mode
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary flex items-center gap-2">
                          <Calendar size={14} /> {formatDate(order.date || order.createdAt)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto bg-gray-50 dark:bg-dark-bg/50 p-4 rounded-xl sm:bg-transparent sm:p-0 flex flex-row sm:flex-col justify-between items-center sm:items-end">
                        <div className="font-black text-2xl text-gray-900 dark:text-dark-text-primary">${(order.amount / 100).toFixed(2)}</div>
                        <div className="text-xs text-gray-500 font-medium bg-white dark:bg-dark-bg px-2 py-1 rounded-full border border-gray-200 dark:border-dark-border sm:border-none sm:bg-transparent sm:p-0">
                          {order.items.length} Item{order.items.length !== 1 && 's'}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-dark-border pt-4 mt-4">
                      <div className="flex flex-col gap-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm items-center p-2 hover:bg-gray-50 dark:hover:bg-dark-bg/30 rounded-lg transition-colors">
                            <span className="text-gray-700 dark:text-dark-text-secondary font-medium truncate pr-4 flex items-center gap-2">
                              <Box size={14} className="text-gray-400" />
                              {item.name}
                            </span>
                            <span className="text-gray-900 dark:text-dark-text-primary font-bold font-mono">${(item.price / 100).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 dark:bg-dark-surface/50 rounded-xl border border-dashed border-gray-300 dark:border-dark-border">
                <FileBox size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-1">No orders found</h3>
                <p className="text-gray-500 dark:text-dark-text-secondary">Your order history will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {wishlistProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map(product => (
                  <div key={product.id} className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all group flex flex-col">
                    <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-dark-bg">
                      <Link href={getProductUrl({ category: product.category, slug: product.slug })} className="block w-full h-full">
                        {product.imageUrl ? (
                          <Image
                            src={getCleanImageUrl(product.imageUrl)}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-dark-bg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-3 right-3 p-2.5 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all z-10 shadow-sm active:scale-90"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-1 text-lg line-clamp-1">{product.name}</h3>
                      <p className="text-social-black dark:text-white font-black text-xl mb-4">${(product.price / 100).toFixed(2)}</p>
                      <Link
                        href={getProductUrl({ category: product.category, slug: product.slug })}
                        className="mt-auto block w-full text-center py-3 bg-social-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 dark:bg-dark-surface/50 rounded-xl border border-dashed border-gray-300 dark:border-dark-border">
                <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-1">Your wishlist is empty</h3>
                <p className="text-gray-500 dark:text-dark-text-secondary">Save items you like to find them later.</p>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Box size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Total Items</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{purchases.length}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Total Spent</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      ${(purchases.reduce((acc, curr) => {
                        const product = products.find(p => p.id === curr.productId);
                        return acc + (product?.price || 0);
                      }, 0) / 100).toFixed(2)}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Member Since</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      {user?.metadata.creationTime ? new Date(user.metadata.creationTime).getFullYear() : new Date().getFullYear()}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT METHODS TAB */}
        {activeTab === 'payment' && (
          <div className="max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white dark:bg-dark-surface rounded-xl p-6 md:p-8 border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Saved Cards</h3>
                <button
                  onClick={handleAddPaymentMethod}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-social-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-4 py-3 rounded-xl transition-all font-bold shadow-md active:scale-95"
                >
                  <Plus size={18} /> Add New Card
                </button>
              </div>

              {isLoadingPayments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-brand-500" size={32} />
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div key={method.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors gap-4 group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-gray-100 dark:bg-dark-bg rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 dark:text-dark-text-secondary uppercase shrink-0 shadow-sm">
                          {method.brand}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">•••• {method.last4}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">Expires {method.expiryMonth}/{method.expiryYear}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-dark-border">
                        {method.isDefault && (
                          <span className="text-xs bg-gray-100 dark:bg-dark-bg text-social-black dark:text-white px-2.5 py-1 rounded-full font-bold">Default</span>
                        )}
                        <button
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label="Delete payment method"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-dark-surface/50 rounded-xl border border-dashed border-gray-300 dark:border-dark-border">
                  <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-dark-text-secondary font-medium">No payment methods saved.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB (Profile) */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white dark:bg-dark-surface rounded-xl p-6 md:p-8 border border-gray-200 dark:border-dark-border shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Account Settings</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-8">

                {/* Avatar Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 border-b border-gray-200 dark:border-dark-border pb-2">Profile Picture</h4>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center overflow-hidden border-4 border-white dark:border-dark-border shadow-md shrink-0">
                      {avatarPreview ? (
                        <Image src={getCleanImageUrl(avatarPreview)} alt="Profile Preview" fill className="object-cover" sizes="128px" />
                      ) : (
                        <UserIcon size={40} className="text-gray-400" />
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <label className="cursor-pointer bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-700 dark:text-dark-text-primary border border-gray-300 dark:border-dark-border px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center sm:justify-start gap-2 shadow-sm">
                        <Camera size={18} />
                        Change Photo
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-2">
                        JPG, GIF or PNG. Max size of 800K
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Info Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 border-b border-gray-200 dark:border-dark-border pb-2">Profile Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Display Name</label>
                      <input
                        type="text"
                        value={customerInfo.fullName}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Email Address</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">Changing email may require re-login.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                        placeholder="+1 555-123-4567"
                      />
                      <p className="text-xs text-gray-400 mt-1">Format: +1 555-123-4567</p>
                    </div>
                  </div>
                </div>

                {/* Social Media Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 border-b border-gray-200 dark:border-dark-border pb-2">Social Media</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Twitter</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerInfo.socialLinks?.twitter || ''}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, socialLinks: { ...customerInfo.socialLinks, twitter: e.target.value } })}
                          className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 pl-10 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                          placeholder="@username"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Instagram</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerInfo.socialLinks?.instagram || ''}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, socialLinks: { ...customerInfo.socialLinks, instagram: e.target.value } })}
                          className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 pl-10 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                          placeholder="@username"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Facebook</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerInfo.socialLinks?.facebook || ''}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, socialLinks: { ...customerInfo.socialLinks, facebook: e.target.value } })}
                          className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 pl-10 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                          placeholder="Profile URL or Username"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">LinkedIn</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerInfo.socialLinks?.linkedin || ''}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, socialLinks: { ...customerInfo.socialLinks, linkedin: e.target.value } })}
                          className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 pl-10 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                          placeholder="Profile URL"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Info Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 border-b border-gray-200 dark:border-dark-border pb-2">Billing Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Address</label>
                      <input
                        type="text"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">City</label>
                      <input
                        type="text"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Zip Code</label>
                      <input
                        type="text"
                        value={customerInfo.zipCode}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Country</label>
                      <select
                        value={customerInfo.country}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                      >
                        <option value="">Select Country</option>
                        {SUPPORTED_COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md active:scale-95"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Changes
                </button>
              </form>

              {/* Password Change Section */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-border">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                  <Lock size={20} /> Change Password
                </h4>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving || !newPassword}
                    className="w-full sm:w-auto bg-gray-900 dark:bg-dark-bg hover:bg-gray-800 dark:hover:bg-dark-bg/80 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md active:scale-95"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="mt-12 pt-8 border-t border-red-200 dark:border-red-900/30">
                <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} /> Danger Zone
                </h4>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
                  <h5 className="font-bold text-gray-900 dark:text-dark-text-primary mb-2">Delete Account</h5>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95"
                  >
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add Card Modal */}
      {
        isAddCardModalOpen && (
          <Elements stripe={getStripe()}>
            <AddCardModal
              isOpen={isAddCardModalOpen}
              onClose={() => setIsAddCardModalOpen(false)}
              onSuccess={handleCardAdded}
            />
          </Elements>
        )
      }
    </div >
  );
};