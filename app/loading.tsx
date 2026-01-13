import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        </div>
    );
}
