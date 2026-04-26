'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 30, stiffness: 500 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!hasMoved) setHasMoved(true);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('input, textarea, select, .no-cursor')) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
                setIsHovered(!!target.closest('a, button, [role="button"], .cursor-pointer'));
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY, hasMoved]);

    if (typeof window === 'undefined') return null;

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-[99999] hidden lg:block"
            style={{ opacity: hasMoved && !isHidden ? 1 : 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="fixed left-0 top-0 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
            <motion.div
                className="fixed left-0 top-0 rounded-full border border-cyan-500/30"
                animate={{
                    height: isHovered ? 48 : 32,
                    width: isHovered ? 48 : 32,
                    opacity: isHovered ? 1 : 0.5,
                }}
                transition={{
                    type: "spring",
                    damping: 35,
                    stiffness: 400,
                }}
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
        </motion.div>
    );
}
