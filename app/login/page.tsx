'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '../../components/LoginPage';

export default function Page() {
    const router = useRouter();

    return (
        <LoginPage
            onLoginSuccess={() => router.push('/')}
            onForgotPassword={() => router.push('/forgot-password')}
        />
    );
}
