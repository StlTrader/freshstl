import { Timestamp } from 'firebase/firestore';

// Global variables injected by the environment
declare global {
  interface Window {
    __app_id?: string;
    __firebase_config?: any;
    __initial_auth_token?: string;
  }
}

export interface Product {
  id: string;
  name: string;
  slug: string; // URL-friendly version of name
  price: number; // in cents
  description: string;
  imageUrl: string;
  images?: string[]; // Array of additional image URLs
  modelUrl?: string; // URL to .stl or .glb file
  category: string;
  categoryId?: string; // New Category Reference
  previewStoragePath?: string; // Path to GLB in public/
  sourceStoragePath?: string; // Path to STL in protected/
  videoUrl?: string; // URL for the product video
  tags: string[]; // Added tags
  sales?: number; // Total number of times sold
  rating?: number; // Average rating (1-5)
  reviewCount?: number; // Total number of reviews
  isBuilderEnabled?: boolean; // Toggle for product-specific builder
  aiModel?: string; // The AI model used to generate this product's assets
  status?: 'published' | 'draft'; // Product status
  createdAt?: any;
  updatedAt?: any;
  lastIndexedAt?: any; // Timestamp of last Google Indexing request
  show3DModel?: boolean; // Toggle for 3D model visibility
  showVideo?: boolean; // Toggle for video visibility
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: any;
}

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for the item in cart
}

export interface Purchase {
  id?: string;
  transactionId: string;
  productId: string;
  productName: string;
  purchaseDate: Timestamp;
  downloadLink: string;
}

export interface Order {
  id: string;
  userId: string;
  transactionId: string;
  amount: number;
  discountApplied?: number;
  items: { id: string; name: string; price: number; imageUrl?: string; slug?: string }[];
  date: Timestamp;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  customerInfo?: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
  paymentId?: string;
  isTest?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Timestamp;
}

export interface Coupon {
  code: string;
  discountPercent: number; // 0-100
  isActive: boolean;
}

export enum ViewState {
  HOME = 'HOME',
  PURCHASES = 'PURCHASES',
  ADMIN = 'ADMIN',
  LOGIN = 'LOGIN',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  SUPPORT = 'SUPPORT',
  LICENSE = 'LICENSE',
  PRODUCT_DETAILS = 'PRODUCT_DETAILS',
  BUILDER = 'BUILDER',
}

export interface StripeConfig {
  failureRate: number; // 0 to 1
  minDelay: number;
  maxDelay: number;
  publicKey?: string;
  testPublicKey?: string;
  livePublicKey?: string;
  testSecretKey?: string; // Admin Only
  liveSecretKey?: string; // Admin Only
  testWebhookSecret?: string; // Admin Only
  liveWebhookSecret?: string; // Admin Only
  mode: 'test' | 'live';
  isConnected: boolean;
  testerEmails?: string[];
}
export interface Collection {
  id: string;
  title: string;
  description: string;
  price: number; // Optional, if it's a bundle with a specific price
  productIds: string[];
  imageUrl: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: any;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown content
  excerpt: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  published: boolean;
  createdAt: any; // Timestamp | string | number
  updatedAt: any; // Timestamp | string | number
  lastIndexedAt?: any; // Timestamp of last Google Indexing request
}

export interface PaymentMethod {
  id: string;
  brand: string; // 'visa', 'mastercard', etc.
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod: string; // 'card', 'stripe', 'mock'
  stripePaymentIntentId?: string;
  cardBrand?: string;
  cardLast4?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isTest?: boolean;
}

export interface CustomerInfo {
  fullName?: string;
  displayName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  role?: 'admin' | 'customer' | 'tester';
  photoURL?: string;
  createdAt?: any;
  isBlocked?: boolean;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface BuilderCategory {
  id: string;
  name: string;
  slug: string;
  productId?: string; // Optional: if set, category is specific to this product
}

export interface BuilderAsset {
  id: string;
  name: string;
  categoryId: string;
  categorySlug: string;
  modelUrl: string;
  thumbnailUrl?: string;
  price?: number;
  color?: string;
  productId?: string; // Optional: if set, asset is specific to this product
  variations?: BuilderAssetVariation[];
}

export interface BuilderAssetVariation {
  id: string;
  name: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  color?: string;
  price?: number;
}

export interface HeroConfig {
  mode: 'auto' | 'custom' | 'collection';
  autoType?: 'newest' | 'popular' | 'random';
  customProductIds?: string[];
  collectionId?: string;
  layout?: 'standard' | 'centered' | 'split' | 'asymmetrical' | 'grid';
  visualEffect?: 'none' | 'tilt' | 'glow' | 'parallax';
}