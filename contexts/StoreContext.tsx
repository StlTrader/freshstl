'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Product, CartItem, Purchase, Order } from '../types';
import * as firebaseService from '../services/firebaseService';
import { detectCurrency } from '../utils/currencyHelpers';
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
    currency: string;

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
    const [currency, setCurrency] = useState('USD');

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('freshstl_theme');
            return saved ? saved === 'dark' : false;
        }
        return false;
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

    // Currency Detection Effect
    useEffect(() => {
        const initCurrency = async () => {
            const detected = await detectCurrency();
            setCurrency(detected);
        };
        initCurrency();
    }, []);

    // --- Handlers ---

    const addToCart = (product: Product) => {
        try {
            // Sanitize product object to remove undefined values (Firestore doesn't like them)
            const sanitizedProduct = JSON.parse(JSON.stringify(product));

            const newItem: CartItem = {
                ...sanitizedProduct,
                price: sanitizedProduct.price || 0, // Ensure price exists
                cartItemId: Math.random().toString(36).substr(2, 9)
            };
            setCart(prev => [...prev, newItem]);
            setIsCartOpen(true);
        } catch (error) {
            console.error("Add to Cart Error:", error);
            alert("Failed to add to cart. Please try again.");
        }
    };

    const removeFromCart = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const clearCart = useCallback(() => setCart([]), []);

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

        // Handle Free Orders (Client-Side Fulfillment)
        if (totalAmount <= 0) {
            console.log("Processing free order...");
            await firebaseService.processFreeOrder(uid, orderData, purchaseRecords);
            return;
        }

        // REMOVED: Client-side DB writes. Fulfillment is now handled by the Webhook.
        // await firebaseService.processSuccessfulCheckout(uid, orderData, purchaseRecords);
        // await firebaseService.savePayment(paymentData);

        if (customerInfo) {
            await firebaseService.updateUser(uid, {
                phone: customerInfo.phone,
                address: customerInfo.address,
                city: customerInfo.city,
                zipCode: customerInfo.zipCode,
                country: customerInfo.country
            });
        }

        // Optional: Send email from client or move to webhook too? 
        // For now, keeping it here is okay, but webhook is better. 
        // Let's comment it out if we want pure server-side, but I'll leave it for now as a backup notification 
        // or remove it if the webhook handles emails (not yet implemented there).
        // Actually, let's keep it but maybe wrap in try/catch so it doesn't block UI.
        // if (customerInfo?.email) {
        //     try {
        //         await firebaseService.sendOrderConfirmationEmail(uid, customerInfo.email, orderData);
        //     } catch (e) { console.error("Failed to send email", e); }
        // }
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
            currency,
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
        // Fallback to prevent crashes if used outside provider (e.g. during specific SSR phases or errors)
        console.warn('useStore was used without a StoreProvider. Returning default/empty state.');
        return {
            user: null,
            products: [],
            cart: [],
            purchases: [],
            orders: [],
            wishlist: [],
            isDarkMode: false,
            isCartOpen: false,
            systemStatus: { isOnline: false, storageMode: 'unknown' },
            isLoadingPurchases: false,
            isAuthReady: false,
            currency: 'USD',
            toggleTheme: () => { },
            addToCart: () => { },
            removeFromCart: () => { },
            clearCart: () => { },
            setIsCartOpen: () => { },
            toggleWishlist: () => { },
            refreshPurchases: () => { },
            processCheckout: async () => { }
        };
    }
    return context;
}
