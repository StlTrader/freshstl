import React from 'react';
import { adminDb } from '../../../services/firebaseAdmin';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Product } from '../../../types';
import ProductDetails from '../../../components/ProductDetails';
import { AdminEditButton } from '../../../components/AdminEditButton';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
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

    return {
        title: `${product.name} | FreshSTL`,
        description: product.description,
        robots: isDraft ? { index: false, follow: false } : { index: true, follow: true },
        alternates: {
            canonical: `/3d-print/${product.slug}`,
        },
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.imageUrl ? [product.imageUrl] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description,
            images: product.imageUrl ? [product.imageUrl] : [],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    let product: Product | null = null;

    if (adminDb) {
        const snapshot = await adminDb.collection('products').where('slug', '==', slug).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();

            const serializeTimestamp = (ts: any) => {
                if (!ts) return null;
                if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
                if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
                return ts;
            };

            product = {
                id: doc.id,
                ...data,
                createdAt: serializeTimestamp(data.createdAt),
                updatedAt: serializeTimestamp(data.updatedAt),
                lastIndexedAt: serializeTimestamp(data.lastIndexedAt),
            } as Product;
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
                        item: `https://freshstl.com/3d-print/${product.slug}`
                    }
                ]
            },
            {
                '@type': 'Product',
                name: product.name,
                image: product.images || [product.imageUrl],
                description: product.description,
                brand: {
                    '@type': 'Brand',
                    name: 'FreshSTL'
                },
                offers: {
                    '@type': 'Offer',
                    url: `https://freshstl.com/3d-print/${product.slug}`,
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
            <ProductDetails product={product} />
            <AdminEditButton type="product" id={product.id} />
        </>
    );
}
