import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
    count?: number;
    speed?: number;
    className?: string;
}

export const StarField: React.FC<StarFieldProps> = ({ 
    count = 20, 
    speed: _speed = 0.5,
    className = '' 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const stars: HTMLDivElement[] = [];

        // Create stars
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'absolute rounded-full bg-white';
            star.style.width = `${Math.random() * 2 + 0.5}px`;
            star.style.height = star.style.width;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.opacity = `${Math.random() * 0.8 + 0.2}`;
            star.style.boxShadow = `0 0 ${Math.random() * 4 + 2}px rgba(168, 85, 247, 0.8)`;
            star.style.animation = `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`;
            star.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(star);
            stars.push(star);
        }

        return () => {
            stars.forEach(star => star.remove());
        };
    }, [count]);

    return (
        <>
            <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className}`} />
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </>
    );
};

