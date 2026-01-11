'use client';

import React, { useState, useEffect } from 'react';

interface HeroBackgroundProps {
    effect?: 'none' | 'parallax' | 'tilt' | 'glow';
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({ effect = 'none' }) => {
    const [scrollY, setScrollY] = useState(0);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        // Check if we are on mobile to disable parallax
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (effect !== 'parallax' || isMobile) {
            setScrollY(0);
            return;
        }

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrollY(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [effect, isMobile]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent dark:from-dark-bg/80 dark:via-transparent dark:to-transparent" />

            {/* Parallax Orbs - Only render if not mobile to save resources, or just disable animation */}
            <div
                className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand-500/20 rounded-full blur-[60px] md:blur-[100px] opacity-50 transition-transform duration-75 ease-out will-change-transform"
                style={{
                    transform: (effect === 'parallax' && !isMobile) ? `translateY(${scrollY * 0.2}px)` : 'none'
                }}
            />
            <div
                className="absolute bottom-0 left-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-500/20 rounded-full blur-[60px] md:blur-[100px] opacity-30 transition-transform duration-75 ease-out will-change-transform"
                style={{
                    transform: (effect === 'parallax' && !isMobile) ? `translateY(${scrollY * -0.2}px)` : 'none'
                }}
            />
        </div>
    );
};
