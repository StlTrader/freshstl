'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Product, CartItem, Purchase, Order } from '../types';
import * as firebaseService from '../services/firebaseService';

import * as paymentService from '../services/paymentService';

interface SystemStatus {
    isOnline: boolean;
    storageMode: string;
}

interface StoreContextType {
    user: User | null;
    products: Product[];
    cart: CartItem[];
    purchases: Purchase[];
    orders: Order[];
    wishlist: string[];
    isDarkMode: boolean;
    isCartOpen: boolean;
    systemStatus: SystemStatus;
    isLoadingPurchases: boolean;
    isAuthReady: boolean;

    // Actions
    toggleTheme: () => void;
    addToCart: (product: Product) => void;
    removeFromCart: (cartItemId: string) => void;
    clearCart: () => void;
    setIsCartOpen: (isOpen: boolean) => void;
    toggleWishlist: (productId: string) => void;
    refreshPurchases: () => void;
    processCheckout: (
        items: CartItem[],
        transactionId: string,
        discount: number,
        customerInfo?: {
            fullName: string;
            email: string;
            phone?: string;
            address?: string;
            city?: string;
            zipCode?: string;
            country?: string;
        },
        paymentMethod?: {
            cardBrand?: string;
            cardLast4?: string;
        }
    ) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    // --- State ---
    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

    const [systemStatus, setSystemStatus] = useState<SystemStatus>({ isOnline: false, storageMode: 'Checking...' });
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('freshstl_theme');
            return saved ? saved === 'dark' : true;
        }
        return true;
    });

    // --- Effects ---
    // Theme Effect
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('freshstl_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('freshstl_theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // Initialize Auth
    useEffect(() => {
        let isMounted = true;
        setSystemStatus(firebaseService.getSystemStatus());

        const unsubscribeAuth = firebaseService.subscribeToAuth((currentUser) => {
            if (isMounted) {
                setUser(currentUser);
                setSystemStatus(firebaseService.getSystemStatus());
                setIsAuthReady(true);
            }
        });

        firebaseService.authenticateUser().then((resultUser) => {
            if (isMounted && resultUser) {
                setUser((prev) => prev || resultUser);
                setSystemStatus(firebaseService.getSystemStatus());
            }
            if (isMounted) setIsAuthReady(true);
        });

        return () => {
            isMounted = false;
            unsubscribeAuth();
        };
    }, []);

    // Fetch Products (Public)
    useEffect(() => {
        const unsubscribe = firebaseService.subscribeToProducts((data) => {
            setProducts(data);
        }, false);
        return () => unsubscribe();
    }, []);

    // Fetch Purchases & Wishlist (Private)
    useEffect(() => {
        if (!user) {
            setPurchases([]);
            setOrders([]);
            setWishlist([]);
            return;
        }
        const uid = user.uid;
        setIsLoadingPurchases(true);

        const unsubPurchases = firebaseService.subscribeToPurchases(uid, (data) => {
            setPurchases(data);
            setIsLoadingPurchases(false);
        });

        const unsubOrders = firebaseService.subscribeToOrders(uid, (data) => {
            setOrders(data);
        });

        const unsubWishlist = firebaseService.subscribeToWishlist(uid, (ids) => {
            setWishlist(ids);
        });

        return () => {
            unsubPurchases();
            unsubOrders();
            unsubWishlist();
        };
    }, [user]);

    // Cart Persistence
    useEffect(() => {
        const savedCart = localStorage.getItem('freshstl_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('freshstl_cart', JSON.stringify(cart));
        if (user) {
            const timeoutId = setTimeout(() => {
                firebaseService.updateUserCart(user.uid, cart);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [cart, user]);

    // --- Handlers ---

    const addToCart = (product: Product) => {
        const newItem: CartItem = {
            ...product,
            cartItemId: Math.random().toString(36).substr(2, 9)
        };
        setCart(prev => [...prev, newItem]);
        setIsCartOpen(true);
    };

    const removeFromCart = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const clearCart = () => setCart([]);

    const toggleWishlist = (productId: string) => {
        if (!user) return;
        const isAdding = !wishlist.includes(productId);
        firebaseService.toggleWishlist(user.uid, productId, isAdding);
    };

    const refreshPurchases = () => {
        // Re-trigger fetch if needed, but subscription handles it.
    };

    const processCheckout = async (
        items: CartItem[],
        transactionId: string,
        discount: number,
        customerInfo?: {
            fullName: string;
            email: string;
            phone?: string;
            address?: string;
            city?: string;
            zipCode?: string;
            country?: string;
        },
        paymentMethod?: {
            cardBrand?: string;
            cardLast4?: string;
        }
    ) => {
        if (!user) return;
        const uid = user.uid;
        const totalAmount = items.reduce((sum, item) => sum + item.price, 0) - discount;
        const isTest = paymentService.getStripeMode() === 'test';

        const purchaseRecords: Omit<Purchase, 'id'>[] = items.map(item => ({
            transactionId,
            productId: item.id,
            productName: item.name,
            purchaseDate: firebaseService.getFirestoreTimestamp(),
            // Use sourceStoragePath if available (this is the protected STL/ZIP), 
            // otherwise fallback to modelUrl (GLB preview), 
            // otherwise fallback to a placeholder link.
            // Note: sourceStoragePath is a path, not a full URL. The UI must handle fetching the download URL.
            downloadLink: item.sourceStoragePath || item.modelUrl || `https://freshstl.com/downloads/${transactionId}/${item.id}`
        }));

        const orderData = {
            userId: uid,
            transactionId,
            amount: totalAmount,
            discountApplied: discount,
            items: items.map(i => ({ id: i.id, name: i.name, price: i.price, imageUrl: i.imageUrl })),
            customerInfo: customerInfo,
            isTest
        };

        await firebaseService.processSuccessfulCheckout(uid, orderData, purchaseRecords);

        const paymentData = {
            orderId: transactionId,
            userId: uid,
            amount: totalAmount,
            currency: 'usd' as const,
            status: 'succeeded' as const,
            paymentMethod: 'card',
            stripePaymentIntentId: transactionId,
            cardBrand: paymentMethod?.cardBrand || 'visa',
            cardLast4: paymentMethod?.cardLast4 || '4242',
            isTest
        };

        await firebaseService.savePayment(paymentData);

        if (customerInfo) {
            await firebaseService.updateUser(uid, {
                phone: customerInfo.phone,
                address: customerInfo.address,
                city: customerInfo.city,
                zipCode: customerInfo.zipCode,
                country: customerInfo.country
            });
        }

        if (customerInfo?.email) {
            await firebaseService.sendOrderConfirmationEmail(uid, customerInfo.email, orderData);
        }
    };

    return (
        <StoreContext.Provider value={{
            user,
            products,
            cart,
            purchases,
            orders,
            wishlist,
            isDarkMode,
            isCartOpen,
            systemStatus,
            isLoadingPurchases,
            isAuthReady,
            toggleTheme,
            addToCart,
            removeFromCart,
            clearCart,
            setIsCartOpen,
            toggleWishlist,
            refreshPurchases,
            processCheckout
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
