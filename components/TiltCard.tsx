'use client';

import React, { useRef, useState, useEffect } from 'react';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    enabled?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', enabled = true }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [isHoverSupported, setIsHoverSupported] = useState(false);

    useEffect(() => {
        // Check if hover is supported (desktop)
        const mediaQuery = window.matchMedia('(hover: hover)');
        setIsHoverSupported(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsHoverSupported(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || !enabled || !isHoverSupported) return;

        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Limit rotation to 10 degrees
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-transform duration-200 ease-out ${className}`}
            style={{
                transform: (enabled && isHoverSupported)
                    ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
                    : 'none'
            }}
        >
            {children}
        </div>
    );
};
