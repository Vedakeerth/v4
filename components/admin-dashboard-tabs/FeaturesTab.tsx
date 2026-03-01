"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, ToggleLeft, ToggleRight, LayoutDashboard } from "lucide-react";

export default function FeaturesTab() {
    const [content, setContent] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const AVAILABLE_ICONS = ["Gauge", "Zap", "CheckCircle2", "Scaling", "Activity", "Factory", "Rocket", "Library"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [contentRes, settingsRes] = await Promise.all([
                fetch("/api/pages/why-choose-us"),
                fetch("/api/settings")
            ]);

            const contentData = await contentRes.json();
            const settingsData = await settingsRes.json();

            if (contentData.success) setContent(contentData.content);
            if (settingsData.success) setSettings(settingsData.settings);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await Promise.all([
                fetch("/api/pages/why-choose-us", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(content),
                }),
                fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(settings),
                })
            ]);
            alert("Features page and settings saved!");
        } catch (error) {
            alert("Failed to save changes");
        }
    };

    const updateFeature = (index: number, field: string, value: string) => {
        const newFeat = [...content.features];
        newFeat[index] = { ...newFeat[index], [field]: value };
        setContent({ ...content, features: newFeat });
    };

    if (isLoading) return <div className="text-white">Loading data...</div>;
    if (!content || !settings) return <div className="text-white">Error loading data.</div>;

    return (
        <div className="space-y-10 max-w-5xl">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Features Page Management</h2>
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                    <Save size={20} /> Save Changes
                </button>
            </div>

            {/* Layout Settings Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                    <LayoutDashboard className="text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Page Layout & Sections</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div>
                            <span className="block text-slate-300 font-bold">Show Projects Section</span>
                            <span className="text-xs text-slate-500">Display latest projects block</span>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, showProjectsOnFeatures: !settings.showProjectsOnFeatures })}
                            className={`transition-colors ${settings.showProjectsOnFeatures ? "text-cyan-400" : "text-slate-600"}`}
                        >
                            {settings.showProjectsOnFeatures ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div>
                            <span className="block text-slate-300 font-bold">Show Products Section</span>
                            <span className="text-xs text-slate-500">Display product showcase block</span>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, showProductsOnFeatures: !settings.showProductsOnFeatures })}
                            className={`transition-colors ${settings.showProductsOnFeatures ? "text-cyan-400" : "text-slate-600"}`}
                        >
                            {settings.showProductsOnFeatures ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 opacity-50 cursor-not-allowed" title="Always visible on Features page">
                        <div>
                            <span className="block text-slate-300 font-bold">Show "Why Choose Us"</span>
                            <span className="text-xs text-slate-500">Core features content (Always On)</span>
                        </div>
                        <ToggleRight size={32} className="text-cyan-400" />
                    </div>
                </div>
            </div>

            {/* Content Edit Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-2">"Why Choose Us" Content</h3>

                {/* Header Editors */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Main Heading</label>
                        <div className="flex gap-4">
                            <input
                                value={content.header?.title || ""}
                                onChange={(e) => setContent({ ...content, header: { ...content.header, title: e.target.value } })}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                                placeholder="Prefix"
                            />
                            <input
                                value={content.header?.titleSuffix || ""}
                                onChange={(e) => setContent({ ...content, header: { ...content.header, titleSuffix: e.target.value } })}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                                placeholder="Suffix (Color)"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Description</label>
                        <textarea
                            value={content.header?.description || ""}
                            onChange={(e) => setContent({ ...content, header: { ...content.header, description: e.target.value } })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none h-24 resize-none"
                        />
                    </div>
                </div>

                {/* Features List */}
                <h4 className="text-md font-bold text-white mb-4">Feature Blocks</h4>
                <div className="grid grid-cols-1 gap-6">
                    {content.features?.map((feat: any, i: number) => (
                        <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Icon</label>
                                    <select
                                        value={feat.icon}
                                        onChange={(e) => updateFeature(i, "icon", e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    >
                                        {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Title</label>
                                    <input
                                        value={feat.title}
                                        onChange={(e) => updateFeature(i, "title", e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none font-bold"
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Description</label>
                                    <textarea
                                        value={feat.description}
                                        onChange={(e) => updateFeature(i, "description", e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none resize-none h-20"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
