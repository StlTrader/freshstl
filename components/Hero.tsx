'use client';

import React, { useMemo } from 'react';
import { ArrowRight, Box, ShieldCheck, Zap, Star } from 'lucide-react';
import { Product, HeroConfig } from '../types';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '../contexts/StoreContext';
import { getStripeConfig } from '../services/paymentService';
import { TiltCard } from './TiltCard';
import { HeroBackground } from './HeroBackground';
import { HeroCarousel } from './HeroCarousel';
import { getCleanImageUrl } from '../utils/urlHelpers';
import { formatPrice } from '../utils/currencyHelpers';

interface HeroProps {
    products: Product[];
    config?: HeroConfig;
}

export const Hero: React.FC<HeroProps> = ({ products, config }) => {
    const { user, currency } = useStore();
    const layout = config?.layout || 'standard';
    const effect = config?.visualEffect || 'none';

    // Filter Drafts - Memoized
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (p.status === 'draft') {
                const config = getStripeConfig();
                const testerEmails = config.testerEmails || [];
                const isAdmin = user?.email === 'stltraderltd@gmail.com';
                const isTester = user?.email && testerEmails.includes(user.email);
                return isAdmin || isTester;
            }
            return true;
        });
    }, [products, user]);

    // Common Elements
    const Content = ({ center = false }: { center?: boolean }) => (
        <div className={`space-y-8 ${center ? 'text-center mx-auto' : 'text-center lg:text-left'}`}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/50 backdrop-blur-sm animate-fade-in-up ${effect === 'glow' ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}`}>
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">
                    New Collection Available
                </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-dark-text-primary leading-[1.1] animate-fade-in-up animation-delay-100">
                Create with <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600 dark:from-white dark:to-gray-400 ${effect === 'glow' ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]' : ''}`}>
                    Precision & Style
                </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-dark-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-200">
                Premium STL files for 3D printing enthusiasts.
                Manifold-verified, support-free optimized, and ready to print.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 ${center ? 'justify-center' : 'justify-center lg:justify-start'} animate-fade-in-up animation-delay-300`}>
                <Link
                    href="#products"
                    className={`inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-brand-600 border border-transparent rounded-xl hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-1 ${effect === 'glow' ? 'shadow-[0_0_20px_rgba(37,99,235,0.5)]' : ''}`}
                >
                    Start Printing
                    <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
                </Link>
                <Link
                    href="/about"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 dark:text-dark-text-primary transition-all duration-200 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 hover:-translate-y-1"
                >
                    <Box className="mr-2 w-5 h-5 text-gray-400" />
                    How it Works
                </Link>
            </div>

            <div className={`pt-8 flex items-center ${center ? 'justify-center' : 'justify-center lg:justify-start'} gap-8 text-sm font-medium text-gray-500 dark:text-dark-text-secondary animate-fade-in-up animation-delay-400`}>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <span>Verified Files</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span>Instant Download</span>
                </div>
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-brand-500" />
                    <span>Premium Quality</span>
                </div>
            </div>
        </div>
    );

    const ProductCard = ({ product, index }: { product: Product, index: number }) => (
        <TiltCard
            enabled={effect === 'tilt'}
            className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-dark-border group"
        >
            <Image
                src={getCleanImageUrl(product.imageUrl)}
                alt={product.name}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                    <p className="text-white font-bold text-lg line-clamp-1">{product.name}</p>
                    <p className="text-brand-300 text-sm font-medium">{formatPrice(product.price, currency)}</p>
                </div>
            </div>
        </TiltCard>
    );

    // Collection Logic
    const [collections, setCollections] = React.useState<any[]>([]);
    const [featuredCollection, setFeaturedCollection] = React.useState<any | null>(null);

    React.useEffect(() => {
        if (config?.mode === 'collection' && config.collectionId) {
            const unsubscribe = import('../services/firebaseService').then(mod => {
                return mod.subscribeToCollections((cols) => {
                    setCollections(cols);
                    const found = cols.find(c => c.id === config.collectionId);
                    setFeaturedCollection(found || null);
                });
            });
            return () => { unsubscribe.then(unsub => unsub && unsub()); };
        } else {
            setFeaturedCollection(null);
        }
    }, [config?.mode, config?.collectionId]);

    // --- Layout Renders ---
    // Use the new Carousel layout by default or if specified
    // For now, we are overriding to use the carousel as the primary view
    return (
        <div className="bg-white dark:bg-dark-bg transition-colors duration-300">
            <HeroCarousel products={filteredProducts} featuredCollection={featuredCollection} />
        </div>
    );
};
