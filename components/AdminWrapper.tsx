'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminPanel } from './AdminPanel';
import { Product } from '../types';

export const AdminWrapper = ({ products }: { products: Product[] }) => {
    const router = useRouter();
    return <AdminPanel products={products} onClose={() => router.push('/')} />;
};
