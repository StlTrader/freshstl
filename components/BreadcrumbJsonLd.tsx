'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function BreadcrumbJsonLd() {
    const pathname = usePathname();

    // Don't render on home page
    if (pathname === '/') return null;

    const segments = pathname.split('/').filter(Boolean);

    // Generate breadcrumb items
    const itemListElement = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://freshstl.store',
        },
        ...segments.map((segment, index) => {
            const position = index + 2;
            const url = `https://freshstl.store/${segments.slice(0, index + 1).join('/')}`;

            // Format name: replace hyphens with spaces and capitalize
            const name = segment
                .replace(/-/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());

            return {
                '@type': 'ListItem',
                position,
                name,
                item: url,
            };
        }),
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement,
    };

    return (
        <Script
            id="breadcrumb-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
