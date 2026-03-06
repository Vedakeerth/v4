"use client";

import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";

const QuoteCalculator = dynamic(() => import("@/components/QuoteCalculator"), {
    loading: () => <Skeleton variant="rounded" height={400} />,
    ssr: false,
});

export default function QuotePage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <main className="min-h-screen bg-slate-950 pt-24 flex flex-col justify-center">
            <div className="container mx-auto px-4 py-12">
                {isLoading ? (
                    <div className="text-center mb-12">
                        <Skeleton variant="text" width="60%" height={48} className="mx-auto mb-8" />
                        <Skeleton variant="text" width="80%" height={24} className="mx-auto mb-12" />
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                            <Skeleton variant="rounded" height={400} />
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">AI 3D Printing Quote</h1>
                        <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
                            Upload your STL file to get an AI cost calculation based on your material and quality needs.
                        </p>
                        <QuoteCalculator />
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
