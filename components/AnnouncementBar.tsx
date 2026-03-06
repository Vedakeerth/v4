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
                    setAnnouncements(data);
                }
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
            }
        };
        fetchAnnouncements();
    }, []);

    useAnimationFrame((t, delta) => {
        if (!containerRef.current || announcements.length === 0) return;

        // Base speed: 100 pixels per second (normal), 30 pixels per second (slow)
        const speed = isHovered ? 30 : 100;
        const moveBy = (speed * delta) / 1000;

        let newX = x.get() - moveBy;

        // Reset when half of the content (the original list) has passed
        const contentWidth = containerRef.current.scrollWidth / 2;
        if (newX <= -contentWidth) {
            newX += contentWidth;
        }

        x.set(newX);
    });

    if (!isVisible || announcements.length === 0) return null;

    // Double the list for seamless loop
    const marqueeList = [...announcements, ...announcements];

    return (
        <div
            className="fixed top-0 left-0 right-0 bg-slate-950 border-b border-cyan-500/20 h-11 w-full overflow-hidden z-[101] flex items-center group/ann"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

            <div className="flex-1 h-full overflow-hidden flex items-center px-4">
                <motion.div
                    ref={containerRef}
                    className="flex items-center gap-32 whitespace-nowrap min-w-max"
                    style={{ x }}
                >
                    {marqueeList.map((ann, idx) => (
                        <div key={`${ann.id}-${idx}`} className="flex items-center gap-6 shrink-0">
                            {ann.imageUrl ? (
                                <div className="relative h-7 w-32 shrink-0">
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
                                    <p className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-[0.3em] italic">
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
