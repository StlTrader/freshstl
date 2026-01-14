'use client';

import React from 'react';
import { StoreProvider } from '../contexts/StoreContext';
import { Navbar } from './Navbar';
import { CartDrawer } from './CartDrawer';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <StoreProvider>
            <div className="min-h-screen transition-colors duration-300">
                {!isAdmin && <Navbar />}
                <CartDrawer />
                <main className={`${isAdmin ? '' : 'pt-4 pb-24'}`}>
                    {children}
                </main>
                {!isAdmin && <Footer />}
                {!isAdmin && <MobileBottomNav />}
            </div>
        </StoreProvider>
    );
}
