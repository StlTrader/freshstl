import React from 'react';
import { adminDb } from '../../../services/firebaseAdmin';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Product, Review } from '../../../types';
import ProductDetails from '../../../components/ProductDetails';
import { AdminEditButton } from '../../../components/AdminEditButton';
import { getCleanImageUrl, getProductUrl, getAbsoluteImageUrl } from '../../../utils/urlHelpers';

interface Props {
    params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, slug } = await params;
    let product: Product | null = null;

    if (adminDb) {
        const snapshot = await adminDb.collection('products').where('slug', '==', slug).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            product = {
                id: doc.id,
                ...data,
            } as Product;
        }
    }

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const isDraft = product.status === 'draft';

    const absoluteImageUrl = getAbsoluteImageUrl(product.imageUrl, product.category);

    return {
        title: `${product.name} | FreshSTL`,
        description: product.description,
        robots: isDraft ? { index: false, follow: false } : { index: true, follow: true },
        alternates: {
            canonical: getProductUrl({ category: product.category, slug: product.slug }),
        },
        openGraph: {
            title: product.name,
            description: product.description,
            images: absoluteImageUrl ? [absoluteImageUrl] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description,
            images: absoluteImageUrl ? [absoluteImageUrl] : [],
        },
    };
}

const serializeTimestamp = (ts: any) => {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
    if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
    return ts;
};

export default async function ProductPage({ params }: Props) {
    const { category, slug } = await params;
    let product: Product | null = null;

    if (adminDb) {
        const snapshot = await adminDb.collection('products').where('slug', '==', slug).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();

            product = {
                id: doc.id,
                ...data,
                createdAt: serializeTimestamp(data.createdAt),
                updatedAt: serializeTimestamp(data.updatedAt),
                lastIndexedAt: serializeTimestamp(data.lastIndexedAt),
            } as Product;

            // Clean URLs
            product.imageUrl = getCleanImageUrl(product.imageUrl, product.category);
            if (product.images) {
                const category = product.category;
                product.images = product.images.map(img => getCleanImageUrl(img, category));
            }
        }
    }

    // Fetch Related Products & Reviews (SSR)
    let relatedProducts: Product[] = [];
    let reviews: Review[] = [];

    if (adminDb && product) {
        try {
            // Related Products
            const relatedSnap = await adminDb.collection('products')
                .where('category', '==', product.category)
                .where('status', '==', 'published')
                .limit(5)
                .get();

            relatedProducts = relatedSnap.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: serializeTimestamp(data.createdAt),
                        updatedAt: serializeTimestamp(data.updatedAt),
                        lastIndexedAt: serializeTimestamp(data.lastIndexedAt),
                        imageUrl: getCleanImageUrl(data.imageUrl, data.category)
                    } as Product;
                })
                .filter(p => p.id !== product!.id)
                .slice(0, 4);

            // Reviews
            const reviewsSnap = await adminDb.collection('reviews')
                .where('productId', '==', product.id)
                .get();

            reviews = reviewsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: serializeTimestamp(data.date)
                } as any;
            }).sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA;
            });

        } catch (error) {
            console.error("Error fetching related data:", error);
        }
    }

    if (!product) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: 'https://freshstl.com'
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: '3D Models',
                        item: 'https://freshstl.com/#products'
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: product.name,
                        item: `https://freshstl.com${getProductUrl({ category: product.category, slug: product.slug })}`
                    }
                ]
            },
            {
                '@type': 'Product',
                name: product.name,
                image: product.images?.map(img => getAbsoluteImageUrl(img, product.category)) || [getAbsoluteImageUrl(product.imageUrl, product.category)],
                description: product.description,
                brand: {
                    '@type': 'Brand',
                    name: 'FreshSTL'
                },
                offers: {
                    '@type': 'Offer',
                    url: `https://freshstl.com${getProductUrl({ category: product.category, slug: product.slug })}`,
                    priceCurrency: 'USD',
                    price: (product.price / 100).toFixed(2),
                    availability: 'https://schema.org/InStock'
                },
                aggregateRating: product.rating ? {
                    '@type': 'AggregateRating',
                    ratingValue: product.rating,
                    reviewCount: product.reviewCount || 1
                } : undefined
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetails
                product={product}
                initialRelatedProducts={relatedProducts}
                initialReviews={reviews}
            />
            <AdminEditButton type="product" id={product.id} />
        </>
    );
}
