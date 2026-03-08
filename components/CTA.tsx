"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "./Skeleton";

interface CTAData {
    ctaSection: {
        title: string;
        titleHighlight: string;
        description: string;
        buttonText: string;
        buttonLink: string;
    };
}

interface CTAProps {
    content: {
        title: string;
        titleHighlight: string;
        description: string;
        buttonText: string;
        buttonLink: string;
    };
}

export default function CTA({ content }: CTAProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Data provided via props
    }, []);

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 to-indigo-900/40" />
            <div className="absolute inset-0 bg-slate-950/80" />

            <div className="container relative z-10 mx-auto px-4 text-center">
                {isLoading ? (
                    <>
                        <Skeleton variant="text" width="70%" height={48} className="mx-auto mb-6" />
                        <Skeleton variant="text" width="80%" height={24} className="mx-auto mb-10" />
                        <Skeleton variant="rounded" width={200} height={56} className="mx-auto" />
                    </>
                ) : (
                    <>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {(content?.title || "Ready to Start Your Project").replace(content?.titleHighlight || "Project", "")}
                            <span className="text-cyan-400">{content?.titleHighlight || "Project"}</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            {content?.description || "Get high-precision engineering parts delivered with unmatched quality and speed."}
                        </p>
                        <Link href={content?.buttonLink || "/quote"}>
                            <button className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-bold text-slate-900 transition-transform duration-200 hover:scale-105 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900">
                                {content?.buttonText || "Get a Quote"}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </section>
    );
}
