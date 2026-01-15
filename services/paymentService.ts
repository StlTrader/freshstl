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
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || '', // Default to test key for safety
  testPublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || '',
  livePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE || '',
  mode: (process.env.NEXT_PUBLIC_STRIPE_MODE as 'test' | 'live') || 'test',
  isConnected: !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE),
  testerEmails: [] // Removed hardcoded email
};

// Load config from localStorage if available
const loadConfig = (): StripeConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem('freshstl_stripe_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure testerEmails exists if loading from old config
      if (!parsed.testerEmails) parsed.testerEmails = DEFAULT_CONFIG.testerEmails;

      // Always prioritize env vars for keys over localStorage to avoid stale keys
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        testPublicKey: DEFAULT_CONFIG.testPublicKey,
        livePublicKey: DEFAULT_CONFIG.livePublicKey
      };
    }
  } catch (e) {
    console.warn("Failed to load Stripe config", e);
  }
  // Validation: Check for Test Key in Live Slot
  if (DEFAULT_CONFIG.livePublicKey && DEFAULT_CONFIG.livePublicKey.startsWith('pk_test_')) {
    console.error("CRITICAL CONFIG ERROR: The 'Live Public Key' appears to be a Test Key (starts with pk_test_). Please check your environment variables or Firestore settings.");
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
const getActiveKeys = () => {
  const mode = getStripeMode();
  if (mode === 'live') {
    return {
      publicKey: config.livePublicKey || ''
    };
  }
  return {
    publicKey: config.testPublicKey || ''
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

export const getStripe = (forceMode?: 'test' | 'live') => {
  const activeKeys = getActiveKeys();

  // If a specific mode is forced, use that key
  let targetKey = activeKeys.publicKey;
  if (forceMode === 'test') targetKey = config.testPublicKey || '';
  if (forceMode === 'live') targetKey = config.livePublicKey || '';

  // Check if we need to reset the promise (key changed or forced mode differs from current promise's key)
  if (stripePromise && targetKey !== lastPublicKey) {
    console.log(`[Stripe] Key changed (Force: ${forceMode}). Resetting Stripe promise.`);
    stripePromise = null;
  }

  if (!stripePromise && targetKey) {
    console.log(`[PaymentService] Initializing Stripe with key prefix: ${targetKey.substring(0, 8)}...`);
    stripePromise = loadStripe(targetKey);
    lastPublicKey = targetKey;
  }
  return stripePromise;
};

export const getStripeMode = () => {
  // STRICT ENFORCEMENT: Only whitelisted users can use Test Mode
  const user = auth?.currentUser;
  const whitelist = config.testerEmails || [];

  // If user IS in whitelist, FORCE Test Mode
  if (user && user.email && whitelist.includes(user.email)) {
    return 'test';
  }

  // Everyone else gets Live Mode
  return 'live';
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
  paymentMethodId?: string,
  items?: any[] // Added items argument
): Promise<{ clientSecret: string, mode: 'test' | 'live' } | null> => {
  const user = auth?.currentUser;
  if (!user) {
    console.warn("User not logged in. Attempting anonymous login...");
    throw new Error("User must be logged in to checkout.");
  }

  try {
    const mode = getStripeMode();
    console.log(`[Payment] Initializing payment in ${mode} mode via API`);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency,
        customerInfo,
        saveCard,
        paymentMethodId,
        mode, // Pass the mode to the API
        items: items || [],
        userId: user.uid
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Payment failed');
    }

    // The server should ideally return the mode it used, but for now we trust our local calculation
    // or we could update the API to return it. 
    // Let's assume the API respects our requested mode if we are whitelisted.
    // To be safe, let's return the mode we *requested* which is what the server *should* have used.
    return { clientSecret: data.clientSecret, mode };

  } catch (error: any) {
    console.error("Payment Intent Creation Error:", error);
    throw new Error(error.message || 'Failed to create PaymentIntent');
  }
};


// --- Simulation Logic ---

// --- Simulation Logic REMOVED ---
// The user has requested to strictly use the Firebase Stripe Extension.
// All payment logic is handled by createPaymentIntent above.

// --- Payment Method Management (Real Persistence) ---

import { PaymentMethod } from '../types';
import * as firebaseService from './firebaseService';





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

export const deleteTestData = async () => {
  const whitelist = config.testerEmails || [];
  if (whitelist.length === 0) {
    console.warn("No tester emails defined. Cannot delete test data.");
    return;
  }

  console.log("Deleting test data for users:", whitelist);

  // We will call a firebaseService method to handle the actual deletion
  // as it requires access to collections and batch operations
  await firebaseService.deleteDataForTestUsers(whitelist);
};