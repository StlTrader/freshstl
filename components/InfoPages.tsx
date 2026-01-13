import React from 'react';
import { Shield, FileText, HelpCircle, Scale, Mail, CheckCircle, XCircle } from 'lucide-react';

interface PageProps {
  onBack: () => void;
}

const PageLayout: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; onBack: () => void }> = ({ title, icon, children, onBack }) => (
  <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-8 flex items-center gap-4">
      <div className="p-3 bg-social-black dark:bg-white text-white dark:text-black rounded-xl">
        {icon}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">{title}</h1>
    </div>

    <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-dark-border shadow-sm prose dark:prose-invert max-w-none text-gray-600 dark:text-dark-text-secondary">
      {children}
    </div>

    <div className="mt-8 text-center">
      <button
        onClick={onBack}
        className="text-social-black dark:text-white font-medium hover:underline"
      >
        &larr; Return to Store
      </button>
    </div>
  </div>
);

export const TermsPage: React.FC<PageProps> = ({ onBack }) => (
  <PageLayout title="Terms of Service" icon={<FileText size={32} />} onBack={onBack}>
    <h3>1. Acceptance of Terms</h3>
    <p>By accessing and using freshstl.com, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, and others who access or use the Service.</p>

    <h3>2. Digital Products</h3>
    <p>All products sold on freshstl.com are digital files (STL/GLB format) intended for 3D printing. No physical products will be shipped. Access to purchased files is granted immediately upon successful payment.</p>

    <h3>3. Refund Policy</h3>
    <p>Due to the nature of digital goods, <strong>all sales are final</strong>. We do not offer refunds once the files have been downloaded or accessed, except in cases where the file is technically defective and cannot be fixed by our support team.</p>

    <h3>4. User Accounts</h3>
    <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>

    <h3>5. Modifications</h3>
    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>

    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-border text-sm text-gray-500">
      Last Updated: December 2025
    </div>
  </PageLayout>
);

export const PrivacyPage: React.FC<PageProps> = ({ onBack }) => (
  <PageLayout title="Privacy Policy" icon={<Shield size={32} />} onBack={onBack}>
    <h3>1. Information We Collect</h3>
    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This may include:</p>
    <ul className="list-disc pl-6 space-y-2">
      <li>Name and email address</li>
      <li>Transaction history (we do not store full credit card numbers)</li>
      <li>Usage data and download history</li>
    </ul>

    <h3>2. How We Use Your Information</h3>
    <p>We use the information we collect to:</p>
    <ul className="list-disc pl-6 space-y-2">
      <li>Provide, maintain, and improve our services</li>
      <li>Process transactions and send related information</li>
      <li>Send you technical notices, updates, and support messages</li>
    </ul>

    <h3>3. Data Storage</h3>
    <p>We use Google Firebase to securely store your user data and files. By using our service, you acknowledge that your data may be stored on servers located outside of your country of residence.</p>

    <h3>4. Cookies</h3>
    <p>We use local storage and cookies to maintain your login session and shopping cart preferences. You can control cookies through your browser settings.</p>

    <h3>5. Contact Us</h3>
    <p>If you have any questions about this Privacy Policy, please contact us at privacy@freshstl.com.</p>
  </PageLayout>
);

export const LicensePage: React.FC<PageProps> = ({ onBack }) => (
  <PageLayout title="License Agreement" icon={<Scale size={32} />} onBack={onBack}>
    <p className="lead text-lg mb-6">All digital files purchased from freshstl.com are subject to the following standard license agreement.</p>

    <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
        <h4 className="text-green-800 dark:text-green-300 font-bold flex items-center gap-2 mb-4">
          <CheckCircle size={20} /> You Can
        </h4>
        <ul className="space-y-3 text-sm text-green-900 dark:text-green-100">
          <li className="flex gap-2"><span className="text-green-500">•</span> Print the files for personal use unlimited times.</li>
          <li className="flex gap-2"><span className="text-green-500">•</span> Resize or modify the files for your personal projects.</li>
          <li className="flex gap-2"><span className="text-green-500">•</span> Post photos/videos of your prints on social media.</li>
        </ul>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
        <h4 className="text-red-800 dark:text-red-300 font-bold flex items-center gap-2 mb-4">
          <XCircle size={20} /> You Cannot
        </h4>
        <ul className="space-y-3 text-sm text-red-900 dark:text-red-100">
          <li className="flex gap-2"><span className="text-red-500">•</span> Sell, share, or distribute the digital files.</li>
          <li className="flex gap-2"><span className="text-red-500">•</span> Sell physical prints of the models (unless you hold a Commercial Merchant tier).</li>
          <li className="flex gap-2"><span className="text-red-500">•</span> Upload the files to other file-sharing platforms or torrent sites.</li>
        </ul>
      </div>
    </div>

    <h3>Commercial Use</h3>
    <p>This standard license is for <strong>Private Use Only</strong>. If you wish to sell 3D prints of our models, you must subscribe to our Commercial Merchant Tier (coming soon) or contact the individual artist for a separate commercial license.</p>

    <h3>Copyright</h3>
    <p>All designs and digital files remain the intellectual property of freshstl.com and the respective artists. Purchasing a file does not transfer copyright ownership.</p>
  </PageLayout>
);

export const SupportPage: React.FC<PageProps> = ({ onBack }) => (
  <PageLayout title="Support Center" icon={<HelpCircle size={32} />} onBack={onBack}>
    <div className="grid md:grid-cols-2 gap-8 mb-12 not-prose">
      <div className="bg-gray-100 dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border">
        <Mail className="w-8 h-8 text-social-black dark:text-white mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">Email Support</h3>
        <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">Need help with an order or file? Our team usually responds within 24 hours.</p>
        <a href="mailto:support@freshstl.com" className="text-social-black dark:text-white font-bold hover:underline">support@freshstl.com</a>
      </div>
      <div className="bg-gray-50 dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border">
        <FileText className="w-8 h-8 text-gray-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">Documentation</h3>
        <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">Check our printing guides for recommended settings for FDM and SLA printers.</p>
        <button className="text-social-black dark:text-white font-bold hover:underline">View Guides</button>
      </div>
    </div>

    <h3>Frequently Asked Questions</h3>

    <div className="space-y-6 mt-6">
      <div>
        <h4 className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">I didn't receive my download link. What do I do?</h4>
        <p>Check your spam folder first. If it's not there, verify that your transaction was completed in your Dashboard. If problems persist, email us with your Order ID.</p>
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">What software do I need?</h4>
        <p>You will need a Slicer software (like Cura, PrusaSlicer, or Lychee) to prepare the STL files for your 3D printer.</p>
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">Are the models pre-supported?</h4>
        <p>Most of our "Miniature" category items come with both unsupported and pre-supported versions. Check the product description for details.</p>
      </div>
    </div>
  </PageLayout>
);