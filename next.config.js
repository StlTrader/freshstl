/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        turbopack: {
            root: '.',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },
    async rewrites() {
        return [
            {
                source: '/__/auth/:path*',
                destination: 'https://freshstlstore-99511217-ca510.firebaseapp.com/__/auth/:path*',
            },
            {
                source: '/assets/:category/:slug/:type/:filename',
                destination: 'https://firebasestorage.googleapis.com/v0/b/freshstlstore-99511217-ca510.firebasestorage.app/o/products%2F:category%2F:slug%2Fpublic%2F:type%2F:filename?alt=media',
            },
            {
                source: '/assets/:category/:filename',
                destination: 'https://firebasestorage.googleapis.com/v0/b/freshstlstore-99511217-ca510.firebasestorage.app/o/:category%2F:filename?alt=media',
            },
        ];
    },
};

module.exports = nextConfig;
