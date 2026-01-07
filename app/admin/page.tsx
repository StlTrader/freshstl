import React from 'react';
import { AdminWrapper } from '@/components/AdminWrapper';
import { adminDb } from '@/services/firebaseAdmin';
import { Product } from '@/types';

// Server Component
export default async function AdminPage() {
    let products: Product[] = [];
    try {
        if (adminDb) {
            const snapshot = await adminDb.collection('products').get();
            products = snapshot.docs.map(doc => {
                const data = doc.data();
                const serializeTimestamp = (ts: any) => {
                    if (!ts) return null;
                    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
                    if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
                    return ts;
                };
                return {
                    id: doc.id,
                    ...(data as any),
                    createdAt: serializeTimestamp(data.createdAt),
                    updatedAt: serializeTimestamp(data.updatedAt)
                } as Product;
            });
        }
    } catch (error) {
        console.error("Error fetching products for admin:", error);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <AdminWrapper products={products} />
        </div>
    );
}
