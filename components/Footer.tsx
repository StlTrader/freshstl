import React from 'react';
import Link from 'next/link';
import { Box, Github, Twitter, Instagram, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (

        <footer className="bg-white dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center group mb-4">
                            <div className="bg-brand-500 p-2 rounded-full mr-3 group-hover:scale-105 transition-transform">
                                <Box className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-social-black dark:text-white">
                                freshstl.com
                            </span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                            Premium 3D models for makers, designers, and hobbyists. Bring your ideas to life with our curated collection of high-quality STL files.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://twitter.com/freshstl"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-social-black dark:hover:text-white transition-colors"
                                aria-label="Follow FreshSTL on Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com/freshstl"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-social-black dark:hover:text-white transition-colors"
                                aria-label="Follow FreshSTL on Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://github.com/freshstl"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-social-black dark:hover:text-white transition-colors"
                                aria-label="Follow FreshSTL on GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-bold text-social-black dark:text-white mb-4">Store</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/#featured" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    Featured
                                </Link>
                            </li>
                            <li>
                                <Link href="/#new-arrivals" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    New Arrivals
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-social-black dark:text-white mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/support" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/license" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    License Info
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-social-black dark:text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    Legal Information
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-social-black dark:hover:text-white transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-dark-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                        © {currentYear} FreshSTL. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>for the 3D printing community</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
