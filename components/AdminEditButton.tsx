'use client';

import React, { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
import { subscribeToAuth, getUserProfile } from '../services/firebaseService';
import Link from 'next/link';

interface AdminEditButtonProps {
    type: 'product' | 'post';
    id: string; // The ID of the item to edit
}

export const AdminEditButton: React.FC<AdminEditButtonProps> = ({ type, id }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToAuth(async (user) => {
            if (user) {
                try {
                    const profile = await getUserProfile(user.uid);
                    if (profile?.role === 'admin') {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (e) {
                    console.error("Error checking admin status:", e);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (!isAdmin) return null;

    return (
        <Link
            href={`/admin?tab=${type === 'product' ? 'products' : 'blog'}&editId=${id}`}
            className="fixed bottom-6 right-6 z-[100] bg-brand-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 transition-all hover:scale-110 flex items-center gap-2 font-bold animate-in fade-in slide-in-from-bottom-4 duration-500"
            title={`Edit this ${type}`}
        >
            <Edit size={24} />
            <span className="hidden md:inline">Edit {type === 'product' ? 'Product' : 'Post'}</span>
        </Link>
    );
};
