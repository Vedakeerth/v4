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
    const [contentWidth, setContentWidth] = useState(0);
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

    useEffect(() => {
        if (containerRef.current && announcements.length > 0) {
            // Measure one complete set of announcements
            // We divide total scrollWidth by the number of repetitions (2 in this case)
            setContentWidth(containerRef.current.scrollWidth / 2);
        }
    }, [announcements]);

    useAnimationFrame((t, delta) => {
        if (!contentWidth || announcements.length === 0) return;

        // Very slow, linear speed as requested
        const speed = isHovered ? 15 : 40;
        const moveBy = (speed * delta) / 1000;

        let newX = x.get() - moveBy;

        // Reset precisely at the end of the first set
        if (newX <= -contentWidth) {
            newX += contentWidth;
        }

        x.set(newX);
    });

    if (!isVisible || announcements.length === 0) return null;

    // We only need 2 copies for a seamless loop if we reset early
    const marqueeList = [...announcements, ...announcements];

    return (
        <div
            className="fixed top-0 left-0 right-0 bg-slate-950/80 backdrop-blur-sm border-b border-cyan-500/10 h-8 w-full overflow-hidden z-[101] flex items-center group/ann"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none opacity-50" />

            <div className="flex-1 h-full overflow-hidden flex items-center">
                <motion.div
                    ref={containerRef}
                    className="flex items-center gap-32 whitespace-nowrap min-w-max px-4"
                    style={{ x }}
                >
                    {marqueeList.map((ann, idx) => (
                        <div key={`${ann.id}-${idx}`} className="flex items-center gap-6 shrink-0">
                            {ann.imageUrl ? (
                                <div className="relative h-4 w-24 shrink-0 opacity-80 group-hover/ann:opacity-100 transition-opacity">
                                    <Image
                                        src={ann.imageUrl}
                                        alt="Announcement"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 shrink-0">
                                    <Megaphone size={12} className="text-cyan-500/50 shrink-0" />
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic group-hover/ann:text-white transition-colors">
                                        {ann.text}
                                    </p>
                                </div>
                            )}
                            {/* Separator */}
                            <div className="w-1 h-1 rounded-full bg-cyan-500/20 mx-4" />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
