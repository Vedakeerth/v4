"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Marquee from "react-fast-marquee";

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
    const [settings, setSettings] = useState({ speed: 50, spacing: 200, showOnPages: "all" });
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
                const [newsRes, settingsRes] = await Promise.all([
                    fetch("/api/announcements"),
                    fetch("/api/settings")
                ]);

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    if (settingsData.success && settingsData.settings?.tickerSettings) {
                        setSettings(settingsData.settings.tickerSettings);
                    }
                }

                if (newsRes.ok) {
                    const data = await newsRes.json();
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

    // Visibility logic based on settings
    const isHomePage = pathname === "/" || pathname === "/index.html" || pathname === "";
    const isVisible = settings.showOnPages === "home" ? isHomePage : (
        isHomePage ||
        pathname === "/gallery" ||
        pathname === "/services" ||
        pathname === "/features" ||
        pathname === "/blog" ||
        pathname === "/contact"
    );

    if (!isVisible || news.length === 0) return null;

    return (
        <div className="ticker-wrapper">
            <Marquee speed={settings.speed} gradient={false} autoFill={true}>
                {news.map((text, i) => (
                    <span key={i} className="ticker-text" style={{ marginRight: `${settings.spacing}px` }}>{text}</span>
                ))}
            </Marquee>
        </div>
    );
}
