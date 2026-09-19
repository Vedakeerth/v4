"use client";

import React, { useState, useEffect } from "react";
import { Save, Home, Plus, Trash2 } from "lucide-react";

export default function HomeTab() {
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/pages/home");
            const data = await res.json();
            if (data.success) setContent(data.content);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/pages/home", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content),
            });
            const data = await res.json();
            if (data.success) {
                alert("✓ Homepage content synchronized successfully!");
            } else {
                alert("× Synchronization failed: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            alert("× Terminal Error: Failed to communicate with the synchronization node.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-slate-900 dark:text-white p-8">Loading homepage data...</div>;
    if (!content) return <div className="text-slate-900 dark:text-white p-8">Error loading data.</div>;

    const updateNested = (path: string, value: any) => {
        const next = { ...content };
        const keys = path.split('.');
        let current = next;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setContent(next);
    };

    return (
        <div className="space-y-10 w-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Home className="text-cyan-400" size={24} />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Homepage Content</h2>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                >
                    {isSaving ? (
                        <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    {isSaving ? "Syncing..." : "Commit Changes"}
                </button>
            </div>

            {/* Hero Section */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">Hero Section</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Rotating Phrases</label>
                        <div className="space-y-2">
                            {content.hero?.phrases?.map((phrase: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={phrase}
                                        onChange={(e) => {
                                            const next = [...content.hero.phrases];
                                            next[i] = e.target.value;
                                            updateNested('hero.phrases', next);
                                        }}
                                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            const next = content.hero.phrases.filter((_: any, idx: number) => idx !== i);
                                            updateNested('hero.phrases', next);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateNested('hero.phrases', [...(content.hero?.phrases || []), ""])}
                                className="text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1 mt-2"
                            >
                                <Plus size={14} /> Add Phrase
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Hero Description</label>
                        <textarea
                            value={content.hero?.description || ""}
                            onChange={(e) => updateNested('hero.description', e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white h-24 focus:border-cyan-500/50 outline-none resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Popular Parts Header */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">Popular Parts Header</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Title</label>
                        <input
                            value={content.popularParts?.title || ""}
                            onChange={(e) => updateNested('popularParts.title', e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Subtitle</label>
                        <input
                            value={content.popularParts?.subtitle || ""}
                            onChange={(e) => updateNested('popularParts.subtitle', e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Product Showcase Header */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">Product Showcase Header</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Title</label>
                        <input
                            value={content.productShowcase?.title || ""}
                            onChange={(e) => updateNested('productShowcase.title', e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Subtitle</label>
                        <input
                            value={content.productShowcase?.subtitle || ""}
                            onChange={(e) => updateNested('productShowcase.subtitle', e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">CTA Section</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Title</label>
                            <input
                                value={content.ctaSection?.title || ""}
                                onChange={(e) => updateNested('ctaSection.title', e.target.value)}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Subtitle</label>
                            <input
                                value={content.ctaSection?.subtitle || ""}
                                onChange={(e) => updateNested('ctaSection.subtitle', e.target.value)}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Button Text</label>
                            <input
                                value={content.ctaSection?.primaryCta?.text || ""}
                                onChange={(e) => updateNested('ctaSection.primaryCta.text', e.target.value)}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Button Link</label>
                            <input
                                value={content.ctaSection?.primaryCta?.link || ""}
                                onChange={(e) => updateNested('ctaSection.primaryCta.link', e.target.value)}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
