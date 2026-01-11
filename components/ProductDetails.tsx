'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Review } from '../types';
import { useStore } from '../contexts/StoreContext';
import { SketchfabViewer } from './SketchfabViewer';
import { ShoppingCart, Star, Share2, ShieldCheck, Download, ArrowLeft, Lock, Box, Heart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import * as firebaseService from '../services/firebaseService';
import { getStripeConfig } from '../services/paymentService';

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const router = useRouter();
    const { addToCart, toggleWishlist, wishlist, purchases, cart, setIsCartOpen, user, isAuthReady } = useStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [isDownloading, setIsDownloading] = useState(false);
    const [activeMedia, setActiveMedia] = useState<string>('model'); // 'model' or image URL
    const [isAuthorized, setIsAuthorized] = useState(product.status !== 'draft');

    const [thumbPage, setThumbPage] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        const unsubscribe = firebaseService.subscribeToProducts((products) => {
            // Filter out current product and get 4 random-ish or sequential items
            const others = products.filter(p => p.id !== product.id && p.status !== 'draft');
            // Simple shuffle or just slice for now. Let's just take first 4 for stability, 
            // or maybe filter by category if we wanted to be fancy.
            // Let's try to match category first
            const sameCategory = others.filter(p => p.category === product.category);
            const diffCategory = others.filter(p => p.category !== product.category);

            const combined = [...sameCategory, ...diffCategory].slice(0, 4);
            setRelatedProducts(combined);
        });
        return () => unsubscribe();
    }, [product.id, product.category]);

    useEffect(() => {
        if (product.status === 'draft') {
            if (!isAuthReady) return;

            const config = getStripeConfig();
            const testerEmails = config.testerEmails || [];
            const isAdmin = user?.email === 'stltraderltd@gmail.com';
            const isTester = user?.email && testerEmails.includes(user.email);

            if (isAdmin || isTester) {
                setIsAuthorized(true);
            } else {
                router.replace('/');
            }
        }
    }, [product, user, isAuthReady, router]);

    const isPurchased = purchases.some(p => p.productId === product.id);
    const isWishlisted = wishlist.includes(product.id);
    const viewerUrl = product.modelUrl;

    const mediaList = ['model', ...(product.images || []), ...(product.imageUrl && !product.images?.includes(product.imageUrl) ? [product.imageUrl] : [])];

    const handleNext = () => {
        const currentIndex = mediaList.indexOf(activeMedia);
        const nextIndex = (currentIndex + 1) % mediaList.length;
        setActiveMedia(mediaList[nextIndex]);
    };

    const handlePrev = () => {
        const currentIndex = mediaList.indexOf(activeMedia);
        const prevIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
        setActiveMedia(mediaList[prevIndex]);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const unsub = firebaseService.subscribeToReviews(product.id, (data) => setReviews(data));
        return () => unsub();
    }, [product.id]);



    const handleSecureDownload = async () => {
        if (!user || !isPurchased) return;
        setIsDownloading(true);
        try {
            const url = await firebaseService.getSecureDownloadUrl(product.id);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${product.name.replace(/\s+/g, '_')}.stl`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
            alert("Download failed. Please try again or contact support.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            await firebaseService.addReview({
                productId: product.id,
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                rating,
                comment
            });
            setComment('');
            setRating(5);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddToCart = () => {
        const isInCart = cart.some(item => item.id === product.id);
        if (isInCart) {
            setIsCartOpen(true);
        } else {
            addToCart(product);
        }
    };

    const handleCustomize = () => {
        router.push(`/builder/${product.id}`);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out ${product.name} on FreshSTL!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };



    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-4 pb-32 lg:pb-20 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Draft Banner */}
                {product.status === 'draft' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ShieldCheck className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <span className="font-bold">Draft Mode:</span> This product is not visible to the public.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Breadcrumb / Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-500 transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-gray-900 dark:bg-dark-surface rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] relative ring-1 ring-white/10 group">
                            {activeMedia === 'model' ? (
                                <SketchfabViewer modelUrl={viewerUrl} />
                            ) : (
                                <div className="relative w-full h-full bg-black">
                                    <Image
                                        src={activeMedia}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            )}

                            {/* Carousel Navigation */}
                            {mediaList.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 backdrop-blur-sm z-10"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 backdrop-blur-sm z-10"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Media Gallery */}
                        {/* Media Gallery */}
                        <div className="w-full overflow-hidden">
                            <div className="flex gap-3 pb-4 items-center justify-center sm:justify-start">
                                {/* Fixed Model Button */}
                                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                                    <button
                                        onClick={() => setActiveMedia('model')}
                                        className={`w-full h-full rounded-lg overflow-hidden border-2 transition-all ${activeMedia === 'model' ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <div className="w-full h-full bg-gray-800 dark:bg-dark-surface flex items-center justify-center text-white">
                                            <Box size={24} />
                                        </div>
                                    </button>
                                </div>

                                {/* Paginated Image List */}
                                {product.images && product.images.length > 0 ? (
                                    <>
                                        {/* Left Arrow */}
                                        {thumbPage > 0 && (
                                            <button
                                                onClick={() => setThumbPage(p => Math.max(0, p - 1))}
                                                className="p-1 rounded-full bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-border transition-colors"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                        )}

                                        {/* Thumbnails (Max 3) */}
                                        {product.images.slice(thumbPage * 3, (thumbPage + 1) * 3).map((img, idx) => (
                                            <button
                                                key={thumbPage * 3 + idx}
                                                onClick={() => setActiveMedia(img)}
                                                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${activeMedia === img ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image src={img} alt={`View ${thumbPage * 3 + idx + 1}`} fill sizes="80px" className="object-cover" />
                                                </div>
                                            </button>
                                        ))}

                                        {/* Right Arrow */}
                                        {(thumbPage + 1) * 3 < product.images.length && (
                                            <button
                                                onClick={() => setThumbPage(p => p + 1)}
                                                className="p-1 rounded-full bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-border transition-colors"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    // Fallback if no images array but imageUrl exists
                                    product.imageUrl && (
                                        <button
                                            onClick={() => setActiveMedia(product.imageUrl)}
                                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${activeMedia === product.imageUrl ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <div className="relative w-full h-full">
                                                <Image src={product.imageUrl} alt="Main View" fill sizes="80px" className="object-cover" />
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Mobile-only Title (visible on small screens) */}
                        <div className="lg:hidden px-1">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary mb-2 leading-tight">{product.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span className="bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 px-2 py-0.5 rounded-full font-bold text-xs uppercase tracking-wider">
                                    {product.category}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="font-medium text-gray-900 dark:text-dark-text-primary">{product.rating || 5.0}</span>
                                    <span>({reviews.length} reviews)</span>
                                </div>
                            </div>

                            {/* Mobile Price & Cart Actions */}
                            <div className="bg-white dark:bg-dark-surface rounded-xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-dark-border">
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-4xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">
                                        ${(product.price / 100).toFixed(2)}
                                    </span>
                                    <span className="text-gray-500 dark:text-dark-text-secondary font-medium mb-1.5">USD</span>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => isPurchased ? handleSecureDownload() : handleAddToCart()}
                                        disabled={isDownloading}
                                        className={`w-full font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${isPurchased
                                            ? 'bg-green-600 text-white shadow-green-500/20'
                                            : 'bg-brand-600 text-white shadow-brand-500/20'
                                            }`}
                                    >
                                        {isPurchased ? (
                                            <>
                                                {isDownloading ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
                                                {isDownloading ? 'Generating Link...' : 'Download Secure STL'}
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                Add to Cart
                                            </>
                                        )}
                                    </button>

                                    {product.isBuilderEnabled && (
                                        <button
                                            onClick={handleCustomize}
                                            className="w-full font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 bg-purple-600 text-white shadow-purple-500/20"
                                        >
                                            <Box className="w-5 h-5" />
                                            Customize in 3D Builder
                                        </button>
                                    )}

                                    <div className="pt-2 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-dark-text-secondary">
                                        <button
                                            onClick={() => toggleWishlist(product.id)}
                                            className={`flex items-center gap-2 transition-colors ${isWishlisted ? 'text-red-500' : 'hover:text-brand-500'}`}
                                        >
                                            <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                                            {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                        </button>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 hover:text-brand-500 transition-colors"
                                        >
                                            <Share2 size={16} /> Share
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Tabs (Description / Reviews) */}
                            <div className="mb-6 px-1">
                                <div className="flex items-center gap-6 border-b border-gray-200 dark:border-dark-border mb-4">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`pb-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'description' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary'}`}
                                    >
                                        About this model
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`pb-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary'}`}
                                    >
                                        Reviews ({reviews.length})
                                    </button>
                                </div>

                                {activeTab === 'description' ? (
                                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className={`text-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                                            {product.description}
                                        </div>
                                        {product.description.length > 150 && (
                                            <button
                                                onClick={() => setShowFullDescription(!showFullDescription)}
                                                className="text-brand-600 dark:text-brand-400 font-bold text-sm mt-1 hover:underline"
                                            >
                                                {showFullDescription ? 'Read Less' : 'Read More'}
                                            </button>
                                        )}

                                        {/* Feature Badges */}
                                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
                                            <div className="flex flex-col gap-2">
                                                <div className="p-2 w-fit bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-dark-text-primary">Verified</h4>
                                                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-0.5">Watertight geometry.</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="p-2 w-fit bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                                    <Download size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-dark-text-primary">Instant</h4>
                                                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-0.5">STL & OBJ included.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
                                        {/* Reviews List */}
                                        <div className="space-y-6">
                                            {reviews.length === 0 ? (
                                                <div className="text-center py-8 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-dashed border-gray-200 dark:border-dark-border">
                                                    <p className="text-gray-500 text-sm">No reviews yet.</p>
                                                </div>
                                            ) : (
                                                reviews.map(review => (
                                                    <div key={review.id} className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                            {review.userName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-bold text-sm text-gray-900 dark:text-dark-text-primary truncate">{review.userName}</h4>
                                                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                                    {typeof review.date.toDate === 'function' ? review.date.toDate().toLocaleDateString() : 'Recently'}
                                                                </span>
                                                            </div>
                                                            <div className="flex mb-1.5">
                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                    <Star key={i} size={12} className={i <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-dark-border"} />
                                                                ))}
                                                            </div>
                                                            <p className="text-gray-600 dark:text-dark-text-secondary text-sm leading-relaxed">{review.comment}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Mobile Write Review */}
                                        {user ? (
                                            <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-xl border border-gray-100 dark:border-dark-border">
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-dark-text-primary mb-3">Write a Review</h3>
                                                <form onSubmit={handleSubmitReview}>
                                                    <div className="flex gap-2 mb-3">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                type="button"
                                                                key={star}
                                                                onClick={() => setRating(star)}
                                                                className="focus:outline-none"
                                                            >
                                                                <Star size={20} className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-dark-border"} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        value={comment}
                                                        onChange={e => setComment(e.target.value)}
                                                        placeholder="Share your experience..."
                                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all mb-3"
                                                        rows={3}
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? 'Posting...' : 'Post Review'}
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="text-center p-4 bg-gray-50 dark:bg-dark-bg rounded-xl">
                                                <p className="text-sm font-bold text-brand-600 dark:text-brand-400">Sign in to leave a review</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description / Reviews Tabs (Desktop Only) */}
                        <div className="hidden lg:block bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-dark-border">
                            <div className="flex border-b border-gray-200 dark:border-dark-border mb-6">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'description' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary'}`}
                                >
                                    Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary'}`}
                                >
                                    Reviews ({reviews.length})
                                </button>
                            </div>

                            {activeTab === 'description' ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed text-lg">
                                        {product.description}
                                    </p>

                                    <div className="grid sm:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-100 dark:border-dark-border">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-dark-text-primary">Manifold Verified</h4>
                                                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Guaranteed watertight geometry. Ready to slice and print without errors.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                                <Download size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-dark-text-primary">Instant Download</h4>
                                                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Get your files immediately after purchase. Includes STL and OBJ formats.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        {reviews.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-dashed border-gray-200 dark:border-dark-border">
                                                <p className="text-gray-500">No reviews yet. Be the first to share your print!</p>
                                            </div>
                                        ) : (
                                            reviews.map(review => (
                                                <div key={review.id} className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {review.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-bold text-gray-900 dark:text-dark-text-primary">{review.userName}</h4>
                                                            <span className="text-xs text-gray-400">
                                                                {typeof review.date.toDate === 'function' ? review.date.toDate().toLocaleDateString() : 'Recently'}
                                                            </span>
                                                        </div>
                                                        <div className="flex mb-2">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <Star key={i} size={14} className={i <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-dark-border"} />
                                                            ))}
                                                        </div>
                                                        <p className="text-gray-600 dark:text-dark-text-secondary text-sm leading-relaxed">{review.comment}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Write Review */}
                                    {user ? (
                                        <div className="bg-gray-50 dark:bg-dark-bg p-6 rounded-xl border border-gray-100 dark:border-dark-border">
                                            <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4">Write a Review</h3>
                                            <form onSubmit={handleSubmitReview}>
                                                <div className="flex gap-2 mb-4">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            onClick={() => setRating(star)}
                                                            className="focus:outline-none hover:scale-110 transition-transform"
                                                        >
                                                            <Star size={24} className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-dark-border"} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                    placeholder="How did it print? Share your settings and experience..."
                                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface dark:text-dark-text-primary focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all mb-4"
                                                    rows={3}
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-50"
                                                >
                                                    {isSubmitting ? 'Posting...' : 'Post Review'}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 bg-gray-50 dark:bg-dark-bg rounded-xl">
                                            <p className="text-gray-500 mb-2">Want to share your thoughts?</p>
                                            <p className="text-sm font-bold text-brand-600 dark:text-brand-400">Please sign in to leave a review.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Product Info (Sticky Sidebar) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">

                            {/* Main Info Card */}
                            <div className="hidden lg:block bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-dark-border">
                                <div className="hidden lg:block">
                                    <span className="text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-widest mb-2 block">
                                        {product.category}
                                    </span>
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-4 leading-tight">{product.name}</h1>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} size={16} className={i <= (product.rating || 5) ? "fill-current" : "text-gray-300 dark:text-dark-border"} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">({reviews.length} reviews)</span>
                                    </div>
                                </div>

                                <div className="flex items-end gap-2 mb-8">
                                    <span className="text-5xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">
                                        ${(product.price / 100).toFixed(2)}
                                    </span>
                                    <span className="text-gray-500 dark:text-dark-text-secondary font-medium mb-2">USD</span>
                                </div>

                                <button
                                    onClick={() => isPurchased ? handleSecureDownload() : handleAddToCart()}
                                    disabled={isDownloading}
                                    className={`w-full font-bold py-4 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 group ${isPurchased
                                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/30'
                                        : 'bg-brand-600 hover:bg-brand-500 text-white hover:shadow-brand-500/30'
                                        }`}
                                >
                                    {isPurchased ? (
                                        <>
                                            {isDownloading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                            {isDownloading ? 'Generating Link...' : 'Download Secure STL'}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Add to Cart
                                        </>
                                    )}
                                </button>

                                {product.isBuilderEnabled && (
                                    <button
                                        onClick={handleCustomize}
                                        className="w-full mt-3 font-bold py-4 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-500 text-white hover:shadow-purple-500/30 group"
                                    >
                                        <Box className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Customize in 3D Builder
                                    </button>
                                )}

                                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-dark-text-secondary">
                                    <button
                                        onClick={() => toggleWishlist(product.id)}
                                        className={`flex items-center gap-2 transition-colors ${isWishlisted ? 'text-red-500' : 'hover:text-brand-500'}`}
                                    >
                                        <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                                        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                    </button>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 hover:text-brand-500 transition-colors"
                                    >
                                        <Share2 size={16} /> Share
                                    </button>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                                    <ShieldCheck size={16} /> Secure Payment
                                </div>
                            </div>

                            {/* Artist / License Card */}
                            <div className="bg-gray-50 dark:bg-dark-surface/50 rounded-2xl p-6 border border-gray-200 dark:border-dark-border">
                                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4 text-sm uppercase tracking-wide">License & Usage</h3>
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span> Personal use only
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span> 3D Printing allowed
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500">✕</span> No redistribution
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500">✕</span> No commercial sales
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16 border-t border-gray-200 dark:border-dark-border pt-12">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary mb-6">You might also like</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedProducts.map((related) => (
                                    <div
                                        key={related.id}
                                        onClick={() => router.push(`/product/${related.id}`)}
                                        className="group cursor-pointer bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-dark-border"
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-dark-bg">
                                            <Image
                                                src={related.imageUrl || '/placeholder.png'}
                                                alt={related.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {related.price === 0 && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                    FREE
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-gray-900 dark:text-dark-text-primary text-sm truncate mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                {related.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary">
                                                    {related.price === 0 ? 'Free' : `$${(related.price / 100).toFixed(2)}`}
                                                </span>
                                                <div className="flex items-center text-yellow-400 text-xs">
                                                    <Star size={12} className="fill-current" />
                                                    <span className="ml-1 text-gray-400 dark:text-dark-text-secondary">{related.rating || 5.0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>


        </div>
    );
}
