"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

    if (!isVisible || announcements.length === 0) return null;

    // A single item component for consistent styling
    const AnnouncementItem = ({ ann, idx }: { ann: Announcement; idx: number }) => (
        <div key={`${ann.id}-${idx}`} className="flex items-center gap-6 shrink-0 h-full">
            {ann.imageUrl ? (
                <div className="relative h-5 w-24 shrink-0 opacity-80 group-hover/ann:opacity-100 transition-opacity">
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
                    <Megaphone size={14} className="text-cyan-500 shrink-0" />
                    <p className="text-xs font-bold text-slate-200 uppercase tracking-[0.2em] italic group-hover/ann:text-cyan-400 transition-colors">
                        {ann.text}
                    </p>
                </div>
            )}
            {/* The separator dot - crucial for visual spacing */}
            <div className="w-2 h-2 rounded-full bg-cyan-500/20 mx-8 shrink-0" />
        </div>
    );

    // Calculate duration based on content length for consistent speed
    const baseDuration = announcements.length * 10; // 10s per item set roughly
    const duration = isHovered ? baseDuration * 1.5 : baseDuration;

    return (
        <div
            className="fixed top-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/10 h-10 w-full overflow-hidden z-[51] flex items-center group/ann"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

            <div className="flex h-full items-center overflow-hidden">
                <motion.div
                    className="flex items-center whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: duration || 30,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {/* First set */}
                    <div className="flex items-center pr-0">
                        {announcements.map((ann, idx) => (
                            <AnnouncementItem key={`set1-${ann.id}-${idx}`} ann={ann} idx={idx} />
                        ))}
                    </div>
                    {/* Second set (identical) - enables the seamless loop when we reach -50% */}
                    <div className="flex items-center pr-0">
                        {announcements.map((ann, idx) => (
                            <AnnouncementItem key={`set2-${ann.id}-${idx}`} ann={ann} idx={idx} />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
