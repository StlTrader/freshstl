'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Review } from '../types';
import { useStore } from '../contexts/StoreContext';
import { SketchfabViewer } from './SketchfabViewer';
import { ShoppingCart, Star, Share2, ShieldCheck, Download, ArrowLeft, Lock, Box, Heart, Loader2, ChevronLeft, ChevronRight, Check, X, PlayCircle } from 'lucide-react';
import * as firebaseService from '../services/firebaseService';
import { getStripeConfig } from '../services/paymentService';
import { ProductCardSkeleton, Skeleton } from './LoadingSkeleton';
import { getProductUrl, getCleanImageUrl } from '../utils/urlHelpers';
import { formatPrice } from '../utils/currencyHelpers';

interface ProductDetailsProps {
    product: Product;
    initialRelatedProducts?: Product[];
    initialReviews?: Review[];
}

export default function ProductDetails({ product, initialRelatedProducts = [], initialReviews = [] }: ProductDetailsProps) {
    const router = useRouter();
    const { addToCart, toggleWishlist, wishlist, purchases, cart, setIsCartOpen, user, isAuthReady, currency } = useStore();
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [isDownloading, setIsDownloading] = useState(false);
    const mainImage = getCleanImageUrl(product.imageUrl, product.category);
    const images = (product.images || []).map(img => getCleanImageUrl(img, product.category));

    const [activeMedia, setActiveMedia] = useState<string>(
        (images.length > 0) ? images[0] :
            (mainImage ? mainImage : 'model')
    );
    const [isAuthorized, setIsAuthorized] = useState(product.status !== 'draft');

    const [thumbPage, setThumbPage] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelatedProducts);
    const [isLoadingRelated, setIsLoadingRelated] = useState(initialRelatedProducts.length === 0);

    useEffect(() => {
        setIsLoadingRelated(true);
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
            setIsLoadingRelated(false);
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

    const mediaList = [
        ...images,
        ...(mainImage && !images.includes(mainImage) ? [mainImage] : []),
        ...(product.show3DModel !== false && product.modelUrl ? ['model'] : []),
        ...(product.showVideo !== false && product.videoUrl ? ['video'] : [])
    ];

    // Ensure activeMedia is valid
    useEffect(() => {
        if (!mediaList.includes(activeMedia)) {
            if (mediaList.length > 0) setActiveMedia(mediaList[0]);
        }
    }, [mediaList, activeMedia]);

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
        <div className="min-h-screen bg-white dark:bg-dark-bg pt-4 pb-32 lg:pb-20 animate-in fade-in duration-500 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

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

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    <button onClick={() => router.push('/')} className="hover:text-social-black dark:hover:text-white transition-colors">Home</button>
                    <ChevronRight size={14} className="flex-shrink-0" />
                    <button onClick={() => router.push('/#products')} className="hover:text-social-black dark:hover:text-white transition-colors">3D Models</button>
                    <ChevronRight size={14} className="flex-shrink-0" />
                    <span className="font-medium text-social-black dark:text-white">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-12 gap-0 lg:gap-8 xl:gap-12">

                    <div className="lg:col-span-8 space-y-4 lg:space-y-6">
                        {/* Main Media Viewer */}
                        <div className="bg-black rounded-xl lg:rounded-2xl overflow-hidden shadow-sm aspect-video lg:aspect-[16/9] relative group">
                            {activeMedia === 'model' ? (
                                <SketchfabViewer modelUrl={viewerUrl} />
                            ) : activeMedia === 'video' && product.videoUrl ? (
                                <div className="relative w-full h-full bg-black flex items-center justify-center">
                                    <video
                                        src={product.videoUrl}
                                        controls
                                        className="w-full h-full object-contain"
                                        poster={product.imageUrl} // Use main image as poster
                                    />
                                </div>
                            ) : (
                                <div className="relative w-full h-full bg-black">
                                    <Image
                                        src={activeMedia}
                                        alt={`${product.name} - Premium 3D Model`}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                        className="object-contain"
                                        priority
                                    />

                                    {/* 3D View Overlay Button */}
                                    {product.show3DModel !== false && product.modelUrl && (
                                        <div className="absolute bottom-4 right-4 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMedia('model');
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-105 transition-transform group/btn"
                                            >
                                                <Box className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover/btn:rotate-12 transition-transform" />
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">View in 3D</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Carousel Navigation */}
                            {mediaList.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                        className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 p-2 lg:p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-md z-10 border border-white/10"
                                    >
                                        <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                        className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 p-2 lg:p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-md z-10 border border-white/10"
                                    >
                                        <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Media Gallery Thumbnails */}
                        <div className="w-full max-w-full overflow-hidden mt-4 lg:mt-0 min-w-0">
                            <div className="flex gap-2 lg:gap-3 pb-2 items-center justify-start overflow-x-auto scrollbar-hide max-w-full">
                                {/* Fixed Model Button */}
                                {product.show3DModel !== false && product.modelUrl && (
                                    <div className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20">
                                        <button
                                            onClick={() => setActiveMedia('model')}
                                            className={`w-full h-full rounded-xl overflow-hidden border-2 transition-all ${activeMedia === 'model' ? 'border-social-black dark:border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <div className="w-full h-full bg-gray-100 dark:bg-social-dark-hover flex items-center justify-center text-social-black dark:text-white">
                                                <Box className="w-6 h-6 lg:w-7 lg:h-7" />
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* Video Button */}
                                {product.showVideo !== false && product.videoUrl && (
                                    <div className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20">
                                        <button
                                            onClick={() => setActiveMedia('video')}
                                            className={`w-full h-full rounded-xl overflow-hidden border-2 transition-all ${activeMedia === 'video' ? 'border-social-black dark:border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <div className="w-full h-full bg-gray-100 dark:bg-social-dark-hover flex items-center justify-center text-social-black dark:text-white">
                                                <PlayCircle className="w-6 h-6 lg:w-7 lg:h-7" />
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* Thumbnails */}
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMedia(img)}
                                        className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all ${activeMedia === img ? 'border-social-black dark:border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <div className="relative w-full h-full bg-gray-100 dark:bg-social-dark-hover">
                                            <Image src={img} alt={`${product.name} - View ${idx + 1}`} fill sizes="(max-width: 1024px) 64px, 80px" className="object-cover" />
                                        </div>
                                    </button>
                                ))}

                                {/* Fallback if no images array but imageUrl exists */}
                                {!images.length && mainImage && (
                                    <button
                                        onClick={() => setActiveMedia(mainImage)}
                                        className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all ${activeMedia === mainImage ? 'border-social-black dark:border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <div className="relative w-full h-full bg-gray-100 dark:bg-social-dark-hover">
                                            <Image src={mainImage} alt={`${product.name} - Main View`} fill sizes="(max-width: 1024px) 64px, 80px" className="object-cover" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Mobile-only Title & Info */}
                        <div className="lg:hidden space-y-4 mt-6">
                            <div>
                                <h1 className="text-2xl font-black text-social-black dark:text-white mb-2 leading-tight">{product.name}</h1>
                                <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500">
                                    <span className="bg-gray-100 dark:bg-social-dark-hover text-social-black dark:text-white px-2.5 py-0.5 rounded-full font-bold text-xs uppercase tracking-wider">
                                        {product.category}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star size={14} className="text-black dark:text-white fill-current" />
                                        <span className="font-bold text-social-black dark:text-white">{product.rating || 5.0}</span>
                                        <span className="text-gray-400">({reviews.length} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Price & Cart Actions */}
                            <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border">
                                <div className="flex items-end gap-2 mb-5">
                                    <span className="text-4xl font-black text-social-black dark:text-white tracking-tight">
                                        {formatPrice(product.price, currency)}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            console.log("Add to Cart clicked", product.id);
                                            isPurchased ? handleSecureDownload() : handleAddToCart();
                                        }}
                                        disabled={isDownloading}
                                        className={`w-full font-bold py-3.5 px-6 rounded-full transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${isPurchased
                                            ? 'bg-green-600 text-white shadow-green-500/20'
                                            : 'bg-social-black dark:bg-white text-white dark:text-black shadow-lg'
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
                                            className="w-full font-bold py-3.5 px-6 rounded-full transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 bg-white dark:bg-social-dark-hover text-social-black dark:text-white border border-gray-200 dark:border-dark-border hover:bg-gray-50"
                                        >
                                            <Box className="w-5 h-5" />
                                            Customize in 3D Builder
                                        </button>
                                    )}

                                    <div className="pt-3 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                        <button
                                            onClick={() => toggleWishlist(product.id)}
                                            className={`flex items-center gap-2 transition-colors ${isWishlisted ? 'text-red-500' : 'hover:text-social-black dark:hover:text-white'}`}
                                        >
                                            <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                                            {isWishlisted ? 'Saved' : 'Save'}
                                        </button>
                                        <span className="w-px h-4 bg-gray-200 dark:bg-dark-border"></span>
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 hover:text-social-black dark:hover:text-white transition-colors"
                                        >
                                            <Share2 size={18} /> Share
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Tabs (Description / Reviews) */}
                            <div className="mb-6">
                                <div className="flex items-center gap-6 border-b border-gray-200 dark:border-dark-border mb-4">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`pb-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'description' ? 'border-social-black dark:border-white text-social-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                    >
                                        About this model
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`pb-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-social-black dark:border-white text-social-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                    >
                                        Reviews ({reviews.length})
                                    </button>
                                </div>

                                {activeTab === 'description' ? (
                                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed ${!showFullDescription ? 'line-clamp-4' : ''}`}>
                                            {product.description}
                                        </div>
                                        {product.description.length > 200 && (
                                            <button
                                                onClick={() => setShowFullDescription(!showFullDescription)}
                                                className="text-social-black dark:text-white font-bold text-sm mt-2 hover:underline flex items-center gap-1"
                                            >
                                                {showFullDescription ? 'Show Less' : 'Read Full Description'}
                                            </button>
                                        )}

                                        {/* Feature Badges */}
                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            <div className="p-3 bg-gray-50 dark:bg-social-dark-hover rounded-xl border border-gray-100 dark:border-dark-border">
                                                <div className="flex items-center gap-2 mb-1 text-social-black dark:text-white">
                                                    <ShieldCheck size={18} />
                                                    <h4 className="font-bold text-sm">Verified</h4>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Watertight geometry.</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-social-dark-hover rounded-xl border border-gray-100 dark:border-dark-border">
                                                <div className="flex items-center gap-2 mb-1 text-social-black dark:text-white">
                                                    <Download size={18} />
                                                    <h4 className="font-bold text-sm">Instant</h4>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">STL & OBJ included.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
                                        {/* Reviews List */}
                                        <div className="space-y-6">
                                            {reviews.length === 0 ? (
                                                <div className="text-center py-8 bg-gray-50 dark:bg-social-dark-hover rounded-xl border border-dashed border-gray-200 dark:border-dark-border">
                                                    <p className="text-gray-500 text-sm">No reviews yet.</p>
                                                </div>
                                            ) : (
                                                reviews.map(review => (
                                                    <div key={review.id} className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-social-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs flex-shrink-0">
                                                            {review.userName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-bold text-sm text-social-black dark:text-white truncate">{review.userName}</h4>
                                                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                                    {typeof review.date?.toDate === 'function' ? review.date.toDate().toLocaleDateString() : (typeof review.date === 'string' ? new Date(review.date).toLocaleDateString() : 'Recently')}
                                                                </span>
                                                            </div>
                                                            <div className="flex mb-1.5">
                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                    <Star key={i} size={12} className={i <= review.rating ? "text-black dark:text-white fill-current" : "text-gray-300 dark:text-gray-600"} />
                                                                ))}
                                                            </div>
                                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Mobile Write Review */}
                                        {user ? (
                                            <div className="bg-gray-50 dark:bg-social-dark-hover p-4 rounded-xl border border-gray-100 dark:border-dark-border">
                                                <h3 className="font-bold text-sm text-social-black dark:text-white mb-3">Write a Review</h3>
                                                <form onSubmit={handleSubmitReview}>
                                                    <div className="flex gap-2 mb-3">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                type="button"
                                                                key={star}
                                                                onClick={() => setRating(star)}
                                                                className="focus:outline-none"
                                                            >
                                                                <Star size={20} className={star <= rating ? "text-black dark:text-white fill-current" : "text-gray-300 dark:text-gray-600"} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        value={comment}
                                                        onChange={e => setComment(e.target.value)}
                                                        placeholder="Share your experience..."
                                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white text-sm focus:ring-2 focus:ring-social-black dark:focus:ring-white focus:border-transparent outline-none transition-all mb-3"
                                                        rows={3}
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full bg-social-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? 'Posting...' : 'Post Review'}
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="text-center p-4 bg-gray-50 dark:bg-social-dark-hover rounded-xl">
                                                <p className="text-sm font-bold text-social-black dark:text-white">Sign in to leave a review</p>
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
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'description' ? 'border-social-black dark:border-white text-social-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-social-black dark:border-white text-social-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Reviews ({reviews.length})
                                </button>
                            </div>

                            {activeTab === 'description' ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                        {product.description}
                                    </p>

                                    <div className="grid sm:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-100 dark:border-dark-border">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-social-dark-hover text-social-black dark:text-white rounded-lg">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-social-black dark:text-white">Manifold Verified</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Guaranteed watertight geometry. Ready to slice and print without errors.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-social-dark-hover text-social-black dark:text-white rounded-lg">
                                                <Download size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-social-black dark:text-white">Instant Download</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get your files immediately after purchase. Includes STL and OBJ formats.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        {reviews.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 dark:bg-social-dark-hover rounded-xl border border-dashed border-gray-200 dark:border-dark-border">
                                                <p className="text-gray-500">No reviews yet. Be the first to share your print!</p>
                                            </div>
                                        ) : (
                                            reviews.map(review => (
                                                <div key={review.id} className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-social-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-sm">
                                                        {review.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-bold text-social-black dark:text-white">{review.userName}</h4>
                                                            <span className="text-xs text-gray-400">
                                                                {typeof review.date?.toDate === 'function' ? review.date.toDate().toLocaleDateString() : (typeof review.date === 'string' ? new Date(review.date).toLocaleDateString() : 'Recently')}
                                                            </span>
                                                        </div>
                                                        <div className="flex mb-2">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <Star key={i} size={14} className={i <= review.rating ? "text-black dark:text-white fill-current" : "text-gray-300 dark:text-gray-600"} />
                                                            ))}
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Write Review */}
                                    {user ? (
                                        <div className="bg-gray-50 dark:bg-social-dark-hover p-6 rounded-xl border border-gray-100 dark:border-dark-border">
                                            <h3 className="font-bold text-social-black dark:text-white mb-4">Write a Review</h3>
                                            <form onSubmit={handleSubmitReview}>
                                                <div className="flex gap-2 mb-4">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            onClick={() => setRating(star)}
                                                            className="focus:outline-none hover:scale-110 transition-transform"
                                                        >
                                                            <Star size={24} className={star <= rating ? "text-black dark:text-white fill-current" : "text-gray-300 dark:text-gray-600"} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                    placeholder="How did it print? Share your settings and experience..."
                                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-social-black dark:focus:ring-white focus:border-transparent outline-none transition-all mb-4"
                                                    rows={3}
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-social-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-50"
                                                >
                                                    {isSubmitting ? 'Posting...' : 'Post Review'}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 bg-gray-50 dark:bg-social-dark-hover rounded-xl">
                                            <p className="text-gray-500 mb-2">Want to share your thoughts?</p>
                                            <p className="text-sm font-bold text-social-black dark:text-white">Please sign in to leave a review.</p>
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
                            <div className="hidden lg:block bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-dark-border">
                                <div className="hidden lg:block">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-social-black dark:text-white font-bold text-xs uppercase tracking-widest">
                                            {product.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 dark:bg-social-dark-hover text-social-black dark:text-white px-2 py-0.5 rounded-full">
                                            <ShieldCheck size={12} /> VERIFIED
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-black text-social-black dark:text-white mb-4 leading-tight">{product.name}</h1>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="flex text-black dark:text-white">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} size={16} className={i <= (product.rating || 5) ? "fill-current" : "text-gray-300 dark:text-gray-600"} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">({reviews.length} reviews)</span>
                                    </div>
                                </div>

                                <div className="flex items-end gap-2 mb-8">
                                    <span className="text-5xl font-black text-social-black dark:text-white tracking-tight">
                                        {formatPrice(product.price, currency)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        console.log("Add to Cart clicked (Desktop)", product.id);
                                        isPurchased ? handleSecureDownload() : handleAddToCart();
                                    }}
                                    disabled={isDownloading}
                                    className={`w-full font-bold py-4 px-8 rounded-full transition-all shadow-lg flex items-center justify-center gap-3 group ${isPurchased
                                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/30'
                                        : 'bg-social-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black shadow-lg'
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
                                        className="w-full mt-3 font-bold py-4 px-8 rounded-full transition-all shadow-lg flex items-center justify-center gap-3 bg-white dark:bg-social-dark-hover text-social-black dark:text-white border border-gray-200 dark:border-dark-border hover:bg-gray-50 group"
                                    >
                                        <Box className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Customize in 3D Builder
                                    </button>
                                )}

                                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <button
                                        onClick={() => toggleWishlist(product.id)}
                                        className={`flex items-center gap-2 transition-colors ${isWishlisted ? 'text-red-500' : 'hover:text-social-black dark:hover:text-white'}`}
                                    >
                                        <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                                        {isWishlisted ? 'Saved' : 'Save'}
                                    </button>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 hover:text-social-black dark:hover:text-white transition-colors"
                                    >
                                        <Share2 size={16} /> Share
                                    </button>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                    <ShieldCheck size={16} /> Secure Payment
                                </div>
                            </div>

                            {/* Artist / License Card */}
                            <div className="bg-gray-50 dark:bg-dark-surface/50 rounded-2xl p-6 border border-gray-200 dark:border-dark-border">
                                <h3 className="font-bold text-social-black dark:text-white mb-4 text-sm uppercase tracking-wide">License & Usage</h3>
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <div className="p-0.5 rounded-full bg-green-100 text-green-600 mt-0.5">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                        <span>Personal use only</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="p-0.5 rounded-full bg-green-100 text-green-600 mt-0.5">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                        <span>3D Printing allowed</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="p-0.5 rounded-full bg-red-100 text-red-600 mt-0.5">
                                            <X size={10} strokeWidth={4} />
                                        </div>
                                        <span>No redistribution</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="p-0.5 rounded-full bg-red-100 text-red-600 mt-0.5">
                                            <X size={10} strokeWidth={4} />
                                        </div>
                                        <span>No commercial sales</span>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>

                    {/* Related Products Section */}
                    {(relatedProducts.length > 0 || isLoadingRelated) && (
                        <div className="lg:col-span-12 mt-8 lg:mt-16 border-t border-gray-200 dark:border-dark-border pt-12">
                            <h2 className="text-2xl font-black text-social-black dark:text-white mb-6">You might also like</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                                {isLoadingRelated ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <ProductCardSkeleton key={i} />
                                    ))
                                ) : (
                                    relatedProducts.map((related) => (
                                        <div
                                            key={related.id}
                                            onClick={() => router.push(getProductUrl({ category: related.category, slug: related.slug }))}
                                            className="group cursor-pointer bg-transparent rounded-xl overflow-hidden hover:bg-social-light-hover dark:hover:bg-social-dark-hover transition-all duration-200 flex flex-col h-full"
                                        >
                                            <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 dark:bg-dark-bg mb-2">
                                                <Image
                                                    src={related.imageUrl || '/placeholder.png'}
                                                    alt={related.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {related.price === 0 && (
                                                    <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                        FREE
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-1 pb-2 flex flex-col flex-1">
                                                <h3 className="font-bold text-social-black dark:text-white text-sm line-clamp-2 mb-1">
                                                    {related.name}
                                                </h3>
                                                <div className="mt-auto flex items-center justify-between">
                                                    <span className="text-sm font-medium text-social-black dark:text-gray-300">
                                                        {related.price === 0 ? 'Free' : formatPrice(related.price, currency)}
                                                    </span>
                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="font-medium">{related.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>


        </div>
    );
}
