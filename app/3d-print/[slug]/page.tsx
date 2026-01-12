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

    return {
        title: `${product.name} | FreshSTL`,
        description: product.description,
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
            } as Product;
        }
    }

    if (!product) {
        notFound();
    }

    return (
        <>
            <ProductDetails product={product} />
            <AdminEditButton type="product" id={product.id} />
        </>
    );
}
