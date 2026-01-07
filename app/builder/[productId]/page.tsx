'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CharacterBuilder } from '../../../components/CharacterBuilder/CharacterBuilder';

interface BuilderPageProps {
    params: Promise<{
        productId: string;
    }>;
}

export default function BuilderPage({ params }: BuilderPageProps) {
    const router = useRouter();
    // Unwrap params using React.use() or await if in async component, 
    // but since this is a client component wrapper, we might need to handle it carefully.
    // Actually, in Next.js 15, params is a Promise.
    // But CharacterBuilder is a client component.
    // Let's make this a client component that unwraps params.

    const { productId } = React.use(params);

    return (
        <CharacterBuilder
            productId={productId}
            onBack={() => router.back()}
        />
    );
}
