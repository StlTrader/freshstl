import { CartItem, StripeConfig } from '../types';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { db, auth } from './firebaseService';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { subscribeToStripeConfig } from './firebaseService';

interface CheckoutResponse {
  sessionId: string;
  clientSecret: string;
  success: boolean;
  error?: string;
}

// Default config
const DEFAULT_CONFIG: StripeConfig = {
  failureRate: 0,
  minDelay: 1000,
  maxDelay: 2500,
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: '',
  testPublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  testSecretKey: '',
  livePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  liveSecretKey: '',
  mode: 'test',
  isConnected: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
};

// Users allowed to use Test Mode
const TEST_MODE_WHITELIST = ['yassinebouomrine@gmail.com'];

// Load config from localStorage if available
const loadConfig = (): StripeConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem('freshstl_stripe_config');
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Failed to load Stripe config", e);
  }
  return DEFAULT_CONFIG;
};

let config: StripeConfig = loadConfig();

// Subscribe to global config changes
if (typeof window !== 'undefined') {
  subscribeToStripeConfig((newConfig) => {
    if (newConfig) {
      // Merge with existing to preserve defaults if partial
      setStripeConfig(newConfig);
    }
  });
}

let stripePromise: Promise<Stripe | null> | null = null;
let lastPublicKey: string | null = null;

// Get the active keys based on current mode
// Get the active keys based on current mode
const getActiveKeys = () => {
  const mode = getStripeMode();
  if (mode === 'live') {
    return {
      publicKey: config.livePublicKey || config.publicKey || '',
      secretKey: config.liveSecretKey || config.secretKey || ''
    };
  }
  return {
    publicKey: config.testPublicKey || config.publicKey || '',
    secretKey: config.testSecretKey || config.secretKey || ''
  };
};

export const setStripeConfig = (newConfig: Partial<StripeConfig>) => {
  config = { ...config, ...newConfig };

  // Persist to localStorage
  try {
    localStorage.setItem('freshstl_stripe_config', JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save Stripe config", e);
  }

  // Reset stripe promise if key changes
  const activeKeys = getActiveKeys();
  if (activeKeys.publicKey !== lastPublicKey) {
    stripePromise = null;
    lastPublicKey = activeKeys.publicKey;
  }
};

export const getStripeConfig = () => ({ ...config });

export const getStripe = () => {
  const activeKeys = getActiveKeys();
  if (!stripePromise && activeKeys.publicKey) {
    stripePromise = loadStripe(activeKeys.publicKey);
    lastPublicKey = activeKeys.publicKey;
  }
  return stripePromise;
};

export const getStripeMode = () => {
  if (config.mode === 'test') {
    // Only allow whitelisted users to use Test Mode
    const user = auth?.currentUser;
    if (user && user.email && TEST_MODE_WHITELIST.includes(user.email)) {
      return 'test';
    }
    // Everyone else falls back to Live Mode
    return 'live';
  }
  return config.mode;
};

// --- Real Stripe Integration (Client-Side for Demo) ---

/**
 * DANGER: This function uses the Secret Key on the client side.
 * This is ONLY for demonstration purposes where no backend server exists.
 * In production, this MUST be done on a secure server.
 * 
 * SECURITY WARNING: Exposing your Stripe Secret Key allows anyone to perform 
 * actions on your Stripe account. Do not use real keys with real money 
 * in this configuration unless you understand the risks.
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  customerInfo?: {
    fullName: string;
    email: string;
    address?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  },
  saveCard: boolean = false,
  paymentMethodId?: string
): Promise<{ clientSecret: string } | null> => {
  const user = auth?.currentUser;
  if (!user) {
    console.warn("User not logged in. Attempting anonymous login...");
    throw new Error("User must be logged in to checkout.");
  }

  try {
    if (!db) {
      throw new Error("Firestore is not initialized. Cannot create payment session.");
    }

    // Check for Test Mode
    if (getStripeMode() === 'test') {
      console.log("[Payment] Using Test Mode API Route");
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          customerInfo,
          saveCard,
          paymentMethodId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }
      return { clientSecret: data.clientSecret };
    }

    // 1. Create a document in the customers/{uid}/checkout_sessions collection
    const collectionPath = `customers/${user.uid}/checkout_sessions`;
    const collectionRef = collection(db, 'customers', user.uid, 'checkout_sessions');
    console.log(`[Payment] Creating session doc for user: ${user.uid}`);
    console.log(`[Payment] Writing to path: ${collectionPath}`);

    const docData: any = {
      client: 'mobile',
      mode: 'payment',
      amount: Math.round(amount), // Add amount at top level as well
      currency: currency,         // Add currency at top level as well
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: 'Total Purchase',
          },
          unit_amount: Math.round(amount),
        },
        quantity: 1,
      }],
      // Pass customer details for Stripe Metadata / Receipt
      metadata: {
        customer_email: customerInfo?.email || user.email || 'guest@example.com',
        customer_name: customerInfo?.fullName || user.displayName || 'Guest',
        shipping_address: customerInfo ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.zipCode}, ${customerInfo.country}` : ''
      },
      receipt_email: customerInfo?.email || user.email,
      // Billing details for the PaymentIntent
      billing_details: customerInfo ? {
        name: customerInfo.fullName,
        email: customerInfo.email,
        address: {
          line1: customerInfo.address,
          city: customerInfo.city,
          postal_code: customerInfo.zipCode,
          country: customerInfo.country,
        }
      } : undefined,
    };

    // If saving card, set setup_future_usage
    if (saveCard) {
      docData.payment_intent_data = {
        setup_future_usage: 'off_session',
      };
    }

    // If using a saved payment method
    if (paymentMethodId) {
      docData.payment_method = paymentMethodId;
    }

    console.log('[Payment] Document Data:', docData);

    const docRef = await addDoc(collectionRef, docData);

    console.log(`[Payment] Document created with ID: ${docRef.id}. Waiting for Extension...`);

    // 2. Listen for the 'client_secret' to be written by the extension
    return new Promise((resolve, reject) => {
      let unsubscribe: () => void;

      const timeoutId = setTimeout(() => {
        if (unsubscribe) unsubscribe();
        console.error(`[Payment] Timeout waiting for doc: ${docRef.path}`);
        reject(new Error(`Payment initialization timed out. Document created at: ${docRef.path}. Check Firebase Console if this document exists and if Extension processed it.`));
      }, 30000); // Increased to 30 second timeout

      unsubscribe = onSnapshot(docRef, (snapshot) => {
        const data = snapshot.data();
        console.log(`[Payment] Snapshot update for ${docRef.id}:`, data);

        if (data) {
          // The extension returns 'paymentIntentClientSecret' or 'client_secret'
          const secret = data.paymentIntentClientSecret || data.client_secret;

          if (secret) {
            console.log(`[Payment] Received client_secret!`);
            clearTimeout(timeoutId);
            unsubscribe();
            resolve({ clientSecret: secret });
          }
          if (data.error) {
            console.error(`[Payment] Extension returned error:`, data.error);
            clearTimeout(timeoutId);
            unsubscribe();
            reject(new Error(data.error.message));
          }
        }
      }, (error) => {
        console.error(`[Payment] Snapshot error:`, error);
        clearTimeout(timeoutId);
        unsubscribe();
        reject(error);
      });
    });
  } catch (error: any) {
    console.error("Payment Intent Creation Error:", error);
    throw new Error(error.message || 'Failed to create PaymentIntent via Extension');
  }
};


// --- Simulation Logic ---

// --- Simulation Logic REMOVED ---
// The user has requested to strictly use the Firebase Stripe Extension.
// All payment logic is handled by createPaymentIntent above.

// --- Payment Method Management (Real Persistence) ---

import { PaymentMethod } from '../types';
import * as firebaseService from './firebaseService';



export const createSetupIntent = async (
  customerInfo?: {
    fullName: string;
    email: string;
  }
): Promise<{ clientSecret: string } | null> => {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error("User must be logged in to setup a card.");
  }

  try {
    if (!db) {
      throw new Error("Firestore is not initialized.");
    }
    const collectionRef = collection(db, 'customers', user.uid, 'checkout_sessions');
    console.log(`[Payment] Creating setup session doc for user: ${user.uid}`);

    const docData: any = {
      client: 'mobile',
      mode: 'setup',
      currency: 'usd',
      metadata: {
        customer_email: customerInfo?.email || user.email,
        customer_name: customerInfo?.fullName || user.displayName,
      }
    };

    const docRef = await addDoc(collectionRef, docData);
    console.log(`[Payment] Setup doc created with ID: ${docRef.id}`);

    return new Promise((resolve, reject) => {
      let unsubscribe: () => void;
      const timeoutId = setTimeout(() => {
        if (unsubscribe) unsubscribe();
        reject(new Error("Setup initialization timed out."));
      }, 15000);

      unsubscribe = onSnapshot(docRef, (snapshot) => {
        const data = snapshot.data();
        if (data) {
          // Extension returns 'client_secret' or 'setupIntentClientSecret'
          const secret = data.client_secret || data.setupIntentClientSecret;
          if (secret) {
            clearTimeout(timeoutId);
            unsubscribe();
            resolve({ clientSecret: secret });
          }
          if (data.error) {
            clearTimeout(timeoutId);
            unsubscribe();
            reject(new Error(data.error.message));
          }
        }
      }, (error) => {
        clearTimeout(timeoutId);
        unsubscribe();
        reject(error);
      });
    });
  } catch (error: any) {
    console.error("Setup Intent Creation Error:", error);
    throw new Error(error.message || 'Failed to create SetupIntent');
  }
};

export const getSavedPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  // Use Firebase persistence
  return await firebaseService.getUserPaymentMethods(userId);
};

export const savePaymentMethod = async (userId: string, method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
  // Use Firebase persistence
  const savedMethod = await firebaseService.addUserPaymentMethod(userId, method);
  return savedMethod;
};

export const deletePaymentMethod = async (userId: string, methodId: string): Promise<void> => {
  // Use Firebase persistence
  await firebaseService.removeUserPaymentMethod(userId, methodId);
};