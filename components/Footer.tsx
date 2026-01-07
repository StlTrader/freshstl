import React from 'react';
import Link from 'next/link';
import { Box, Github, Twitter, Instagram, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center group mb-4">
                            <div className="bg-gradient-to-tr from-brand-400 to-blue-500 p-2 rounded-lg mr-3 group-hover:scale-105 transition-transform shadow-lg shadow-brand-500/20">
                                <Box className="w-6 h-6 text-white dark:text-dark-bg" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200">
                                freshstl.com
                            </span>
                        </Link>
                        <p className="text-gray-500 dark:text-dark-text-secondary text-sm leading-relaxed mb-4">
                            Premium 3D models for makers, designers, and hobbyists. Bring your ideas to life with our curated collection of high-quality STL files.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4">Store</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/#featured" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    Featured
                                </Link>
                            </li>
                            <li>
                                <Link href="/#new-arrivals" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    New Arrivals
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/support" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/license" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    License Info
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-gray-600 dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-dark-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary text-center md:text-left">
                        © {currentYear} FreshSTL. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>for the 3D printing community</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
