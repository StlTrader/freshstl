'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminPanel } from './AdminPanel';
import { Product } from '../types';

export const AdminWrapper = ({ products }: { products: Product[] }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialTab = searchParams.get('tab') as any;
    const initialEditId = searchParams.get('editId') || undefined;

    return <AdminPanel
        products={products}
        onClose={() => router.push('/')}
        initialTab={initialTab}
        initialEditId={initialEditId}
    />;
};
