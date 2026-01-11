import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ProTipCardProps {
    tip: string;
}

export const ProTipCard: React.FC<ProTipCardProps> = ({ tip }) => {
    return (
        <div className="break-inside-avoid rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-100 dark:border-yellow-900/30 p-6 flex flex-col items-center text-center justify-center h-full min-h-[300px] shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-4">
                <Lightbulb size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pro Tip</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {tip}
            </p>
        </div>
    );
};
