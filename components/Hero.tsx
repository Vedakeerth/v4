"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "./Skeleton";
import DecryptText from "./DecryptText";

interface HeroData {
    hero: {
        subtitle: string;
        titleMain: string;
        phrases: string[];
        description: string;
        primaryCta: { text: string; link: string };
        secondaryCta: { text: string; link: string };
    };
}

interface HeroProps {
    content: {
        subtitle: string;
        titleMain: string;
        phrases: string[];
        description: string;
        primaryCta: { text: string; link: string };
        secondaryCta: { text: string; link: string };
    };
}

export default function Hero({ content }: HeroProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);

    const phrases = content?.phrases?.length ? content.phrases : ["On Demand", "Precision", "Innovation", "Excellence"];
    const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);

    const HOLD_MS = 2200;    // how long the phrase is visible
    const BLANK_MS = 350;    // gap between phrases (DecryptText scrambles out)

    useEffect(() => {
        let idx = 0;
        let timer: ReturnType<typeof setTimeout>;

        const cycle = () => {
            // Blank out — DecryptText will scramble-out all chars
            setCurrentPhrase("");
            timer = setTimeout(() => {
                // Show next phrase — DecryptText will scramble-in all chars
                idx = (idx + 1) % phrases.length;
                setCurrentPhrase(phrases[idx]);
                timer = setTimeout(cycle, HOLD_MS);
            }, BLANK_MS);
        };

        // Initial hold, then start cycling
        timer = setTimeout(cycle, HOLD_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (heroRef.current) {
            const rect = heroRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    return (
        <section
            ref={heroRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-background"
        >
            {/* Background Grid Pattern (Static) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Mouse Spotlight */}
            <div
                className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 211, 238, 0.15), transparent 40%)`,
                }}
            />

            <div className="relative z-10 dynamic-container text-center">
                {isLoading ? (
                    <div className="space-y-6">
                        <Skeleton variant="text" width="60%" height={16} className="mx-auto" />
                        <Skeleton variant="text" width="90%" height={80} className="mx-auto" />
                        <Skeleton variant="text" width="80%" height={24} className="mx-auto" />
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                            <Skeleton variant="rounded" width={140} height={48} />
                            <Skeleton variant="rounded" width={120} height={48} />
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-blue-500 font-medium tracking-wide mb-4 uppercase text-sm">{content?.subtitle || "Vaelinsa"}</h2>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                            {content?.titleMain || "Future of Technology"} <br />
                            <span className="inline-block mt-4 pb-4 min-h-[1.2em]">
                                <DecryptText
                                    text={currentPhrase}
                                    scrambleFrames={8}
                                    frameMs={28}
                                    startDelay={2000}
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 animated-gradient-text"
                                />
                            </span>
                        </h1>
                        <p className="text-slate-700 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                            {content?.description || "Providing cutting edge engineering solutions for the next generation."}
                        </p>

                        <div className="flex flex-col gap-4 justify-center items-center w-fit mx-auto">
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch w-full">
                                <Link href="/gallery" className="w-full sm:flex-1">
                                    <button className="w-full group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-8 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                                        <span className="mr-2 relative z-10">Gallery</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
                                        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </button>
                                </Link>

                                <Link href={content?.secondaryCta?.link || "/contact"} className="w-full sm:flex-1">
                                    <button className="w-full whitespace-nowrap inline-flex h-12 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-transparent px-8 font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                                        {content?.secondaryCta?.text || "Contact Us"}
                                    </button>
                                </Link>
                            </div>

                            <div className="w-full flex flex-col items-center">
                                <Link href={content?.primaryCta?.link || "/quote"} className="w-full">
                                    <div className="relative w-full group">
                                        {/* Outer pulsing glow ring */}
                                        <div className="absolute -inset-[3px] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-75 blur-sm animate-pulse group-hover:opacity-100 group-hover:blur-md transition-all duration-500" />

                                        {/* Sparkle particles */}
                                        <div className="absolute -top-2 left-[15%] w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }} />
                                        <div className="absolute -top-2 left-[50%] w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }} />
                                        <div className="absolute -top-2 right-[15%] w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1.6s' }} />
                                        <div className="absolute -bottom-2 left-[30%] w-1 h-1 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.3s' }} />
                                        <div className="absolute -bottom-2 right-[30%] w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '1.5s' }} />

                                        <button
                                            className="relative w-full h-14 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 font-black tracking-widest uppercase text-white dark:text-black text-sm overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-cyan-500/40 shadow-lg shadow-blue-500/30 animate-[breathe_3s_ease-in-out_infinite] focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                            style={{ animationName: 'breathe' }}
                                        >
                                            {/* Shimmer sweep */}
                                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none" />

                                            {/* Moving gradient background */}
                                            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            {/* Content */}
                                            <span className="relative z-10 flex items-center justify-center gap-3 !text-white dark:!text-black">
                                                <span className="text-base !text-white dark:!text-black">{content?.primaryCta?.text || "Get a Quote"}</span>
                                                <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 !text-white dark:!text-black" />
                                            </span>
                                        </button>
                                    </div>
                                </Link>
                                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-3 animate-pulse">
                                    For custom prints of your part
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </section>
    );
}
