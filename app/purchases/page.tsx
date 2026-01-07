'use client';

import React from 'react';
import { UserDashboard } from '../../components/UserDashboard';
import { useStore } from '../../contexts/StoreContext';

export default function PurchasesPage() {
    const { user, purchases, products, wishlist, isLoadingPurchases } = useStore();

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <UserDashboard
                user={user}
                purchases={purchases}
                loading={isLoadingPurchases}
                products={products}
                wishlist={wishlist}
            />
        </div>
    );
}
