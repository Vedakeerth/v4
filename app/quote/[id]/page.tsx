"use client";

import React, { use } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import dynamicComponent from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";

interface PageProps {
    params: Promise<{ id: string }>;
}

const QuoteCalculator = dynamicComponent(() => import("@/components/QuoteCalculator"), {
    loading: () => (
        <div className="dynamic-container py-12">
            <Skeleton variant="rounded" height={600} />
        </div>
    ),
    ssr: false,
});

export default function QuoteDetailPage({ params }: PageProps) {
    const { id } = use(params);

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            <Navbar />
            <div className="dynamic-container py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase text-slate-900 dark:text-white mb-4 tracking-tighter">
                        AI <span className="text-cyan-400">Quote</span> Engine
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        Personalized Session ID: <span className="text-cyan-500/80 font-mono text-sm">{id}</span>
                    </p>
                </div>
                
                <QuoteCalculator sessionId={id} />
            </div>
            <Footer />
        </main>
    );
}

