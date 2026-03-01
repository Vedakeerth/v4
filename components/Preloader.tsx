"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [animationError, setAnimationError] = useState(false);
    const pathname = usePathname();
    const previousPathname = useRef<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    useEffect(() => {
        // Show preloader on route change
        if (previousPathname.current !== null && previousPathname.current !== pathname) {
            // eslint-disable-next-line
            setIsLoading(true);
            setIsFading(false);
        }

        previousPathname.current = pathname;

        // Minimum display time to ensure visibility (1.5 seconds)
        const minDisplayTime = 1500;
        const startTime = Date.now();

        const hidePreloader = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);

            timeoutRef.current = setTimeout(() => {
                setIsFading(true);
                // Remove from DOM after fade animation
                setTimeout(() => {
                    setIsLoading(false);
                }, 300);
            }, remainingTime);
        };

        let fallbackTimer: NodeJS.Timeout | null = null;
        let loadHandler: (() => void) | null = null;
        let rafId: number | null = null;

        // Use requestAnimationFrame to wait for next paint
        if (typeof window !== "undefined") {
            rafId = requestAnimationFrame(() => {
                rafId = requestAnimationFrame(() => {
                    // Check if page is ready
                    if (document.readyState === "complete") {
                        hidePreloader();
                    } else {
                        loadHandler = () => {
                            hidePreloader();
                        };

                        window.addEventListener("load", loadHandler);

                        // Fallback: hide after maximum 5 seconds
                        fallbackTimer = setTimeout(() => {
                            setIsFading(true);
                            setTimeout(() => {
                                setIsLoading(false);
                            }, 300);
                        }, 5000);
                    }
                });
            });
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (fallbackTimer) {
                clearTimeout(fallbackTimer);
            }
            if (loadHandler) {
                window.removeEventListener("load", loadHandler);
            }
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [pathname]);

    if (!mounted || !isLoading) return null;

    return (
        <div
            className={`fixed inset-0 bg-slate-950 flex items-center justify-center transition-opacity duration-300 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                width: '100vw',
                height: '100vh',
            }}
        >
            <div className="w-64 h-64 flex items-center justify-center">
                {!animationError ? (
                    <DotLottieReact
                        src="https://lottie.host/8da35493-2a13-410f-af80-b2596423075c/H1weJ8CoXr.lottie"
                        loop
                        autoplay
                        className="w-full h-full"
                        onError={() => setAnimationError(true)}
                    />
                ) : (
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
            </div>
        </div>
    );
}
