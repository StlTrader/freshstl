import React from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '../../../services/firebaseAdmin';
import { Product } from '../../../types';
import ProductDetails from '../../../components/ProductDetails';
import { AdminEditButton } from '../../../components/AdminEditButton';
import { Metadata } from 'next';

export const revalidate = 60;

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Fetch product data on the server by slug
async function getProduct(slug: string): Promise<Product | null> {
    if (!adminDb) {
        console.error("Admin DB not initialized");
        return null;
    }

    if (!slug) {
        console.error("Product Slug is missing");
        return null;
    }

    try {
        const productsRef = adminDb.collection('products');
        const querySnapshot = await productsRef.where('slug', '==', slug).limit(1).get();

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();



            const serializeTimestamp = (ts: any) => {
                if (!ts) return null;
                if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
                if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
                return ts;
            };
            return {
                id: docSnap.id,
                ...(data as any),
                createdAt: serializeTimestamp(data?.createdAt),
                updatedAt: serializeTimestamp(data?.updatedAt),
            } as Product;
        } else {
            console.log(`Product with slug ${slug} not found in Firestore.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching product from Admin DB:", error);
        return null;
    }
}

// Generate Metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: `${product.name} | FreshSTL`,
        description: product.description.substring(0, 160),
        alternates: {
            canonical: `/3d-print/${product.slug}`,
        },
        openGraph: {
            title: product.name,
            description: product.description,
            url: `https://freshstl.com/3d-print/${product.slug}`,
            siteName: 'FreshSTL',
            locale: 'en_US',
            type: 'website',
            images: [
                {
                    url: product.imageUrl,
                    width: 800,
                    height: 600,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description.substring(0, 160),
            images: [product.imageUrl],
        },
    };
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.imageUrl,
        description: product.description,
        offers: {
            '@type': 'Offer',
            price: (product.price / 100).toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
        brand: {
            '@type': 'Brand',
            name: 'FreshSTL',
        },
        ...(product.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount || 1,
            },
        }),
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
