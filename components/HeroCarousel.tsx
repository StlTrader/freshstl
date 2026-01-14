'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product, Collection } from '../types';

interface HeroCarouselProps {
    products: Product[];
    featuredCollection?: Collection | null;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ products, featuredCollection }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Mock data for the "Dragon Warriors" slide if not present in products
    const dragonSlide = {
        id: 'dragon-warriors-collection',
        title: 'Dragon Warriors Collection',
        subtitle: 'Premium Series',
        description: 'Unleash the power of high-fidelity 3D printable dragons. Manifold verified.',
        image: 'https://placehold.co/1200x600/1a1a1a/ffffff/png?text=Dragon+Warriors', // Placeholder
        link: '/products?category=dragons',
        isCustom: true
    };

    // Determine the first slide: Featured Collection > Dragon Slide (Default)
    const heroSlide = featuredCollection ? {
        id: featuredCollection.id,
        title: featuredCollection.title,
        subtitle: 'Featured Collection',
        description: featuredCollection.description,
        image: featuredCollection.imageUrl,
        link: `/collections/${featuredCollection.id}`, // Assuming we have a collection page or similar
        isCustom: true
    } : dragonSlide;

    // Combine custom slides with product slides
    const slides = [
        heroSlide,
        ...products.slice(0, 4).map(p => ({
            id: p.id,
            title: p.name,
            subtitle: 'New Arrival',
            description: 'Premium STL for 3D printing. Ready to print.',
            image: p.imageUrl,
            link: `/3d-print/${p.slug}`,
            isCustom: false
        }))
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="relative w-full h-[320px] md:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden group shadow-sm border border-gray-100 dark:border-dark-border">
                {/* Slides */}
                <div
                    className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="w-full h-full flex-shrink-0 relative bg-gray-50 dark:bg-dark-surface">
                            {/* Background Image with Overlay */}
                            {/* Background Image with Overlay */}
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                {slide.image ? (
                                    <>
                                        {/* Blurred Background for Atmosphere */}
                                        <Image
                                            src={slide.image}
                                            alt=""
                                            fill
                                            quality={50}
                                            priority={index === 0}
                                            className="object-cover blur-xl scale-110 opacity-50 dark:opacity-40"
                                        />
                                        {/* Main Sharp Image */}
                                        <Image
                                            src={slide.image}
                                            alt={slide.title}
                                            fill
                                            quality={95}
                                            priority={index === 0}
                                            className="object-contain transition-transform duration-[20s] ease-linear scale-100 group-hover:scale-105 z-10"
                                            sizes="(max-width: 768px) 100vw, 1280px"
                                        />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-social-dark-hover" />
                                )}
                                {/* Gradient Overlay Removed as per user request */}
                                {/* <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent" /> */}
                            </div>

                            {/* Content Container - Flex layout for consistent alignment */}
                            <div className="relative z-10 w-full h-full px-8 md:px-16 flex flex-col justify-center">
                                <div className="max-w-lg flex flex-col h-full justify-center py-12 md:py-16">
                                    {/* Top Content Group */}
                                    <div className="flex-grow flex flex-col justify-center space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm w-fit">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                                            <span className="text-[10px] md:text-xs font-bold text-social-black dark:text-white uppercase tracking-widest">
                                                {slide.subtitle}
                                            </span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-social-black dark:text-white tracking-tight leading-[1.1] line-clamp-2">
                                            {slide.title}
                                        </h2>

                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-md font-medium leading-relaxed line-clamp-2">
                                            {slide.description}
                                        </p>
                                    </div>

                                    {/* Button Group - Anchored or consistently spaced */}
                                    <div className="pt-4 mt-auto md:mt-0">
                                        <Link
                                            href={slide.link}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-social-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                                        >
                                            Shop Collection
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <div className="hidden md:block">
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 text-social-black dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white/60 dark:hover:bg-black/60 hover:scale-110 active:scale-95 z-20"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 text-social-black dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white/60 dark:hover:bg-black/60 hover:scale-110 active:scale-95 z-20"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-6 left-8 md:left-16 flex gap-1.5 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index
                                ? 'bg-social-black dark:bg-white w-6'
                                : 'bg-gray-300 dark:bg-gray-600 w-1.5 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
