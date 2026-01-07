'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ForgotPassword } from '../../components/ForgotPassword';

export default function Page() {
    const router = useRouter();

    return (
        <ForgotPassword onBack={() => router.push('/login')} />
    );
}
