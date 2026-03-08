"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "./Skeleton";

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
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initial delay
        const timer = setTimeout(() => { }, 600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoading || !textRef.current) return;

        // Start animation after a brief delay
        const startAnimation = () => {
            let index = 0;

            const animateText = () => {
                // Fade out animation
                setTimeout(() => {
                    if (textRef.current) {
                        textRef.current.classList.add('text-animate-out');
                    }
                }, 0);

                // Change text after scroll out
                setTimeout(() => {
                    const phrases = content?.phrases || ["Innovation", "Precision", "Excellence"];
                    index = (index + 1) % phrases.length;
                    setCurrentPhraseIndex(index);

                    if (textRef.current) {
                        textRef.current.classList.remove('text-animate-out');
                        textRef.current.classList.add('text-animate-in');
                    }
                }, 200);

                // Remove animation class after animation completes
                setTimeout(() => {
                    if (textRef.current) {
                        textRef.current.classList.remove('text-animate-in');
                    }
                }, 400);
            };

            // Initial delay
            const initialDelay = setTimeout(() => {
                animateText();

                // Set up interval for continuous animation
                intervalRef.current = setInterval(() => {
                    animateText();
                }, 2800); // Total cycle: 0.2s out + 0.2s in + 2.4s hold
            }, 1000);

            return () => {
                clearTimeout(initialDelay);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        };

        const cleanup = startAnimation();

        return () => {
            cleanup();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLoading]);

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
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]pointer-events-none" />

            {/* Mouse Spotlight */}
            <div
                className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 211, 238, 0.15), transparent 40%)`,
                }}
            />

            <div className="relative z-10 container mx-auto px-4 text-center">
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
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2">
                            {content?.titleMain || "Future of Technology"} <br />
                            <span
                                ref={textRef}
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 min-w-[300px] mt-4 pb-4 relative animated-gradient-text"
                                style={{
                                    willChange: 'transform, opacity',
                                    transformOrigin: 'center center',
                                    display: 'inline-block',
                                    overflow: 'hidden',
                                    height: '1.2em',
                                    lineHeight: '1.2em'
                                }}
                            >
                                <span style={{ display: 'inline-block' }}>
                                    {(content?.phrases || ["Precision", "Innovation", "Efficiency"])[currentPhraseIndex]}
                                </span>
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                            {content?.description || "Providing cutting edge engineering solutions for the next generation."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href={content?.primaryCta?.link || "/quote"}>
                                <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-8 font-medium text-white transition-all duration-300 hover:bg-blue-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                                    <span className="mr-2">{content?.primaryCta?.text || "Get Started"}</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </button>
                            </Link>

                            <Link href={content?.secondaryCta?.link || "/contact"}>
                                <button className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 bg-transparent px-8 font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                                    {content?.secondaryCta?.text || "Contact Us"}
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </section>
    );
}
