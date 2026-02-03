'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '../types';
import { Plus, Eye, Heart, ShoppingCart, Download } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { getProductUrl, getCleanImageUrl } from '../utils/urlHelpers';
import { formatPrice } from '../utils/currencyHelpers';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const router = useRouter();
    const { addToCart, toggleWishlist, wishlist, purchases, cart, setIsCartOpen, currency } = useStore();

    const mainImage = getCleanImageUrl(product.imageUrl, product.category);
    const [activeImage, setActiveImage] = useState(mainImage);

    // Combine main image and additional images for the carousel
    // Ensure unique images
    const allImages = [mainImage, ...(product.images || []).map(img => getCleanImageUrl(img, product.category))].filter((v, i, a) => a.indexOf(v) === i && v);

    return (
        <div className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-social-light-hover dark:hover:bg-social-dark-hover transition-all duration-200">
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-xl aspect-square mb-2">
                <Link href={getProductUrl({ category: product.category, slug: product.slug })} className="block w-full h-full">
                    {activeImage ? (
                        <Image
                            src={activeImage}
                            alt={`3D model of ${product.name}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-social-dark-hover flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                    )}
                </Link>

                {/* Draft Badge */}
                {product.status === 'draft' && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full z-20">
                        DRAFT
                    </div>
                )}

                {/* Wishlist Button (Top Right) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-all z-20 ${wishlist.includes(product.id)
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100'
                        }`}
                    aria-label={wishlist.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    <Heart size={16} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                </button>

                {/* Floating Action Bar (Bottom Right - Visible on Hover) */}
                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
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
                        className={`p-2.5 rounded-full shadow-lg backdrop-blur-md transition-colors ${purchases.some(p => p.productId === product.id)
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-white text-black hover:bg-gray-100'
                            }`}
                        title={purchases.some(p => p.productId === product.id) ? "Download" : "Add to Cart"}
                    >
                        {purchases.some(p => p.productId === product.id) ? (
                            <Download size={18} />
                        ) : (
                            <ShoppingCart size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <Link href={getProductUrl({ category: product.category, slug: product.slug })} className="block px-1 pb-2">
                <h3 className="text-sm font-bold text-social-black dark:text-white truncate pr-2">
                    {product.name}
                </h3>
                <div className="flex items-center mt-1 gap-2">
                    <span className="text-sm font-medium text-social-black dark:text-gray-300">
                        {formatPrice(product.price, currency)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {product.category}
                    </span>
                </div>
            </Link>
        </div>
    );
};
