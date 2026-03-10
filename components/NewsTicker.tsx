"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * NewsTicker Component - 3-Block Seamless Loop
 * 
 * Features:
 * - 3-block logic (0 to -33.333% translation) for rock-solid stability.
 * - Bold Italic typography matching user provided image.
 * - Large gaps between items (200px).
 * - Original Background Color (#020b1c).
 * - GPU Accelerated (translate3d) to prevent freezing.
 */
export default function NewsTicker({ initialItems }: { initialItems?: { text: string; link?: string }[] }) {
    const [news, setNews] = useState<string[]>(initialItems?.map(item => item.text) || []);
    const pathname = usePathname();

    const defaultNews = [
        'WELCOME OFFER USE COUPON "WELCOME26" TO AVAIL 26% OFF !',
    ];

    useEffect(() => {
        if (initialItems) {
            setNews(initialItems.map(item => item.text));
            return;
        }

        const fetchNews = async () => {
            try {
                const res = await fetch("/api/announcements");
                if (res.ok) {
                    const data = await res.json();
                    const newsList = data.announcements?.map((a: any) => a.text.toUpperCase()) || [];
                    setNews(newsList.length > 0 ? newsList : defaultNews);
                } else {
                    setNews(defaultNews);
                }
            } catch (err) {
                setNews(defaultNews);
            }
        };
        fetchNews();
    }, [initialItems]);

    // Visibility logic for specific frontend pages
    const isVisible = pathname === "/" ||
        pathname === "/gallery" ||
        pathname === "/services" ||
        pathname === "/features" ||
        pathname === "/blog" ||
        pathname === "/contact" ||
        pathname === "/index.html" ||
        pathname === "";

    if (!isVisible || news.length === 0) return null;

    return (
        <div className="ticker-wrapper">
            <div className="ticker-track">
                {/* 3nd-copy logic for perfect seamless and stable loop */}
                <div className="ticker-content">
                    {news.map((text, i) => (
                        <span key={`a-${i}`}>{text}</span>
                    ))}
                </div>
                <div className="ticker-content">
                    {news.map((text, i) => (
                        <span key={`b-${i}`}>{text}</span>
                    ))}
                </div>
                <div className="ticker-content">
                    {news.map((text, i) => (
                        <span key={`c-${i}`}>{text}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
