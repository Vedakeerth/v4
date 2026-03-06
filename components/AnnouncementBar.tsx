"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone } from "lucide-react";
import Image from "next/image";

interface Announcement {
    id: string;
    text: string;
    imageUrl?: string;
    link?: string;
}

export default function AnnouncementBar() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    useEffect(() => {
        if (announcements.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 5000); // Switch every 5 seconds

        return () => clearInterval(timer);
    }, [announcements]);

    if (announcements.length === 0) return null;

    const current = announcements[currentIndex];

    return (
        <div className="bg-slate-950 border-b border-cyan-500/20 h-10 w-full overflow-hidden relative z-[100] flex items-center">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

            <div className="container mx-auto px-4 h-full relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="h-full flex items-center justify-center"
                    >
                        {current.imageUrl ? (
                            <div className="relative h-8 w-full max-w-[300px]">
                                <Image
                                    src={current.imageUrl}
                                    alt="Announcement"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                                <Megaphone size={14} className="text-cyan-400 shrink-0" />
                                <p className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] italic">
                                    {current.text}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
