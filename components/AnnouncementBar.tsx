"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { Megaphone } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface Announcement {
    id: string;
    text: string;
    imageUrl?: string;
    link?: string;
}

export default function AnnouncementBar() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isHovered, setIsHovered] = useState(false);
    const pathname = usePathname();
    const x = useMotionValue(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const isVisible = pathname === "/" ||
        pathname === "/gallery" ||
        pathname === "/services" ||
        pathname === "/features" ||
        pathname === "/blog" ||
        pathname === "/contact" ||
        pathname === "/index.html" ||
        pathname === "";

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch("/api/announcements");
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data.announcements || []);
                }
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
            }
        };
        fetchAnnouncements();
    }, []);

    useAnimationFrame((t, delta) => {
        if (!containerRef.current || announcements.length === 0) return;

        // Significantly slower speed as requested
        const speed = isHovered ? 20 : 60;
        const moveBy = (speed * delta) / 1000;

        let newX = x.get() - moveBy;

        // Reset logic: Using 3 repetitions for a cleaner loop
        const setWidth = containerRef.current.scrollWidth / 3;
        if (newX <= -setWidth) {
            newX += setWidth;
        }

        x.set(newX);
    });

    if (!isVisible || announcements.length === 0) return null;

    // Triple the list for a seamless but controlled loop
    const marqueeList = [...announcements, ...announcements, ...announcements];

    return (
        <div
            className="fixed top-20 left-0 right-0 bg-slate-950 border-b border-cyan-500/20 h-10 w-full overflow-hidden z-[40] flex items-center group/ann"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

            <div className="flex-1 h-full overflow-hidden flex items-center">
                <motion.div
                    ref={containerRef}
                    className="flex items-center gap-48 whitespace-nowrap min-w-max"
                    style={{ x }}
                >
                    {marqueeList.map((ann, idx) => (
                        <div key={`${ann.id}-${idx}`} className="flex items-center gap-10 shrink-0">
                            {ann.imageUrl ? (
                                <div className="relative h-6 w-36 shrink-0">
                                    <Image
                                        src={ann.imageUrl}
                                        alt="Announcement"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 shrink-0">
                                    <Megaphone size={14} className="text-cyan-400 shrink-0" />
                                    <p className="text-[10px] sm:text-[12px] font-black text-white uppercase tracking-[0.3em] italic drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                                        {ann.text}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
