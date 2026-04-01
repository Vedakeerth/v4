import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import dynamicComponent from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";
import type { Metadata } from "next";

// SSR: Private page, noindexing
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "AI 3D Printing Quote | VAELINSA",
    description: "Get an instant AI-powered cost calculation for your 3D printing project. Professional quality, fast turnaround.",
    robots: "noindex, nofollow", // Private page
};

const QuoteCalculator = dynamicComponent(() => import("@/components/QuoteCalculator"), {
    loading: () => (
        <div className="container mx-auto px-4 py-12">
            <Skeleton variant="rounded" height={600} />
        </div>
    ),
    ssr: false,
});

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <main className="min-h-screen bg-slate-950 pt-24">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase text-white mb-4 tracking-tighter">
                        AI <span className="text-cyan-400">Quote</span> Engine
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                        Personalized Session ID: <span className="text-cyan-500/80 font-mono text-sm">{id}</span>
                    </p>
                </div>
                
                <QuoteCalculator sessionId={id} />
            </div>
            <Footer />
        </main>
    );
}
