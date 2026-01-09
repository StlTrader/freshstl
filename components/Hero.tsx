'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Box, ShieldCheck, Zap, Star } from 'lucide-react';
import { Product, HeroConfig } from '../types';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '../contexts/StoreContext';
import { getStripeConfig } from '../services/paymentService';

interface HeroProps {
    products: Product[];
    config?: HeroConfig;
}

export const Hero: React.FC<HeroProps> = ({ products, config }) => {
    const { user } = useStore();
    const layout = config?.layout || 'standard';
    const effect = config?.visualEffect || 'none';

    // Filter Drafts
    const filteredProducts = products.filter(p => {
        if (p.status === 'draft') {
            const config = getStripeConfig();
            const testerEmails = config.testerEmails || [];
            const isAdmin = user?.email === 'stltraderltd@gmail.com';
            const isTester = user?.email && testerEmails.includes(user.email);
            return isAdmin || isTester;
        }
        return true;
    });

    // Parallax State
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        if (effect === 'parallax') {
            const handleScroll = () => setScrollY(window.scrollY);
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [effect]);

    // Tilt Effect Helper
    const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
        const ref = useRef<HTMLDivElement>(null);
        const [rotate, setRotate] = useState({ x: 0, y: 0 });

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!ref.current || effect !== 'tilt') return;
            const rect = ref.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
            const rotateY = ((x - centerX) / centerX) * 10;

            setRotate({ x: rotateX, y: rotateY });
        };

        const handleMouseLeave = () => {
            setRotate({ x: 0, y: 0 });
        };

        return (
            <div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`transition-transform duration-200 ease-out ${className}`}
                style={{
                    transform: effect === 'tilt' ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` : 'none'
                }}
            >
                {children}
            </div>
        );
    };

    // Common Elements
    const Background = () => (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent dark:from-dark-bg/80 dark:via-transparent dark:to-transparent" />

            {/* Parallax Orbs */}
            <div
                className={`absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none transition-transform duration-75 ease-out`}
                style={{ transform: effect === 'parallax' ? `translateY(${scrollY * 0.2}px)` : 'none' }}
            />
            <div
                className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-30 pointer-events-none transition-transform duration-75 ease-out`}
                style={{ transform: effect === 'parallax' ? `translateY(${scrollY * -0.2}px)` : 'none' }}
            />
        </div>
    );

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
        <TiltCard className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-dark-border group">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                    <p className="text-white font-bold text-lg line-clamp-1">{product.name}</p>
                    <p className="text-brand-300 text-sm font-medium">${(product.price / 100).toFixed(2)}</p>
                </div>
            </div>
        </TiltCard>
    );

    // --- Layout Renders ---

    if (layout === 'centered') {
        return (
            <div className="relative overflow-hidden bg-white dark:bg-dark-bg transition-colors duration-300 border-b border-gray-100 dark:border-dark-border">
                <Background />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                    <Content center />
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredProducts.slice(0, 4).map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (layout === 'split') {
        return (
            <div className="relative overflow-hidden bg-white dark:bg-dark-bg transition-colors duration-300 border-b border-gray-100 dark:border-dark-border min-h-[90vh] flex items-center">
                <Background />
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <Content />
                        <div className="grid grid-cols-2 gap-4">
                            {filteredProducts.slice(0, 4).map((p, i) => (
                                <div key={p.id} className={i % 2 === 1 ? 'mt-12' : ''}>
                                    <ProductCard product={p} index={i} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (layout === 'grid') {
        return (
            <div className="relative overflow-hidden bg-white dark:bg-dark-bg transition-colors duration-300 border-b border-gray-100 dark:border-dark-border">
                <Background />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5">
                            <Content />
                        </div>
                        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                            {filteredProducts.slice(0, 4).map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (layout === 'asymmetrical') {
        return (
            <div className="relative overflow-hidden bg-white dark:bg-dark-bg transition-colors duration-300 border-b border-gray-100 dark:border-dark-border min-h-[80vh] flex items-center">
                <Background />
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="w-full lg:w-3/5 relative z-10">
                            {filteredProducts[0] && (
                                <TiltCard className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative">
                                    <Image
                                        src={filteredProducts[0].imageUrl}
                                        alt={filteredProducts[0].name}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                        className="object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                                        <h3 className="text-3xl font-bold text-white">{filteredProducts[0].name}</h3>
                                        <p className="text-brand-300 text-xl font-medium mt-2">${(filteredProducts[0].price / 100).toFixed(2)}</p>
                                    </div>
                                </TiltCard>
                            )}
                        </div>
                        <div className="w-full lg:w-2/5 lg:-ml-20 relative z-20 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-gray-200 dark:border-dark-border mt-8 lg:mt-0">
                            <Content />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Standard Layout (Default)
    return (
        <div className="relative overflow-hidden bg-white dark:bg-dark-bg transition-colors duration-300 border-b border-gray-100 dark:border-dark-border">
            <Background />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <Content />
                    <div className="relative block mt-12 lg:mt-0 animate-fade-in-up animation-delay-200">
                        <div className="relative w-full aspect-square max-w-[320px] sm:max-w-lg mx-auto">
                            <div className={`absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-blue-500/10 rounded-full blur-3xl ${effect === 'glow' ? 'animate-pulse' : ''}`} />

                            {filteredProducts.length > 0 ? (
                                <div className="relative w-full h-full">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 sm:w-80 sm:h-96 z-20 transform rotate-[-6deg] hover:rotate-0 transition-all duration-500">
                                        <ProductCard product={filteredProducts[0]} index={0} />
                                    </div>
                                    {filteredProducts.length > 1 && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 sm:w-80 sm:h-96 z-10 transform rotate-[6deg] translate-x-8 translate-y-4 sm:translate-x-12 opacity-80">
                                            <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-surface shadow-xl relative">
                                                <Image
                                                    src={filteredProducts[1].imageUrl}
                                                    alt={filteredProducts[1].name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover grayscale"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 sm:w-80 sm:h-96 bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border p-4 flex items-center justify-center">
                                    <div className="text-center">
                                        <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">Coming Soon</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
