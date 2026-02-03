import React from 'react';
import Link from 'next/link';
import { Scale, Globe, Building, Mail, MapPin } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Legal Information | FreshSTL',
    description: 'Official legal information and mentions for freshstl.com, compliant with Tunisian E-commerce regulations.',
};

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                        <Scale size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">Legal Information</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* English Version */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-10 border border-gray-200 dark:border-dark-border shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-brand-600 dark:text-brand-400 font-bold">
                            <Globe size={20} />
                            <h2 className="text-xl">English Version</h2>
                        </div>

                        <div className="space-y-6 text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                            <section>
                                <h3 className="text-gray-900 dark:text-dark-text-primary font-bold flex items-center gap-2 mb-2">
                                    <Building size={16} className="text-gray-400" /> Site Publisher
                                </h3>
                                <p>
                                    <strong>Name:</strong> Yassine Bouomrine<br />
                                    <strong>Status:</strong> Merchant (Auto-entrepreneur)<br />
                                    <strong>RNE Identifier:</strong> 1905292R<br />
                                    <strong>Activity:</strong> Retail trade via display and markets
                                </p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-dark-text-primary font-bold flex items-center gap-2 mb-2">
                                    <MapPin size={16} className="text-gray-400" /> Registered Address
                                </h3>
                                <p>
                                    Near Abassi St, Bir Lahmar<br />
                                    3212 Tataouine, Tunisia
                                </p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-dark-text-primary font-bold flex items-center gap-2 mb-2">
                                    <Mail size={16} className="text-gray-400" /> Contact
                                </h3>
                                <p>
                                    <strong>Email:</strong> hello@freshstl.com
                                </p>
                            </section>

                            <section className="pt-4 border-t border-gray-100 dark:border-dark-border">
                                <h3 className="text-gray-900 dark:text-dark-text-primary font-bold mb-2">Hosting</h3>
                                <p className="text-sm">
                                    This site is hosted by Google Firebase (Google Cloud).<br />
                                    1600 Amphitheatre Parkway<br />
                                    Mountain View, CA 94043, USA
                                </p>
                            </section>
                        </div>
                    </div>

                    {/* Arabic Version */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-10 border border-gray-200 dark:border-dark-border shadow-sm" dir="rtl">
                        <div className="flex items-center gap-2 mb-6 text-brand-600 dark:text-brand-400 font-bold">
                            <Globe size={20} />
                            <h2 className="text-xl">النسخة العربية</h2>
                        </div>

                        <div className="space-y-6 text-gray-600 dark:text-dark-text-secondary leading-relaxed font-arabic">
                            <section>
                                <h3 className="text-gray-900 dark:text-dark-text-primary font-bold flex items-center gap-2 mb-2">
                                    <Building size={16} className="text-gray-400" /> ناشر الموقع
                                </h3>
                                <p>
                                    <strong>الاسم الكامل:</strong> ياسين بوعمرين<br />
                                    <strong>الصفة القانونية:</strong> تاجر (مبادر ذاتي)<br />
                                    <strong>المعرف الوحيد (RNE):</strong> 1905292R<br />
                                    <strong>النشاط:</strong> تجارة بالتفصيل في أماكن أخرى غير مخصصة للبيع
                                </p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-dark-text-primary font-bold flex items-center gap-2 mb-2">
                                    <MapPin size={16} className="text-gray-400" /> المقر الاجتماعي
                                </h3>
                                <p>
                                    قرب نهج العباسي، بئر الأحمر<br />
                                    3212 تطاوين، تونس
                                </p>
                            </section>

                            <section>
                                <h3 className="text-gray-900 dark:text-dark-text-primary font-bold flex items-center gap-2 mb-2">
                                    <Mail size={16} className="text-gray-400" /> الاتصال
                                </h3>
                                <p>
                                    <strong>البريد الإلكتروني:</strong> hello@freshstl.com
                                </p>
                            </section>

                            <section className="pt-4 border-t border-gray-100 dark:border-dark-border">
                                <h3 className="text-gray-900 dark:text-dark-text-primary font-bold mb-2">الاستضافة</h3>
                                <p className="text-sm">
                                    هذا الموقع مستضاف بواسطة شركة Google Firebase (Google Cloud).<br />
                                    1600 Amphitheatre Parkway<br />
                                    Mountain View, CA 94043, USA
                                </p>
                            </section>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-brand-600 dark:text-brand-400 font-medium hover:underline inline-flex items-center gap-2"
                    >
                        &larr; Return to Store
                    </Link>
                </div>
            </div>
        </div>
    );
}
