'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundGrid() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const x = clientX / window.innerWidth;
            const y = clientY / window.innerHeight;

            container.style.setProperty('--mouse-x', `${x}`);
            container.style.setProperty('--mouse-y', `${y}`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
            style={{
                background: `
          linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.03)),
          linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
        `,
                backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                backgroundPosition: '0 0, 0 0, 0 0',
            }}
        >
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    background: 'radial-gradient(circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
                }}
            />
        </div>
    );
}
