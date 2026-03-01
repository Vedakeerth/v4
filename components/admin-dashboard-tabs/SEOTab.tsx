"use client";

import React, { useState, useEffect } from "react";
import { Globe, Save } from "lucide-react";
import { type SEOData } from "@/lib/seo";

export default function SEOTab() {
    const [seoData, setSeoData] = useState<SEOData>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSEO();
    }, []);

    const fetchSEO = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/seo");
            const data = await res.json();
            if (data.success) setSeoData(data.seoData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("/api/seo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(seoData),
            });
            if (res.ok) alert("SEO data saved!");
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div className="text-white">Loading SEO settings...</div>;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
                <Globe className="text-cyan-400" size={24} />
                <h2 className="text-xl font-bold text-white">Search Engine Optimization</h2>
            </div>
            <div className="space-y-10">
                {Object.entries(seoData).map(([page, data]) => (
                    <div key={page} className="space-y-4 p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
                        <h3 className="text-sm font-black text-cyan-500 uppercase tracking-widest">{page} Page</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Meta Title</label>
                                <input
                                    value={data.title}
                                    onChange={(e) => {
                                        const next = { ...seoData, [page]: { ...data, title: e.target.value } };
                                        setSeoData(next);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500/50 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Meta Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => {
                                        const next = { ...seoData, [page]: { ...data, description: e.target.value } };
                                        setSeoData(next);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500/50 transition-all outline-none h-20 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-cyan-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                    <Save size={20} />
                    Save All Metadata
                </button>
            </div>
        </div>
    );
}
