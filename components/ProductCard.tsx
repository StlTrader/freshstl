'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '../types';
import { Plus, Eye, Heart, ShoppingCart, Download } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const router = useRouter();
    const { addToCart, toggleWishlist, wishlist, purchases, cart, setIsCartOpen } = useStore();
    const [activeImage, setActiveImage] = useState(product.imageUrl);

    // Combine main image and additional images for the carousel
    // Ensure unique images
    const allImages = [product.imageUrl, ...(product.images || [])].filter((v, i, a) => a.indexOf(v) === i && v);

    return (
        <div className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-dark-surface shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative overflow-hidden aspect-square">
                <Link href={`/3d-print/${product.slug}`} className="block w-full h-full">
                    {activeImage ? (
                        <Image
                            src={activeImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-dark-surface flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                    )}
                </Link>

                {/* Draft Badge */}
                {product.status === 'draft' && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md z-20 shadow-md border border-yellow-500">
                        DRAFT
                    </div>
                )}

                {/* Wishlist Button (Top Right) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all z-20 ${wishlist.includes(product.id)
                        ? 'bg-red-500 text-white shadow-lg scale-110'
                        : 'bg-black/20 text-white hover:bg-black/40'
                        }`}
                    aria-label={wishlist.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    <Heart size={16} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                </button>

                {/* Floating Action Bar (Center - Visible on Hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <div className="flex gap-2 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md p-2 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                        <Link
                            href={`/3d-print/${product.slug}`}
                            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-dark-text-primary transition-colors"
                            title="Quick View"
                        >
                            <Eye size={20} />
                        </Link>
                        <div className="w-px bg-gray-200 dark:bg-white/10 my-1"></div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const isPurchased = purchases.some(p => p.productId === product.id);
                                const isInCart = cart.some(item => item.id === product.id);

                                if (isPurchased) {
                                    router.push('/purchases');
                                    return;
                                }
                                if (isInCart) {
                                    setIsCartOpen(true);
                                    return;
                                }
                                addToCart(product);
                            }}
                            className={`p-2.5 rounded-full transition-colors ${purchases.some(p => p.productId === product.id)
                                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                                }`}
                            title={purchases.some(p => p.productId === product.id) ? "Download" : "Add to Cart"}
                        >
                            {purchases.some(p => p.productId === product.id) ? (
                                <Download size={20} />
                            ) : (
                                <ShoppingCart size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mini Carousel (Bottom - Always Visible) */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onMouseEnter={() => setActiveImage(img)}
                                    onClick={(e) => { e.stopPropagation(); setActiveImage(img); }}
                                    className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 shadow-sm ${activeImage === img ? 'border-brand-500 scale-105' : 'border-white/30 hover:border-white/80'}`}
                                >
                                    <Image src={img} alt={`View ${idx}`} fill sizes="40px" className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <Link href={`/3d-print/${product.slug}`} className="block p-3 md:p-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-dark-text-primary truncate pr-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {product.name}
                </h3>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium px-2 py-1 bg-gray-100 dark:bg-dark-bg rounded-md">
                        {product.category}
                    </p>
                    <span className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">
                        ${(product.price / 100).toFixed(2)}
                    </span>
                </div>
            </Link>
        </div>
    );
};
