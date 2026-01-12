import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import Script from 'next/script';
import ClientLayout from '../components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL('https://freshstl.com'),
    title: {
        default: 'FreshSTL - Premium 3D Models',
        template: '%s | FreshSTL'
    },
    description: 'High quality STL files for 3D printing. Discover our collection of premium 3D models for your next project.',
    keywords: ['3D models', 'STL files', '3D printing', 'premium 3D models', 'digital downloads', 'FreshSTL'],
    authors: [{ name: 'FreshSTL Team' }],
    creator: 'FreshSTL',
    publisher: 'FreshSTL',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'FreshSTL - Premium 3D Models',
        description: 'High quality STL files for 3D printing. Discover our collection of premium 3D models for your next project.',
        url: 'https://freshstl.com',
        siteName: 'FreshSTL',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FreshSTL - Premium 3D Models',
        description: 'High quality STL files for 3D printing',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'google-site-verification-code', // Placeholder
    },
    category: 'technology',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-BLQ4SENSQ2"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());

                      gtag('config', 'G-BLQ4SENSQ2');
                    `}
                </Script>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
