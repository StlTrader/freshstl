import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  increment,
  writeBatch,
  query,
  where,
  getDocs,
  getDoc,
  Firestore,
  Timestamp,
  serverTimestamp,
  orderBy,
  runTransaction,
  limit
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  FirebaseStorage,
  deleteObject
} from 'firebase/storage';

// ... (existing imports)















import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  Auth,
  User,
  EmailAuthProvider,
  linkWithCredential,
  updateEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updatePassword,
  deleteUser as deleteAuthUser
} from 'firebase/auth';
import { Product, CartItem, Purchase, Order, Review, Coupon, Payment, CustomerInfo, Category, BuilderCategory, BuilderAsset, BlogPost, Collection } from '../types';
import { getFunctions, httpsCallable } from 'firebase/functions';

// --- Configuration ---
// --- Configuration ---
const FALLBACK_APP_ID = 'demo-app';
const APP_ID = (typeof window !== 'undefined' && window.__app_id) || FALLBACK_APP_ID;

// Local Storage Keys for Fallback Mode
const LS_KEYS = {
  PRODUCTS: `freshstl_${APP_ID}_products`,
  PURCHASES: `freshstl_${APP_ID}_purchases`,
  ORDERS: `freshstl_${APP_ID}_orders`,
  PAYMENTS: `freshstl_${APP_ID}_payments`,
  USER: `freshstl_${APP_ID}_user`,
  WISHLIST: `freshstl_${APP_ID}_wishlist`,
  REVIEWS: `freshstl_${APP_ID}_reviews`,
  CATEGORIES: `freshstl_${APP_ID}_categories`
};

export let app: FirebaseApp | undefined;
export let db: Firestore | undefined;
export let auth: Auth | undefined;
export let storage: FirebaseStorage | undefined;

// --- Social Auth ---
export const signInWithGoogle = async () => {
  if (isMockFallback || !auth) {
    console.log("Mock Google Sign In");
    return {
      uid: 'mock_google_' + Date.now(),
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: null
    } as any;
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // Create user doc if not exists
    const userRef = doc(db!, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        createdAt: serverTimestamp(),
        role: 'customer',
        photoURL: result.user.photoURL
      }, { merge: true });
    }
    return result.user;
  } catch (error) {
    console.error("Google Sign In Error", error);
    throw error;
  }
};

export const signInWithFacebook = async () => {
  if (isMockFallback || !auth) {
    console.log("Mock Facebook Sign In");
    return {
      uid: 'mock_facebook_' + Date.now(),
      email: 'facebook@example.com',
      displayName: 'Facebook User',
      photoURL: null
    } as any;
  }
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // Create user doc if not exists
    const userRef = doc(db!, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        createdAt: serverTimestamp(),
        role: 'customer',
        photoURL: result.user.photoURL
      }, { merge: true });
    }
    return result.user;
  } catch (error) {
    console.error("Facebook Sign In Error", error);
    throw error;
  }
};
let analytics: any | undefined;
let isMockFallback = false;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC0z4o3dtUuSdeQt4ENzgQ3ey5TQhyWKes",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "freshstlstore-99511217-ca510.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "freshstlstore-99511217-ca510",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "freshstlstore-99511217-ca510.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1086916049812",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1086916049812:web:bc21619cfd885cfecead81",
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-78H2XBXJV9"
};

// --- Initialization ---
try {
  let config = firebaseConfig;
  if (typeof window !== 'undefined' && window.__firebase_config) {
    config = window.__firebase_config;
    console.log("Firebase Config Source: Window Object");
  } else {
    console.warn("WARNING: Using Env/Default Firebase Config. Ensure this is intended for Production.");
  }
  console.log("Firebase Project ID:", config.projectId);
  // console.log("Firebase Config:", config); // Uncomment for full debug if needed

  app = initializeApp(config);

  // Initialize Auth
  try {
    auth = getAuth(app);
    console.log("Auth initialized successfully");
  } catch (e) {
    console.warn("Auth initialization failed:", e);
    isMockFallback = true;
  }

  // Initialize Firestore
  try {
    db = getFirestore(app);
    console.log("Firestore initialized successfully");
  } catch (e) {
    console.warn("Firestore initialization failed:", e);
    isMockFallback = true; // Use fallback if DB is missing
  }

  // Initialize Storage
  try {
    storage = getStorage(app);
    console.log("Storage initialized successfully");
  } catch (e) {
    console.warn("Storage initialization failed:", e);
  }

  // Initialize Analytics
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.log("Analytics not available in this environment.");
  }

  console.log("Firebase initialized. Project:", config.projectId);
} catch (e) {
  console.error("Critical Firebase Error. Switching to Offline Mode.", e);
  isMockFallback = true;
}

export const getAppId = () => APP_ID;
export const getSystemStatus = () => ({
  isOnline: !isMockFallback,
  projectId: firebaseConfig.projectId,
  storageMode: isMockFallback ? 'Local Browser Storage' : 'Google Cloud Firestore',
  hasStorage: !!storage
});

// --- Helper: Mock Data Management ---

// Default products for fresh store
export const DEFAULT_MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cyberpunk Oni Mask',
    price: 1500,
    description: 'High-detail mask for cosplay. Features separated parts for easy printing and assembly. Optimized for FDM printers.',
    imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Oni+Mask',
    modelUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl',
    category: 'Cosplay',
    sales: 12,
    rating: 4.8,
    reviewCount: 5,
    tags: ['cyberpunk', 'mask', 'wearable'],
    slug: 'cyberpunk-oni-mask'
  },
  {
    id: '2',
    name: 'Ancient Red Dragon',
    price: 2500,
    description: 'Colossal dragon miniature. Standing 200mm tall, this model comes pre-supported and hollowed.',
    imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Dragon',
    modelUrl: '',
    category: 'Miniatures',
    sales: 45,
    rating: 5.0,
    reviewCount: 12,
    tags: ['fantasy', 'dragon', 'dnd'],
    slug: 'ancient-red-dragon'
  },
  {
    id: '3',
    name: 'Voronoi Planter',
    price: 500,
    description: 'Modern geometric planter with Voronoi pattern. Perfect for succulents. Prints without supports.',
    imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Planter',
    modelUrl: '',
    category: 'Home Decor',
    sales: 8,
    rating: 4.2,
    reviewCount: 3,
    tags: ['home', 'modern', 'vase'],
    slug: 'voronoi-planter'
  },
  {
    id: '4',
    name: 'Mandalorian Helmet',
    price: 3500,
    description: 'Screen-accurate Mandalorian helmet. Full size wearable replica with separate visor piece.',
    imageUrl: 'https://placehold.co/400x400/374151/white?text=Mando+Helmet',
    modelUrl: '',
    category: 'Cosplay',
    sales: 28,
    rating: 4.9,
    reviewCount: 15,
    tags: ['starwars', 'helmet', 'cosplay'],
    slug: 'mandalorian-helmet'
  },
  {
    id: '5',
    name: 'Articulated Crystal Dragon',
    price: 1200,
    description: 'Print-in-place articulated dragon. No assembly required. Flexible joints for posing.',
    imageUrl: 'https://placehold.co/400x400/4b5563/white?text=Flexi+Dragon',
    modelUrl: '',
    category: 'Toys',
    sales: 89,
    rating: 4.7,
    reviewCount: 32,
    tags: ['articulated', 'dragon', 'fidget'],
    slug: 'articulated-crystal-dragon'
  },
  {
    id: '6',
    name: 'Geometric Desk Organizer',
    price: 800,
    description: 'Modular honeycomb desk organizer. Stack and combine pieces to fit your workspace.',
    imageUrl: 'https://placehold.co/400x400/6b7280/white?text=Organizer',
    modelUrl: '',
    category: 'Home Decor',
    sales: 34,
    rating: 4.5,
    reviewCount: 8,
    tags: ['office', 'organization', 'modular'],
    slug: 'geometric-desk-organizer'
  },
  {
    id: '7',
    name: 'Goblin King Miniature',
    price: 600,
    description: '32mm scale tabletop miniature. Highly detailed with ornate throne base.',
    imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Goblin+King',
    modelUrl: '',
    category: 'Miniatures',
    sales: 56,
    rating: 4.8,
    reviewCount: 18,
    tags: ['goblin', 'dnd', 'tabletop'],
    slug: 'goblin-king-miniature'
  },
  {
    id: '8',
    name: 'Mechanical Keyboard Keycaps Set',
    price: 2000,
    description: 'Full set of 104 artisan keycaps with custom legends. Cherry MX compatible.',
    imageUrl: 'https://placehold.co/400x400/374151/white?text=Keycaps',
    modelUrl: '',
    category: 'Tech',
    sales: 22,
    rating: 4.6,
    reviewCount: 9,
    tags: ['keyboard', 'tech', 'gaming'],
    slug: 'mechanical-keyboard-keycaps-set'
  },
  {
    id: '9',
    name: 'Low Poly Wolf Sculpture',
    price: 900,
    description: 'Elegant low-poly wolf sculpture. Perfect centerpiece for your desk or shelf.',
    imageUrl: 'https://placehold.co/400x400/4b5563/white?text=Wolf',
    modelUrl: '',
    category: 'Art',
    sales: 41,
    rating: 4.4,
    reviewCount: 11,
    tags: ['lowpoly', 'animal', 'sculpture'],
    slug: 'low-poly-wolf-sculpture'
  },
  {
    id: '10',
    name: 'Phone Stand - Samurai',
    price: 700,
    description: 'Samurai warrior themed phone stand. Holds phones up to 7 inches.',
    imageUrl: 'https://placehold.co/400x400/6b7280/white?text=Phone+Stand',
    modelUrl: '',
    category: 'Tech',
    sales: 67,
    rating: 4.3,
    reviewCount: 21,
    tags: ['phone', 'stand', 'samurai'],
    slug: 'phone-stand-samurai'
  },
  {
    id: '11',
    name: 'Baby Yoda / Grogu',
    price: 1100,
    description: 'Adorable Grogu figure with floating pod. Multi-part assembly for easy painting.',
    imageUrl: 'https://placehold.co/400x400/1f2937/white?text=Grogu',
    modelUrl: '',
    category: 'Toys',
    sales: 112,
    rating: 5.0,
    reviewCount: 45,
    tags: ['starwars', 'grogu', 'baby yoda'],
    slug: 'baby-yoda-grogu'
  },
  {
    id: '12',
    name: 'Dungeon Terrain Set',
    price: 4500,
    description: 'Complete modular dungeon terrain set. Includes walls, floors, doors, and props.',
    imageUrl: 'https://placehold.co/400x400/374151/white?text=Dungeon+Set',
    modelUrl: '',
    category: 'Miniatures',
    sales: 19,
    rating: 4.9,
    reviewCount: 7,
    tags: ['terrain', 'dnd', 'modular'],
    slug: 'dungeon-terrain-set'
  },
  {
    id: 'ffffffffff',
    name: 'Test Product',
    price: 9999,
    description: 'Debug product for 3D viewer testing.',
    imageUrl: 'https://placehold.co/400x400/374151/white?text=Debug',
    modelUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl',
    category: 'Debug',
    sales: 0,
    rating: 5.0,
    reviewCount: 0,
    tags: ['debug'],
    slug: 'test-product'
  }
];

const MOCK_COUPONS: Coupon[] = [
  { code: 'FRESH10', discountPercent: 10, isActive: true },
  { code: 'MAKER20', discountPercent: 20, isActive: true },
  { code: 'WELCOME15', discountPercent: 15, isActive: true },
  { code: 'ADMIN100', discountPercent: 100, isActive: true }
];

// Test Users for seeding
const MOCK_USERS = [
  {
    id: 'user_john_doe',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'user_jane_smith',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    createdAt: '2024-02-20T14:45:00Z'
  },
  {
    id: 'user_mike_wilson',
    email: 'mike.wilson@example.com',
    displayName: 'Mike Wilson',
    createdAt: '2024-03-10T09:15:00Z'
  }
];

// Test Orders for seeding
const MOCK_ORDERS: any[] = [
  {
    id: 'order_001',
    userId: 'user_john_doe',
    transactionId: 'txn_abc123xyz',
    amount: 4000, // $40.00
    discountApplied: 0,
    items: [
      { id: '1', name: 'Cyberpunk Oni Mask', price: 1500 },
      { id: '2', name: 'Ancient Red Dragon', price: 2500 }
    ],
    date: '2024-11-01T14:30:00Z',
    status: 'completed',
    customerInfo: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555-0101',
      address: '123 Main Street',
      city: 'New York',
      zipCode: '10001',
      country: 'United States'
    },
    paymentId: 'pay_001'
  },
  {
    id: 'order_002',
    userId: 'user_jane_smith',
    transactionId: 'txn_def456uvw',
    amount: 3500, // $35.00
    discountApplied: 350, // 10% discount
    items: [
      { id: '4', name: 'Mandalorian Helmet', price: 3500 }
    ],
    date: '2024-11-05T09:15:00Z',
    status: 'completed',
    customerInfo: {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 555-0202',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      zipCode: '90001',
      country: 'United States'
    },
    paymentId: 'pay_002'
  },
  {
    id: 'order_003',
    userId: 'user_mike_wilson',
    transactionId: 'txn_ghi789rst',
    amount: 2000, // $20.00
    discountApplied: 0,
    items: [
      { id: '5', name: 'Articulated Crystal Dragon', price: 1200 },
      { id: '6', name: 'Geometric Desk Organizer', price: 800 }
    ],
    date: '2024-11-10T16:45:00Z',
    status: 'completed',
    customerInfo: {
      fullName: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      phone: '+1 555-0303',
      address: '789 Pine Road',
      city: 'Chicago',
      zipCode: '60601',
      country: 'United States'
    },
    paymentId: 'pay_003'
  },
  {
    id: 'order_004',
    userId: 'user_john_doe',
    transactionId: 'txn_jkl012mno',
    amount: 1100, // $11.00
    discountApplied: 0,
    items: [
      { id: '11', name: 'Baby Yoda / Grogu', price: 1100 }
    ],
    date: '2024-11-15T11:20:00Z',
    status: 'completed',
    customerInfo: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      address: '123 Main Street',
      city: 'New York',
      zipCode: '10001',
      country: 'United States'
    },
    paymentId: 'pay_004'
  },
  {
    id: 'order_005',
    userId: 'user_jane_smith',
    transactionId: 'txn_pqr345stu',
    amount: 4500, // $45.00
    discountApplied: 900, // 20% discount
    items: [
      { id: '12', name: 'Dungeon Terrain Set', price: 4500 }
    ],
    date: '2024-11-20T13:00:00Z',
    status: 'completed',
    customerInfo: {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 555-0202',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      zipCode: '90001',
      country: 'United States'
    },
    paymentId: 'pay_005'
  }
];

// Test Payments for seeding
const MOCK_PAYMENTS: any[] = [
  {
    id: 'pay_001',
    orderId: 'order_001',
    userId: 'user_john_doe',
    amount: 4000,
    currency: 'usd',
    status: 'succeeded',
    paymentMethod: 'card',
    stripePaymentIntentId: 'pi_1abc123xyz',
    cardBrand: 'visa',
    cardLast4: '4242',
    createdAt: '2024-11-01T14:30:00Z'
  },
  {
    id: 'pay_002',
    orderId: 'order_002',
    userId: 'user_jane_smith',
    amount: 3150, // After 10% discount
    currency: 'usd',
    status: 'succeeded',
    paymentMethod: 'card',
    stripePaymentIntentId: 'pi_2def456uvw',
    cardBrand: 'mastercard',
    cardLast4: '5555',
    createdAt: '2024-11-05T09:15:00Z'
  },
  {
    id: 'pay_003',
    orderId: 'order_003',
    userId: 'user_mike_wilson',
    amount: 2000,
    currency: 'usd',
    status: 'succeeded',
    paymentMethod: 'card',
    stripePaymentIntentId: 'pi_3ghi789rst',
    cardBrand: 'amex',
    cardLast4: '1234',
    createdAt: '2024-11-10T16:45:00Z'
  }
];

// Helper to fake a Firestore Timestamp
const createFakeTimestamp = (dateInput?: any) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date
  } as Timestamp;
};

// --- Mock Event System ---
const listeners: Record<string, Function[]> = {};
const emitChange = (key: string) => {
  if (listeners[key]) listeners[key].forEach(cb => cb());
};
const subscribeMock = (key: string, callback: Function) => {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);
  return () => {
    listeners[key] = listeners[key].filter(cb => cb !== callback);
  };
};

// --- Auth Methods ---
const createMockUser = (email: string | null = null, displayName: string = 'Guest User'): User => {
  return {
    uid: email ? 'mock_' + email.replace(/[^a-zA-Z0-9]/g, '') : 'mock_guest_' + Math.random().toString(36).substr(2, 5),
    email: email,
    emailVerified: !!email,
    isAnonymous: !email,
    displayName: displayName,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => { },
    getIdToken: async () => 'mock_token',
    getIdTokenResult: async () => ({ token: 'mock', claims: {}, authTime: '', expirationTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null }),
    reload: async () => { },
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
  } as unknown as User;
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  // Always try to listen to real auth first
  if (auth) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if blocked
        try {
          if (db) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().isBlocked) {
              if (auth) await signOut(auth);
              callback(null);
              alert("Your account has been blocked by an administrator.");
              return;
            }
          }
        } catch (e) {
          console.error("Error checking block status:", e);
        }
        callback(user);
      } else {
        // If no real user, check if we should be in fallback mode or just logged out
        if (isMockFallback) {
          const loadLocalAuth = () => {
            const stored = localStorage.getItem(LS_KEYS.USER);
            callback(stored ? JSON.parse(stored) : null);
          }
          loadLocalAuth();
          // We can't easily unsubscribe from the mock listener here without returning it, 
          // but this is a hybrid edge case. 
          // For now, if real auth exists, we trust it.
        } else {
          callback(null);
        }
      }
    });
  }

  // Pure fallback mode
  if (isMockFallback || !auth) {
    const loadLocalAuth = () => {
      const stored = localStorage.getItem(LS_KEYS.USER);
      callback(stored ? JSON.parse(stored) : null);
    }
    loadLocalAuth();
    return subscribeMock(LS_KEYS.USER, loadLocalAuth);
  }

  return () => { };
};

export const authenticateUser = async (): Promise<User | null> => {
  if (auth) {
    try {
      if (auth.currentUser) return auth.currentUser;
      // Don't auto-sign in anonymously if we want explicit login, 
      // but if the app requires it, we can keep it. 
      // For a store, usually you can browse without login.
      // Let's check if we have a stored user in local storage to "restore" session if needed,
      // but Firebase SDK handles persistence.
      return null;
    } catch (error: any) {
      console.warn("Auth check failed:", error);
    }
  }

  if (isMockFallback || !auth) {
    const stored = localStorage.getItem(LS_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

// --- Auth Wrappers ---


export const login = async (email: string, password: string): Promise<User> => {
  if (auth) {
    try {
      const creds = await signInWithEmailAndPassword(auth, email, password);

      // Self-healing: Ensure Firestore document exists
      if (db && creds.user) {
        const userRef = doc(db, 'users', creds.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.warn("User document missing for existing auth user. Re-creating...");
          await setDoc(userRef, {
            email: email,
            displayName: creds.user.displayName || email.split('@')[0],
            createdAt: serverTimestamp(),
            role: 'customer',
            photoURL: creds.user.photoURL
          });
        }
      }

      return creds.user;
    } catch (e: any) {
      // Only fallback if it's a network/internal error, not wrong credentials
      if (e.code === 'auth/network-request-failed' || e.code === 'auth/internal-error') {
        console.warn("Network error, trying fallback", e);
        // fallthrough to fallback
      } else {
        throw e;
      }
    }
  }

  // Fallback / Mock
  await new Promise(r => setTimeout(r, 600));

  // Simple mock validation
  if (email === 'fail@test.com') throw new Error("Invalid credentials");

  const user = createMockUser(email, email.split('@')[0]);
  localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
  emitChange(LS_KEYS.USER);
  return user;
};

export const register = async (email: string, pass: string, name: string): Promise<User> => {
  if (auth) {
    try {
      const creds = await createUserWithEmailAndPassword(auth, email, pass);
      if (creds.user) {
        await updateProfile(creds.user, { displayName: name });
        // Create user document in Firestore
        try {
          await setDoc(doc(db!, 'users', creds.user.uid), {
            email: email,
            displayName: name,
            createdAt: serverTimestamp(),
            role: 'customer'
          });
        } catch (fsError) {
          console.error("Firestore user creation failed during registration:", fsError);
          // Optional: Delete the auth user to rollback? 
          // For now, we rely on the self-healing in 'login' to fix this next time.
          // But we should probably alert the user or try again.
        }
      }
      return creds.user;
    } catch (e: any) {
      if (e.code === 'auth/network-request-failed') {
        // fallthrough
      } else {
        throw e;
      }
    }
  }

  await new Promise(r => setTimeout(r, 600));
  const user = createMockUser(email, name);
  localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
  emitChange(LS_KEYS.USER);
  return user;
};

export const logout = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) { console.error(e); }
  }

  // Always clear local storage too just in case
  localStorage.removeItem(LS_KEYS.USER);
  emitChange(LS_KEYS.USER);
};

export const updateUserProfile = async (displayName: string) => {
  if (isMockFallback || !auth) {
    const stored = localStorage.getItem(LS_KEYS.USER);
    if (stored) {
      const user = JSON.parse(stored);
      user.displayName = displayName;
      localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
      emitChange(LS_KEYS.USER);
    }
    return;
  }
  if (auth.currentUser) await updateProfile(auth.currentUser, { displayName });
};

export const updateUserEmail = async (email: string) => {
  if (isMockFallback || !auth) {
    const stored = localStorage.getItem(LS_KEYS.USER);
    if (stored) {
      const user = JSON.parse(stored);
      user.email = email;
      localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
      emitChange(LS_KEYS.USER);
    }
    return;
  }
  if (auth.currentUser) {
    await updateEmail(auth.currentUser, email);
    // Update Firestore user doc as well
    await updateDoc(doc(db!, 'users', auth.currentUser.uid), { email });
  }
};

// --- Hero Configuration ---

export const subscribeToHeroConfig = (callback: (config: any) => void) => {
  if (isMockFallback || !db) {
    const stored = localStorage.getItem('freshstl_hero_config');
    callback(stored ? JSON.parse(stored) : { mode: 'auto', autoType: 'newest' });
    return subscribeMock('freshstl_hero_config', () => {
      const s = localStorage.getItem('freshstl_hero_config');
      callback(s ? JSON.parse(s) : { mode: 'auto', autoType: 'newest' });
    });
  }

  return onSnapshot(doc(db, 'settings', 'hero'), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback({ mode: 'auto', autoType: 'newest' });
    }
  });
};

export const updateHeroConfig = async (config: any) => {
  if (isMockFallback || !db) {
    localStorage.setItem('freshstl_hero_config', JSON.stringify(config));
    emitChange('freshstl_hero_config');
    return;
  }
  await setDoc(doc(db, 'settings', 'hero'), config);
};

export const getHeroConfig = async () => {
  if (isMockFallback || !db) {
    const stored = localStorage.getItem('freshstl_hero_config');
    return stored ? JSON.parse(stored) : { mode: 'auto', autoType: 'newest' };
  }
  const snapshot = await getDoc(doc(db, 'settings', 'hero'));
  return snapshot.exists() ? snapshot.data() : { mode: 'auto', autoType: 'newest' };
};


export const resetPassword = async (email: string) => {
  if (!isMockFallback && auth) await sendPasswordResetEmail(auth, email);
};

export const updateUserAvatar = async (file: File) => {
  if (isMockFallback || !auth || !storage || !auth.currentUser) {
    // Mock implementation
    const stored = localStorage.getItem(LS_KEYS.USER);
    if (stored) {
      const user = JSON.parse(stored);
      // Create a fake local URL for the mock
      user.photoURL = URL.createObjectURL(file);
      localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
      emitChange(LS_KEYS.USER);
    }
    return;
  }

  const user = auth.currentUser;
  const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);

  await uploadBytes(storageRef, file);
  const photoURL = await getDownloadURL(storageRef);

  await updateProfile(user, { photoURL });

  // Update Firestore user doc as well if needed
  if (db) {
    await updateDoc(doc(db, 'users', user.uid), { photoURL });
  }

  return photoURL;
};

export const updateUserPassword = async (password: string) => {
  if (isMockFallback || !auth || !auth.currentUser) {
    // Mock implementation - do nothing
    return;
  }
  await updatePassword(auth.currentUser, password);
};

export const deleteUserAccount = async () => {
  if (isMockFallback || !auth || !auth.currentUser) {
    // Mock implementation
    localStorage.removeItem(LS_KEYS.USER);
    emitChange(LS_KEYS.USER);
    return;
  }

  const user = auth.currentUser;

  // Delete from Firestore first (optional, depending on policy)
  // await deleteDoc(doc(db, 'users', user.uid));

  await deleteAuthUser(user);
};

export const ensureGuestUser = async (email: string, displayName: string): Promise<User | null> => {
  if (!auth) return null;

  try {
    let user = auth.currentUser;

    if (!user) {
      // Create anonymous account
      const creds = await signInAnonymously(auth);
      user = creds.user;
    }

    // Update profile if needed
    if (user && (user.displayName !== displayName || !user.email)) {
      await updateProfile(user, { displayName });

      // Try to update email if it's not set (might fail if email taken, but okay for guest)
      // Note: updating email on anonymous account often requires verification or fresh login
      // so we might skip strict email update on Auth object and just rely on Firestore data.
    }

    // Ensure user document exists in Firestore
    if (user && db) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: email,
          displayName: displayName,
          createdAt: serverTimestamp(),
          role: 'guest',
          isAnonymous: true
        });
      }
    }

    return user;
  } catch (e) {
    console.error("Guest login failed:", e);
    throw e;
  }
};

export const convertGuestToRegistered = async (password: string): Promise<void> => {
  if (!auth || !auth.currentUser) throw new Error("No user logged in");

  const user = auth.currentUser;
  if (!user.isAnonymous) throw new Error("User is already registered");
  if (!user.email) throw new Error("User has no email linked");

  try {
    // Link the anonymous account with Email/Password credential
    const credential = EmailAuthProvider.credential(user.email, password);
    await linkWithCredential(user, credential);

    // Update Firestore document
    if (db) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isAnonymous: false,
        role: 'customer', // Upgrade role
        updatedAt: serverTimestamp()
      });
    }
  } catch (error: any) {
    console.error("Account conversion failed:", error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email is already associated with another account.");
    }
    throw error;
  }
};

// --- Products & Coupons ---

export const subscribeToProducts = (callback: (products: Product[]) => void, includeDrafts: boolean = true) => {
  const loadLocal = () => {
    try {
      const stored = localStorage.getItem(LS_KEYS.PRODUCTS);
      let products = stored ? JSON.parse(stored) : DEFAULT_MOCK_PRODUCTS;
      if (!stored) localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(DEFAULT_MOCK_PRODUCTS));

      if (!includeDrafts) {
        products = products.filter((p: Product) => p.status !== 'draft');
      }

      callback(products);
    } catch (e) { callback(DEFAULT_MOCK_PRODUCTS); }
  };

  if (isMockFallback || !db) {
    loadLocal();
    return subscribeMock(LS_KEYS.PRODUCTS, loadLocal);
  }

  const productsRef = collection(db, 'products');
  return onSnapshot(productsRef, (snapshot) => {
    let products = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Product, 'id'>;
      return { ...data, id: doc.id };
    });

    if (!includeDrafts) {
      products = products.filter(p => p.status !== 'draft');
    }

    callback(products);
  }, (err) => {
    console.warn("Firestore Access Denied. Serving Local Data.");
    loadLocal();
  });
};

export const getProduct = async (productId: string): Promise<Product | null> => {
  if (isMockFallback || !db) {
    const stored = localStorage.getItem(LS_KEYS.PRODUCTS);
    const products = stored ? JSON.parse(stored) : DEFAULT_MOCK_PRODUCTS;
    return products.find((p: Product) => p.id === productId) || null;
  }

  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

export const validateCoupon = async (code: string): Promise<Coupon | null> => {
  if (isMockFallback || !db) {
    // Mock fallback
    const upperCode = code.toUpperCase();
    const coupon = MOCK_COUPONS.find(c => c.code === upperCode && c.isActive);
    await new Promise(r => setTimeout(r, 500));
    return coupon || null;
  }

  try {
    const q = query(
      collection(db, 'coupons'),
      where('code', '==', code.toUpperCase()),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Coupon;
  } catch (e) {
    console.error("Failed to validate coupon:", e);
    return null;
  }
};

// --- Wishlist Management ---

export const subscribeToWishlist = (userId: string, callback: (productIds: string[]) => void) => {
  if (isMockFallback || !db) {
    const loadLocal = () => {
      const allWishlists = JSON.parse(localStorage.getItem(LS_KEYS.WISHLIST) || '{}');
      callback(allWishlists[userId] || []);
    };
    loadLocal();
    return subscribeMock(LS_KEYS.WISHLIST, loadLocal);
  }

  // In Firestore, we'd use a subcollection
  return onSnapshot(collection(db, 'users', userId, 'wishlist'), (snap) => {
    const ids = snap.docs.map(d => d.id);
    callback(ids);
  }, () => callback([]));
};

export const toggleWishlist = async (userId: string, productId: string, isAdding: boolean) => {
  if (isMockFallback || !db) {
    const allWishlists = JSON.parse(localStorage.getItem(LS_KEYS.WISHLIST) || '{}');
    const userList = allWishlists[userId] || [];

    if (isAdding && !userList.includes(productId)) {
      allWishlists[userId] = [...userList, productId];
    } else if (!isAdding) {
      allWishlists[userId] = userList.filter((id: string) => id !== productId);
    }

    localStorage.setItem(LS_KEYS.WISHLIST, JSON.stringify(allWishlists));
    emitChange(LS_KEYS.WISHLIST);
    return;
  }

  const ref = doc(db, 'users', userId, 'wishlist', productId);
  if (isAdding) {
    await setDoc(ref, { addedAt: serverTimestamp() });
  } else {
    await deleteDoc(ref);
  }
};

// --- Reviews System ---

export const subscribeToReviews = (productId: string, callback: (reviews: Review[]) => void) => {
  if (isMockFallback || !db) {
    const loadLocal = () => {
      const allReviews: Review[] = JSON.parse(localStorage.getItem(LS_KEYS.REVIEWS) || '[]');
      const productReviews = allReviews
        .filter(r => r.productId === productId)
        .map(r => ({ ...r, date: createFakeTimestamp(r.date) }));
      callback(productReviews);
    }
    loadLocal();
    return subscribeMock(LS_KEYS.REVIEWS, loadLocal);
  }

  const q = query(collection(db, 'reviews'), where('productId', '==', productId));
  return onSnapshot(q, (snap) => {
    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
    callback(reviews);
  }, () => callback([]));
};

export const addReview = async (review: Omit<Review, 'id' | 'date'>) => {
  if (isMockFallback || !db) {
    const allReviews = JSON.parse(localStorage.getItem(LS_KEYS.REVIEWS) || '[]');
    const newReview = {
      ...review,
      id: 'local_rev_' + Date.now(),
      date: new Date().toISOString()
    };
    allReviews.push(newReview);
    localStorage.setItem(LS_KEYS.REVIEWS, JSON.stringify(allReviews));
    emitChange(LS_KEYS.REVIEWS);

    // Update Product Rating Mock
    const products: Product[] = JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || '[]');
    const productIndex = products.findIndex(p => p.id === review.productId);
    if (productIndex > -1) {
      const p = products[productIndex];
      const currentCount = p.reviewCount || 0;
      const currentRating = p.rating || 0;
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + review.rating) / newCount;

      products[productIndex] = { ...p, rating: newRating, reviewCount: newCount };
      localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(products));
      emitChange(LS_KEYS.PRODUCTS);
    }
    return;
  }

  // Firestore implementation with Transaction to update Product stats
  try {
    await runTransaction(db, async (transaction) => {
      // 1. Create Review Ref
      const reviewRef = doc(collection(db!, 'reviews'));

      // 2. Get Product Ref
      const productRef = doc(db!, 'products', review.productId);
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error("Product does not exist!");
      }

      // 3. Calculate new stats
      const productData = productDoc.data() as Product;
      const currentCount = productData.reviewCount || 0;
      const currentRating = productData.rating || 0;
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + review.rating) / newCount;

      // 4. Write Review
      transaction.set(reviewRef, {
        ...review,
        date: serverTimestamp()
      });

      // 5. Update Product
      transaction.update(productRef, {
        rating: newRating,
        reviewCount: newCount
      });
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
    throw e;
  }
};

// --- CRUD Operations ---

export const addProduct = async (product: Omit<Product, 'id'>) => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || JSON.stringify(DEFAULT_MOCK_PRODUCTS));
    const newProduct = { ...product, id: 'local_' + Date.now(), sales: 0 };
    stored.push(newProduct);
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(stored));
    emitChange(LS_KEYS.PRODUCTS);
    return;
  }
  await addDoc(collection(db, 'products'), { ...product, sales: 0 });
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || '[]');
    const updated = stored.map((p: Product) => p.id === id ? { ...p, ...updates } : p);
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(updated));
    emitChange(LS_KEYS.PRODUCTS);
    return;
  }
  await updateDoc(doc(db, 'products', id), updates);
};

export const deleteProduct = async (id: string) => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || '[]');
    const filtered = stored.filter((p: Product) => p.id !== id);
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(filtered));
    emitChange(LS_KEYS.PRODUCTS);
    return;
  }

  try {
    // Get product to delete associated files
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const product = productSnap.data() as Product;

      // Helper to delete file safely
      const safeDelete = async (pathOrUrl?: string) => {
        if (!pathOrUrl || !storage) return;
        try {
          const fileRef = ref(storage, pathOrUrl);
          await deleteObject(fileRef);
        } catch (e: any) {
          // Ignore "object not found" errors
          if (e.code !== 'storage/object-not-found') {
            console.warn("Failed to delete file:", pathOrUrl, e);
          }
        }
      };

      // Delete files
      await safeDelete(product.previewStoragePath);
      await safeDelete(product.sourceStoragePath);

      // Try to delete image if it's in our storage
      if (product.imageUrl && product.imageUrl.includes('firebasestorage')) {
        await safeDelete(product.imageUrl);
      }
    }

    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || '[]');
    const product = stored.find((p: Product) => p.id === id);
    if (product) return product;

    // Check default mock products if not in local storage
    return DEFAULT_MOCK_PRODUCTS.find(p => p.id === id) || null;
  }

  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error fetching product:", e);
    return null;
  }
};

// --- Purchases & Orders ---

export const subscribeToPurchases = (userId: string, callback: (purchases: Purchase[]) => void) => {
  if (isMockFallback || !db || userId.startsWith('mock_')) {
    const loadLocalPurchases = () => {
      const allPurchases = JSON.parse(localStorage.getItem(LS_KEYS.PURCHASES) || '[]');
      const myPurchases = allPurchases.filter((p: any) => p._userId === userId).map((p: any) => ({
        ...p,
        purchaseDate: createFakeTimestamp(p.purchaseDate)
      }));
      myPurchases.sort((a: any, b: any) => b.purchaseDate.seconds - a.purchaseDate.seconds);
      callback(myPurchases);
    };

    loadLocalPurchases();
    return subscribeMock(LS_KEYS.PURCHASES, loadLocalPurchases);
  }

  return onSnapshot(collection(db, 'users', userId, 'purchases'), (snapshot) => {
    const purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
    purchases.sort((a, b) => {
      const tA = a.purchaseDate?.seconds || 9999999999;
      const tB = b.purchaseDate?.seconds || 9999999999;
      return tB - tA;
    });
    callback(purchases);
  }, () => callback([]));
};

export const subscribeToOrders = (userId: string, callback: (orders: Order[]) => void) => {
  if (isMockFallback || !db || userId.startsWith('mock_')) {
    const loadLocalOrders = () => {
      const allOrders = JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || '[]');
      const myOrders = allOrders.filter((o: any) => o.userId === userId).map((o: any) => ({
        ...o,
        date: createFakeTimestamp(o.date)
      }));
      myOrders.sort((a: any, b: any) => b.date.seconds - a.date.seconds);
      callback(myOrders);
    };
    loadLocalOrders();
    return subscribeMock(LS_KEYS.ORDERS, loadLocalOrders);
  }

  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    callback(orders);
  }, (error) => {
    console.error("Error subscribing to orders:", error);
    callback([]);
  });
};

export const processSuccessfulCheckout = async (userId: string, orderData: Omit<Order, 'id' | 'date' | 'status'>, purchases: Omit<Purchase, 'id'>[]) => {
  if (isMockFallback || !db || userId.startsWith('mock_')) {
    // 1. Save Purchases
    const allPurchases = JSON.parse(localStorage.getItem(LS_KEYS.PURCHASES) || '[]');
    const newPurchases = purchases.map(p => ({
      ...p,
      id: 'local_p_' + Math.random(),
      purchaseDate: new Date().toISOString(),
      _userId: userId
    }));
    localStorage.setItem(LS_KEYS.PURCHASES, JSON.stringify([...allPurchases, ...newPurchases]));
    emitChange(LS_KEYS.PURCHASES);

    // 2. Save Order (Admin)
    const allOrders = JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || '[]');
    const newOrder = {
      ...orderData,
      id: 'local_order_' + Date.now(),
      date: new Date().toISOString(),
      status: 'completed'
    };
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify([...allOrders, newOrder]));
    emitChange(LS_KEYS.ORDERS);

    // 3. Update Sales Counts (Products)
    const storedProducts = JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || JSON.stringify(DEFAULT_MOCK_PRODUCTS));
    const updatedProducts = storedProducts.map((p: Product) => {
      const bought = orderData.items.find(i => i.id === p.id);
      return bought ? { ...p, sales: (p.sales || 0) + 1 } : p;
    });
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    emitChange(LS_KEYS.PRODUCTS);
    return;
  }

  // Real Firestore Transaction
  try {
    const batch = writeBatch(db);

    purchases.forEach(p => {
      const ref = doc(collection(db!, 'users', userId, 'purchases'));
      batch.set(ref, { ...p, purchaseDate: serverTimestamp() });
    });

    const orderRef = doc(collection(db!, 'orders'));
    batch.set(orderRef, {
      ...orderData,
      shippingAddress: orderData.customerInfo ? {
        address: orderData.customerInfo.address,
        city: orderData.customerInfo.city,
        zipCode: orderData.customerInfo.zipCode,
        country: orderData.customerInfo.country
      } : null,
      date: serverTimestamp(),
      status: 'completed'
    });

    orderData.items.forEach(item => {
      batch.update(doc(db!, 'products', item.id), { sales: increment(1) });
    });

    await batch.commit();
  } catch (e) {
    console.error("Transaction failed", e);
  }
};

export const subscribeToGlobalOrders = (callback: (orders: Order[]) => void) => {
  if (isMockFallback || !db) {
    const loadLocalOrders = () => {
      const stored = JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || '[]');
      const orders = stored.map((o: any) => ({ ...o, date: createFakeTimestamp(o.date) }));
      orders.sort((a: any, b: any) => b.date.seconds - a.date.seconds);
      callback(orders);
    };
    loadLocalOrders();
    return subscribeMock(LS_KEYS.ORDERS, loadLocalOrders);
  }

  return onSnapshot(collection(db, 'orders'), (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    orders.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
    callback(orders);
  }, (error) => {
    console.error("Failed to subscribe to global orders:", error);
    callback([]);
  });
};

// --- Payments Collection ---

export const savePayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>, orderId?: string): Promise<string> => {
  const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  if (isMockFallback || !db) {
    const allPayments = JSON.parse(localStorage.getItem(LS_KEYS.PAYMENTS) || '[]');
    const newPayment = {
      ...paymentData,
      orderId: orderId || paymentData.orderId, // Use provided orderId or from paymentData
      id: paymentId,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LS_KEYS.PAYMENTS, JSON.stringify([...allPayments, newPayment]));
    emitChange(LS_KEYS.PAYMENTS);
    return paymentId;
  }

  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await setDoc(paymentRef, {
      ...paymentData,
      orderId: orderId || paymentData.orderId, // Use provided orderId or from paymentData
      id: paymentId,
      createdAt: serverTimestamp()
    });
    return paymentId;
  } catch (e) {
    console.error("Failed to save payment:", e);
    throw e;
  }
};

export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
  if (isMockFallback || !db) {
    const allPayments: Payment[] = JSON.parse(localStorage.getItem(LS_KEYS.PAYMENTS) || '[]');
    return allPayments.find(p => p.id === paymentId) || null;
  }

  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const snap = await getDoc(paymentRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Payment;
    }
    return null;
  } catch (e) {
    console.error("Failed to get payment:", e);
    return null;
  }
};

export const subscribeToPayments = (callback: (payments: Payment[]) => void) => {
  if (isMockFallback || !db) {
    const loadLocal = () => {
      const stored = JSON.parse(localStorage.getItem(LS_KEYS.PAYMENTS) || '[]');
      const payments = stored.map((p: any) => ({ ...p, createdAt: createFakeTimestamp(p.createdAt) }));
      payments.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(payments);
    };
    loadLocal();
    return subscribeMock(LS_KEYS.PAYMENTS, loadLocal);
  }

  return onSnapshot(collection(db, 'payments'), (snap) => {
    const payments = snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
    payments.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(payments);
  }, (error) => {
    console.error("Failed to subscribe to payments:", error);
    callback([]);
  });
};

export const updatePaymentStatus = async (paymentId: string, status: Payment['status']): Promise<void> => {
  if (isMockFallback || !db) {
    const allPayments = JSON.parse(localStorage.getItem(LS_KEYS.PAYMENTS) || '[]');
    const updatedPayments = allPayments.map((p: Payment) =>
      p.id === paymentId ? { ...p, status, updatedAt: new Date().toISOString() } : p
    );
    localStorage.setItem(LS_KEYS.PAYMENTS, JSON.stringify(updatedPayments));
    emitChange(LS_KEYS.PAYMENTS);
    return;
  }

  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, { status, updatedAt: serverTimestamp() });
  } catch (e) {
    console.error("Failed to update payment:", e);
  }
};

// --- Enhanced Order with Payment ---
export const createOrderWithPayment = async (
  userId: string,
  orderData: {
    transactionId: string;
    amount: number;
    discountApplied?: number;
    items: { id: string; name: string; price: number }[];
    customerInfo?: Order['customerInfo'];
  },
  paymentData: {
    paymentMethod: string;
    stripePaymentIntentId?: string;
    cardBrand?: string;
    cardLast4?: string;
  }
): Promise<{ orderId: string; paymentId: string }> => {
  const generateOrderId = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return `ORD-${result.substring(0, 4)}-${result.substring(4)}`;
  };

  const orderId = generateOrderId();
  const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  if (isMockFallback || !db) {
    // Save Order
    const allOrders = JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || '[]');
    const newOrder = {
      ...orderData,
      id: orderId,
      userId,
      date: new Date().toISOString(),
      status: 'completed',
      paymentId
    };
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify([...allOrders, newOrder]));
    emitChange(LS_KEYS.ORDERS);

    // Save Payment
    const allPayments = JSON.parse(localStorage.getItem(LS_KEYS.PAYMENTS) || '[]');
    const newPayment = {
      id: paymentId,
      orderId,
      userId,
      amount: orderData.amount,
      currency: 'usd',
      status: 'succeeded',
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LS_KEYS.PAYMENTS, JSON.stringify([...allPayments, newPayment]));
    emitChange(LS_KEYS.PAYMENTS);

    return { orderId, paymentId };
  }

  try {
    const batch = writeBatch(db);

    // Create Order
    const orderRef = doc(db, 'orders', orderId);
    batch.set(orderRef, {
      ...orderData,
      id: orderId,
      userId,
      date: serverTimestamp(),
      status: 'completed',
      paymentId
    });

    // Create Payment
    const paymentRef = doc(db, 'payments', paymentId);
    batch.set(paymentRef, {
      id: paymentId,
      orderId,
      userId,
      amount: orderData.amount,
      currency: 'usd',
      status: 'succeeded',
      ...paymentData,
      createdAt: serverTimestamp()
    });

    await batch.commit();
    return { orderId, paymentId };
  } catch (e) {
    console.error("Failed to create order with payment:", e);
    throw e;
  }
};

export const getFirestoreTimestamp = () => isMockFallback ? createFakeTimestamp() : Timestamp.now();

// --- Blog System ---

export const getPosts = async (publishedOnly = true): Promise<BlogPost[]> => {
  console.log(`[getPosts] Called. publishedOnly=${publishedOnly}, isMockFallback=${isMockFallback}, dbExists=${!!db}`);

  if (isMockFallback || !db) {
    console.log("[getPosts] Using mock fallback (localStorage)");
    if (typeof localStorage === 'undefined') {
      console.warn("[getPosts] localStorage is undefined (server-side mock?), returning empty array.");
      return [];
    }
    const stored = JSON.parse(localStorage.getItem('freshstl_demo-app_posts') || '[]');
    let posts = stored.map((p: any) => ({
      ...p,
      createdAt: createFakeTimestamp(p.createdAt),
      updatedAt: createFakeTimestamp(p.updatedAt)
    }));
    if (publishedOnly) {
      posts = posts.filter((p: BlogPost) => p.published);
    }
    return posts.sort((a: BlogPost, b: BlogPost) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }
  try {
    console.log("[getPosts] Querying Firestore...");
    // Fetch all posts ordered by createdAt (requires only single-field index, which is default)
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    console.log(`[getPosts] Firestore returned ${snapshot.size} docs.`);

    let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

    if (publishedOnly) {
      posts = posts.filter(p => p.published);
    }

    return posts;
  } catch (error) {
    console.error("Error getting posts:", error);
    // Fallback: Try fetching without orderBy if that failed (unlikely for single field, but safe)
    try {
      console.warn("[getPosts] Retrying without sort...");
      const q = query(collection(db, 'posts'));
      const snapshot = await getDocs(q);
      let posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

      // Sort in memory
      posts.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      if (publishedOnly) {
        posts = posts.filter(p => p.published);
      }
      return posts;
    } catch (retryError) {
      console.error("Error getting posts (retry):", retryError);
      return [];
    }
  }
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem('freshstl_demo-app_posts') || '[]');
    const post = stored.find((p: BlogPost) => p.slug === slug);
    if (!post) return null;
    return {
      ...post,
      createdAt: createFakeTimestamp(post.createdAt),
      updatedAt: createFakeTimestamp(post.updatedAt)
    };
  }
  try {
    const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BlogPost;
  } catch (error) {
    console.error("Error getting post by slug:", error);
    return null;
  }
};

export const createPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (isMockFallback || !db) {
    // Mock fallback
    const stored = JSON.parse(localStorage.getItem('freshstl_demo-app_posts') || '[]');
    const newPost = {
      ...postData,
      id: 'mock_post_' + Date.now(),
      createdAt: createFakeTimestamp(),
      updatedAt: createFakeTimestamp()
    };
    stored.push(newPost);
    localStorage.setItem('freshstl_demo-app_posts', JSON.stringify(stored));
    return newPost.id;
  }
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const updatePost = async (id: string, postData: Partial<BlogPost>): Promise<void> => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem('freshstl_demo-app_posts') || '[]');
    const updated = stored.map((p: BlogPost) => p.id === id ? { ...p, ...postData, updatedAt: createFakeTimestamp() } : p);
    localStorage.setItem('freshstl_demo-app_posts', JSON.stringify(updated));
    return;
  }
  try {
    const docRef = doc(db, 'posts', id);
    await updateDoc(docRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const getRelatedPosts = async (currentSlug: string, limitCount: number = 3): Promise<BlogPost[]> => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem('freshstl_demo-app_posts') || '[]');
    return stored
      .filter((p: BlogPost) => p.slug !== currentSlug && p.published)
      .slice(0, limitCount)
      .map((p: any) => ({
        ...p,
        createdAt: createFakeTimestamp(p.createdAt),
        updatedAt: createFakeTimestamp(p.updatedAt)
      }));
  }
  try {
    // Ideally we'd filter by tags or category, but for now just get recent posts excluding current
    // Firestore doesn't support "not equal" and "order by" different fields easily without composite indexes
    // So we fetch a few more and filter client-side or just fetch recent
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount + 1)
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
      .filter(p => p.slug !== currentSlug)
      .slice(0, limitCount);
    return posts;
  } catch (error) {
    console.error("Error getting related posts:", error);
    return [];
  }
};

export const deletePost = async (id: string): Promise<void> => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem('freshstl_demo-app_posts') || '[]');
    const filtered = stored.filter((p: BlogPost) => p.id !== id);
    localStorage.setItem('freshstl_demo-app_posts', JSON.stringify(filtered));
    return;
  }
  try {
    await deleteDoc(doc(db, 'posts', id));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

// --- Seed Database (Admin Only) ---
export const seedDatabase = async (): Promise<{ success: boolean; message: string }> => {
  if (isMockFallback || !db) {
    // Seed mock local storage with all data
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(DEFAULT_MOCK_PRODUCTS));
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(MOCK_ORDERS));
    localStorage.setItem(LS_KEYS.PAYMENTS, JSON.stringify(MOCK_PAYMENTS));
    emitChange(LS_KEYS.PRODUCTS);
    emitChange(LS_KEYS.ORDERS);
    emitChange(LS_KEYS.PAYMENTS);
    return {
      success: true,
      message: `Seeded ${DEFAULT_MOCK_PRODUCTS.length} products, ${MOCK_ORDERS.length} orders, ${MOCK_PAYMENTS.length} payments to Local Storage.`
    };
  }

  try {
    const batch = writeBatch(db);
    const productsRef = collection(db, 'products');

    // Check if products already exist
    const existingProducts = await getDocs(productsRef);
    if (existingProducts.docs.length > 0) {
      return { success: false, message: `Database already has ${existingProducts.docs.length} products. Clear existing data first.` };
    }

    // Add all default products (10+)
    DEFAULT_MOCK_PRODUCTS.forEach(product => {
      const docRef = doc(productsRef, product.id);
      batch.set(docRef, {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    // Add coupons
    const couponsRef = collection(db, 'coupons');
    MOCK_COUPONS.forEach(coupon => {
      const docRef = doc(couponsRef, coupon.code);
      batch.set(docRef, {
        ...coupon,
        createdAt: serverTimestamp()
      });
    });

    // Add test orders (5)
    const ordersRef = collection(db, 'orders');
    MOCK_ORDERS.forEach(order => {
      const docRef = doc(ordersRef, order.id);
      batch.set(docRef, {
        ...order,
        date: Timestamp.fromDate(new Date(order.date))
      });
    });

    // Add test payments (3)
    const paymentsRef = collection(db, 'payments');
    MOCK_PAYMENTS.forEach(payment => {
      const docRef = doc(paymentsRef, payment.id);
      batch.set(docRef, {
        ...payment,
        createdAt: Timestamp.fromDate(new Date(payment.createdAt))
      });
    });

    // Add test users (3)
    MOCK_USERS.forEach(user => {
      const userRef = doc(db!, 'users', user.id);
      batch.set(userRef, {
        ...user,
        createdAt: Timestamp.fromDate(new Date(user.createdAt))
      });
    });

    await batch.commit();
    return {
      success: true,
      message: `Seeded ${DEFAULT_MOCK_PRODUCTS.length} products, ${MOCK_ORDERS.length} orders, ${MOCK_PAYMENTS.length} payments, ${MOCK_USERS.length} users to Firestore.`
    };
  } catch (e: any) {
    console.error("Seed database failed:", e);
    return { success: false, message: `Failed to seed: ${e.message}` };
  }
};

// --- Clear Database (Admin Only) ---
export const clearDatabase = async (): Promise<{ success: boolean; message: string }> => {
  if (isMockFallback || !db) {
    localStorage.removeItem(LS_KEYS.PRODUCTS);
    localStorage.removeItem(LS_KEYS.ORDERS);
    localStorage.removeItem(LS_KEYS.PAYMENTS);
    localStorage.removeItem(LS_KEYS.PURCHASES);
    localStorage.removeItem(LS_KEYS.REVIEWS);
    emitChange(LS_KEYS.PRODUCTS);
    emitChange(LS_KEYS.ORDERS);
    emitChange(LS_KEYS.PAYMENTS);
    return { success: true, message: 'Cleared all local storage data (products, orders, payments).' };
  }

  try {
    const batch = writeBatch(db);
    let deletedCount = 0;

    // 1. Clear Firestore
    const collections = ['products', 'orders', 'payments', 'users', 'reviews', 'coupons'];

    for (const colName of collections) {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      snapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
        deletedCount++;
      });
    }

    if (deletedCount > 0) {
      await batch.commit();
    }

    // 2. Clear Storage (Products folder)
    let storageDeletedCount = 0;
    try {
      const storageRef = getStorage();
      const productsFolderRef = ref(storageRef, 'products');

      // Helper to recursively delete
      const deleteFolder = async (folderRef: any) => {
        const listResult = await listAll(folderRef);

        // Delete files
        const deleteFilePromises = listResult.items.map(itemRef => {
          storageDeletedCount++;
          return deleteObject(itemRef);
        });
        await Promise.all(deleteFilePromises);

        // Recurse into folders
        const deleteFolderPromises = listResult.prefixes.map(subFolderRef => deleteFolder(subFolderRef));
        await Promise.all(deleteFolderPromises);
      };

      await deleteFolder(productsFolderRef);
    } catch (storageErr) {
      console.warn("Storage cleanup failed (likely permissions or empty):", storageErr);
      // Continue, as Firestore might have succeeded
    }

    return {
      success: true,
      message: `Deleted ${deletedCount} records from Firestore and ${storageDeletedCount} files from Storage. Note: Auth users cannot be deleted from the browser for security reasons (run 'npm run clean-seed' for full cleanup).`
    };
  } catch (e: any) {
    console.error("Clear database failed:", e);
    return { success: false, message: `Failed to clear: ${e.message}` };
  }
};

// Get database product count
export const getProductCount = async (): Promise<number> => {
  if (isMockFallback || !db) {
    const stored = localStorage.getItem(LS_KEYS.PRODUCTS);
    return stored ? JSON.parse(stored).length : 0;
  }

  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.length;
  } catch {
    return 0;
  }
};

// --- Storage Operations ---

// --- Storage Operations ---

export const uploadFile = async (file: File, path: string): Promise<string> => {
  if (isMockFallback || !storage) {
    // Mock upload - return a fake URL
    console.log(`[Mock Upload] Uploading ${file.name} to ${path}`);
    await new Promise(r => setTimeout(r, 1000)); // Simulate delay
    return URL.createObjectURL(file);
  }

  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);

    // For protected files, we return the path, not the URL
    if (path.startsWith('protected/')) {
      return path;
    }

    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (e) {
    console.error("Upload failed:", e);
    throw e;
  }
};

export const getSecureDownloadUrl = async (productId: string): Promise<string> => {
  if (isMockFallback || !app) {
    console.warn("Mock secure download");
    return "#";
  }

  const functions = getFunctions(app);
  const getUrl = httpsCallable(functions, 'getSecureStlUrl');

  try {
    const result = await getUrl({ productId });
    return (result.data as any).url;
  } catch (error: any) {
    console.error("Secure download failed:", error);
    throw error;
  }
};

// --- Categories ---

export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  if (isMockFallback || !db) {
    const loadLocal = () => {
      const stored = localStorage.getItem(LS_KEYS.CATEGORIES);
      const categories = stored ? JSON.parse(stored) : [];
      callback(categories);
    };
    loadLocal();
    return subscribeMock(LS_KEYS.CATEGORIES, loadLocal);
  }

  const q = query(collection(db, 'categories'), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    callback(categories);
  }, (error) => {
    console.error("Error subscribing to categories:", error);
    callback([]);
  });
};

export const addCategory = async (name: string) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem(LS_KEYS.CATEGORIES) || '[]');
    const newCategory = {
      id: 'local_cat_' + Date.now(),
      name,
      slug,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LS_KEYS.CATEGORIES, JSON.stringify([...stored, newCategory]));
    emitChange(LS_KEYS.CATEGORIES);
    return;
  }

  await addDoc(collection(db, 'categories'), {
    name,
    slug,
    createdAt: serverTimestamp()
  });
};

export const deleteCategory = async (id: string) => {
  if (isMockFallback || !db) {
    const stored = JSON.parse(localStorage.getItem(LS_KEYS.CATEGORIES) || '[]');
    const filtered = stored.filter((c: Category) => c.id !== id);
    localStorage.setItem(LS_KEYS.CATEGORIES, JSON.stringify(filtered));
    emitChange(LS_KEYS.CATEGORIES);
    return;
  }
  await deleteDoc(doc(db, 'categories', id));
};

// --- User Management (Admin) ---

export const subscribeToAllUsers = (callback: (users: any[]) => void) => {
  if (isMockFallback || !db) {
    const loadLocal = () => {
      // In mock mode, we might not have a separate users list, 
      // but we can try to return the mock users array or what's in local storage
      const stored = localStorage.getItem(LS_KEYS.USER);
      // This is just the current user, not all. 
      // For admin mock, let's return the static MOCK_USERS
      callback(MOCK_USERS);
    };
    loadLocal();
    return () => { };
  }

  const usersRef = collection(db, 'users');
  // Use client-side sorting to avoid index issues
  const q = query(usersRef);

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by createdAt desc
    users.sort((a: any, b: any) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
    callback(users);
  }, (err) => {
    console.warn("Failed to subscribe to users:", err);
    callback([]);
  });
};

export const deleteUser = async (userId: string) => {
  if (isMockFallback || !db) {
    // Mock delete
    return;
  }

  try {
    const token = await auth?.currentUser?.getIdToken();
    if (token) {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user via API');
      }
      return;
    }
  } catch (e) {
    console.error("Failed to delete user via API, falling back to Firestore only:", e);
  }

  await deleteDoc(doc(db, 'users', userId));
};

export const toggleUserBlockStatus = async (userId: string, isBlocked: boolean) => {
  if (isMockFallback || !db) return;
  await updateDoc(doc(db, 'users', userId), { isBlocked });
};

export const adminCreateUser = async (userData: any) => {
  if (isMockFallback || !db) return;

  try {
    const token = await auth?.currentUser?.getIdToken();
    if (token) {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password || 'password123', // Default password if not provided
          displayName: userData.displayName,
          role: userData.role || 'customer'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user via API');
      }
      return;
    }
  } catch (e) {
    console.error("Failed to create user via API:", e);
    throw e; // Re-throw to let UI handle it
  }
};

// --- Cart Management ---

export const updateUserCart = async (userId: string, cartItems: CartItem[]) => {
  if (isMockFallback || !db) return;
  try {
    const cartRef = doc(db, 'users', userId, 'cart', 'current');
    await setDoc(cartRef, { items: cartItems, updatedAt: serverTimestamp() });
  } catch (e) {
    console.error("Failed to update cart:", e);
  }
};

export const subscribeToUserCart = (userId: string, callback: (items: CartItem[]) => void) => {
  if (isMockFallback || !db) {
    callback([]);
    return () => { };
  }
  const cartRef = doc(db, 'users', userId, 'cart', 'current');
  return onSnapshot(cartRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().items || []);
    } else {
      callback([]);
    }
  }, () => callback([]));
};

// --- User Orders ---
export const subscribeToUserOrders = (userId: string, callback: (orders: Order[]) => void) => {
  if (isMockFallback || !db) {
    const loadLocal = () => {
      const stored = JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || '[]');
      const userOrders = stored.filter((o: Order) => o.userId === userId);
      // Sort by date desc
      userOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(userOrders);
    };
    loadLocal();
    return subscribeMock(LS_KEYS.ORDERS, loadLocal);
  }

  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    callback(orders);
  }, (err) => {
    console.warn("Failed to subscribe to user orders:", err);
    callback([]);
  });
};

// --- Payment Methods Persistence ---
export const getUserPaymentMethods = async (userId: string): Promise<any[]> => {
  if (isMockFallback || !db) return [];
  try {
    const methodsRef = collection(db, 'users', userId, 'paymentMethods');
    const snap = await getDocs(methodsRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Failed to get payment methods:", e);
    return [];
  }
};

export const addUserPaymentMethod = async (userId: string, method: any): Promise<any> => {
  if (isMockFallback || !db) return method;
  try {
    const methodsRef = collection(db, 'users', userId, 'paymentMethods');
    let docRef;
    if (method.id) {
      // Use the provided ID (Stripe ID) as the document ID
      docRef = doc(methodsRef, method.id);
      await setDoc(docRef, method);
    } else {
      docRef = await addDoc(methodsRef, method);
    }
    return { id: docRef.id, ...method };
  } catch (e) {
    console.error("Failed to add payment method:", e);
    throw e;
  }
};

export const removeUserPaymentMethod = async (userId: string, methodId: string): Promise<void> => {
  if (isMockFallback || !db) return;
  try {
    const docRef = doc(db, 'users', userId, 'paymentMethods', methodId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Failed to remove payment method:", e);
    throw e;
  }
};

// --- Advanced Features ---

// Update Order Status
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  if (isMockFallback || !db) {
    const allOrders = JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || '[]');
    const updatedOrders = allOrders.map((o: Order) =>
      o.id === orderId ? { ...o, status } : o
    );
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(updatedOrders));
    emitChange(LS_KEYS.ORDERS);
    return;
  }

  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  } catch (e) {
    console.error("Failed to update order status:", e);
    throw e;
  }
};

// Refund Order
export const refundOrder = async (orderId: string, paymentId?: string): Promise<void> => {
  if (isMockFallback || !db) {
    // Update Order
    const allOrders = JSON.parse(localStorage.getItem(LS_KEYS.ORDERS) || '[]');
    const updatedOrders = allOrders.map((o: Order) =>
      o.id === orderId ? { ...o, status: 'refunded' } : o
    );
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(updatedOrders));
    emitChange(LS_KEYS.ORDERS);

    // Update Payment
    if (paymentId) {
      const allPayments = JSON.parse(localStorage.getItem(LS_KEYS.PAYMENTS) || '[]');
      const updatedPayments = allPayments.map((p: Payment) =>
        p.id === paymentId ? { ...p, status: 'refunded', updatedAt: new Date().toISOString() } : p
      );
      localStorage.setItem(LS_KEYS.PAYMENTS, JSON.stringify(updatedPayments));
      emitChange(LS_KEYS.PAYMENTS);
    }
    return;
  }

  try {
    const batch = writeBatch(db);

    // Update Order
    const orderRef = doc(db, 'orders', orderId);
    batch.update(orderRef, { status: 'refunded' });

    // Update Payment if exists
    if (paymentId) {
      const paymentRef = doc(db, 'payments', paymentId);
      batch.update(paymentRef, { status: 'refunded', updatedAt: serverTimestamp() });
    }

    await batch.commit();
  } catch (e) {
    console.error("Failed to refund order:", e);
    throw e;
  }
};

// Get User Profile
export const getUserProfile = async (userId: string): Promise<CustomerInfo | null> => {
  if (isMockFallback || !db) {
    const stored = localStorage.getItem(LS_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  }
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as CustomerInfo;
    }
    return null;
  } catch (e) {
    console.error("Failed to get user profile:", e);
    return null;
  }
};

// Update User Profile
export const updateUser = async (userId: string, data: Partial<CustomerInfo>): Promise<void> => {
  if (isMockFallback || !db) {
    // In mock mode, we might store this in a separate 'users' key or just update current user
    // For simplicity, let's update the current user in local storage if it matches
    const currentUser = JSON.parse(localStorage.getItem(LS_KEYS.USER) || 'null');
    if (currentUser && currentUser.uid === userId) {
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem(LS_KEYS.USER, JSON.stringify(updatedUser));
      emitChange(LS_KEYS.USER);
    }
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, data, { merge: true });
  } catch (e) {
    console.error("Failed to update user:", e);
    throw e;
  }
};

export const updateUserRole = async (userId: string, role: 'admin' | 'customer' | 'tester') => {
  if (isMockFallback || !db) {
    // Mock update
    const currentUser = JSON.parse(localStorage.getItem(LS_KEYS.USER) || 'null');
    if (currentUser && currentUser.uid === userId) {
      const updatedUser = { ...currentUser, role };
      localStorage.setItem(LS_KEYS.USER, JSON.stringify(updatedUser));
      emitChange(LS_KEYS.USER);
    }
    return;
  }

  try {
    const token = await auth?.currentUser?.getIdToken();
    if (token) {
      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, role })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user role via API');
      }
      return;
    }
  } catch (e) {
    console.error("Failed to update user role via API, falling back to Firestore only:", e);
  }

  // Fallback to Firestore only if API fails
  await updateDoc(doc(db, 'users', userId), { role });
};

// Send Order Confirmation Email (via Trigger Email Extension)
export const sendOrderConfirmationEmail = async (
  userId: string,
  email: string,
  orderData: any
): Promise<void> => {
  if (isMockFallback || !db) {
    console.log(`[Mock Email] Sending order confirmation to ${email}`);
    return;
  }

  try {
    const mailRef = collection(db, 'mail');
    await addDoc(mailRef, {
      to: email,
      message: {
        subject: `Order Confirmation #${orderData.transactionId}`,
        html: `
          <h1>Thank you for your purchase!</h1>
          <p>Order ID: ${orderData.transactionId}</p>
          <p>Total: $${(orderData.amount / 100).toFixed(2)}</p>
          <h3>Items:</h3>
          <ul>
            ${orderData.items.map((item: any) => `<li>${item.name} - $${(item.price / 100).toFixed(2)}</li>`).join('')}
          </ul>
          <p>You can download your files from your <a href="https://freshstl.com/dashboard">Dashboard</a>.</p>
        `
      }
    });
  } catch (e) {
    console.error("Failed to queue email:", e);
    // Don't throw, email failure shouldn't block checkout
  }
};

// --- Builder Asset Management ---

export const subscribeToBuilderCategories = (callback: (categories: BuilderCategory[]) => void, productId?: string) => {
  if (isMockFallback || !db) {
    // Mock data
    const mockCategories: BuilderCategory[] = [
      { id: 'cat_hats', name: 'Hats', slug: 'hats' },
      { id: 'cat_clothes', name: 'Clothes', slug: 'clothes' },
      { id: 'cat_shoes', name: 'Shoes', slug: 'shoes' },
      { id: 'cat_poses', name: 'Poses', slug: 'poses' }
    ];
    callback(mockCategories);
    return () => { };
  }

  let q;
  if (productId) {
    q = query(collection(db, 'builder_categories'), where('productId', '==', productId));
  } else {
    // Global categories (where productId is missing or null)
    // Note: Firestore queries for missing fields are tricky, usually we just filter client side or use a specific value like 'global'
    // For now, let's assume global categories have no productId field or we query all and filter client side if needed.
    // But to keep it clean, let's query all and filter in callback if no productId is passed, OR assume 'global' means productId is undefined.
    // A better approach for "Global" is to explicitly look for where productId is null/undefined, but Firestore doesn't support 'undefined'.
    // We will query all and filter for now to be safe, or if productId is provided we filter by it.
    q = query(collection(db, 'builder_categories'), orderBy('name'));
  }

  return onSnapshot(q, (snapshot) => {
    let categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuilderCategory));
    if (productId) {
      // Already filtered by query
    } else {
      // If no productId requested, maybe we only want global ones?
      // For backward compatibility, let's return all if no productId specified, 
      // OR filter for those without productId. Let's return all for now to see everything in main list.
      // Actually, to support "Global" vs "Product Specific", we should filter.
      categories = categories.filter(c => !c.productId);
    }
    callback(categories);
  });
};

export const addBuilderCategory = async (name: string, productId?: string) => {
  if (isMockFallback || !db) {
    console.log("Mock add builder category:", name, productId);
    return;
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const data: any = { name, slug };
  if (productId) data.productId = productId;
  await addDoc(collection(db, 'builder_categories'), data);
};

export const deleteBuilderCategory = async (id: string) => {
  if (isMockFallback || !db) return;
  await deleteDoc(doc(db, 'builder_categories', id));
};

export const subscribeToBuilderAssets = (callback: (assets: BuilderAsset[]) => void, productId?: string) => {
  if (isMockFallback || !db) {
    // Mock data based on hardcoded assets
    const mockAssets: BuilderAsset[] = [
      { id: 'pose_idle', name: 'Idle', categoryId: 'cat_poses', categorySlug: 'poses', modelUrl: '' },
      { id: 'hat_cap', name: 'Cap', categoryId: 'cat_hats', categorySlug: 'hats', modelUrl: '' },
    ];
    callback(mockAssets);
    return () => { };
  }

  let q;
  if (productId) {
    q = query(collection(db, 'builder_assets'), where('productId', '==', productId));
  } else {
    q = query(collection(db, 'builder_assets'));
  }

  return onSnapshot(q, (snapshot) => {
    let assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuilderAsset));
    if (!productId) {
      // Filter for global assets only
      assets = assets.filter(a => !a.productId);
    }
    callback(assets);
  });
};

export const addBuilderAsset = async (asset: Omit<BuilderAsset, 'id'>) => {
  if (isMockFallback || !db) {
    console.log("Mock add builder asset:", asset);
    return;
  }
  await addDoc(collection(db, 'builder_assets'), asset);
};

export const deleteBuilderAsset = async (id: string) => {
  if (isMockFallback || !db) return;
  await deleteDoc(doc(db, 'builder_assets', id));
};

export const updateBuilderAsset = async (id: string, data: Partial<BuilderAsset>) => {
  if (isMockFallback || !db) return;
  await updateDoc(doc(db, 'builder_assets', id), data);
};

// --- Global Stripe Configuration ---
export const subscribeToStripeConfig = (callback: (config: any) => void) => {
  if (db) {
    return onSnapshot(doc(db, 'settings', 'stripe'), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback({ mode: 'test' });
      }
    });
  }
  const saved = localStorage.getItem('freshstl_stripe_config');
  if (saved) callback(JSON.parse(saved));
  else callback({ mode: 'test' });
  return () => { };
};

export const updateStripeConfig = async (config: any) => {
  if (db) {
    await setDoc(doc(db, 'settings', 'stripe'), config, { merge: true });
  }
  localStorage.setItem('freshstl_stripe_config', JSON.stringify(config));
};

export const makeMeAdmin = async () => {
  if (!auth?.currentUser || !db) {
    console.error("Cannot make admin: No user or DB");
    return;
  }
  try {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, { role: 'admin' }, { merge: true });
    console.log("Successfully updated user role to admin");
    alert("You are now an Admin! The page will reload.");
    window.location.reload();
  } catch (error) {
    console.error("Failed to make admin:", error);
    alert("Failed to make admin. See console.");
  }
};

import { terminate, clearIndexedDbPersistence } from 'firebase/firestore';

export const clearPersistence = async () => {
  if (!db) return;
  try {
    await terminate(db);
    await clearIndexedDbPersistence(db);
    console.log("Persistence cleared");
    alert("Cache cleared. Reloading...");
    window.location.reload();
  } catch (e) {
    console.error("Failed to clear persistence:", e);
    alert("Failed to clear cache. See console.");
  }
};

export const deleteDataForTestUsers = async (testerEmails: string[]) => {
  if (isMockFallback || !db) {
    console.log("Mock delete data for:", testerEmails);
    return;
  }

  if (testerEmails.length === 0) return;

  try {
    // 1. Get UIDs for these emails
    // 'in' query supports max 10 values. If more, we need to batch or loop.
    // Assuming < 10 testers for now.
    const usersRef = collection(db, 'users');
    const qUsers = query(usersRef, where('email', 'in', testerEmails.slice(0, 10)));
    const userSnaps = await getDocs(qUsers);
    const uids = userSnaps.docs.map(doc => doc.id);

    if (uids.length === 0) {
      console.log("No user accounts found for tester emails.");
      return;
    }

    console.log(`Found ${uids.length} tester accounts. Deleting data...`);

    // Helper to delete query results
    const deleteQueryBatch = async (queryRef: any) => {
      const snapshot = await getDocs(queryRef);
      const batch = writeBatch(db!);
      let count = 0;
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });
      if (count > 0) {
        await batch.commit();
        console.log(`Deleted ${count} docs.`);
      }
    };

    for (const uid of uids) {
      // Delete Orders
      await deleteQueryBatch(query(collection(db, 'orders'), where('userId', '==', uid)));

      // Delete Payments
      await deleteQueryBatch(query(collection(db, 'payments'), where('userId', '==', uid)));

      // Delete Checkout Sessions
      await deleteQueryBatch(collection(db, 'customers', uid, 'checkout_sessions'));

      // Delete Purchases (User Subcollection)
      await deleteQueryBatch(collection(db, 'users', uid, 'purchases'));
    }

    console.log("Test data deletion complete.");

  } catch (error) {
    console.error("Error deleting test data:", error);
    throw error;
  }
};

export const getRecentBlogPosts = async (limitCount: number = 3): Promise<BlogPost[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure dates are serializable if needed, but for now passing as is
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
    } as BlogPost));

    // Sort in memory to avoid needing a composite index
    return posts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching recent blog posts:", error);
    return [];
  }
};

// --- Collection Management ---

export const subscribeToCollections = (callback: (collections: Collection[]) => void) => {
  if (!db) return () => { };
  const q = query(collection(db, 'collections'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const collections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
    callback(collections);
  });
};

export const addCollection = async (collectionData: Omit<Collection, 'id'>) => {
  if (!db) throw new Error("Firestore not initialized");
  await addDoc(collection(db, 'collections'), {
    ...collectionData,
    createdAt: serverTimestamp()
  });
};

export const updateCollection = async (id: string, data: Partial<Collection>) => {
  if (!db) throw new Error("Firestore not initialized");
  await updateDoc(doc(db, 'collections', id), data);
};

export const deleteCollection = async (id: string) => {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, 'collections', id));
};