"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Activity, Factory, Rocket, Library, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

// Helper for dynamic icons if needed, though for now we can just use text input or select
const AVAILABLE_ICONS = ["Activity", "Factory", "Rocket", "Library", "CheckCircle2", "Zap", "Gauge", "Scaling"];

export default function IndustriesTab() {
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/pages/industries");
            const data = await res.json();
            if (data.success) setContent(data.content);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("/api/pages/industries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content),
            });
            if (res.ok) alert("Industries content saved!");
        } catch (error) {
            alert("Failed to save content");
        }
    };

    if (isLoading) return <div className="text-white">Loading content...</div>;
    if (!content) return <div className="text-white">Error loading content.</div>;

    const addIndustry = () => {
        const newInd = { icon: "Activity", name: "New Industry", description: "Description here..." };
        setContent({ ...content, industries: [...(content.industries || []), newInd] });
    };

    const removeIndustry = (index: number) => {
        const newInd = [...content.industries];
        newInd.splice(index, 1);
        setContent({ ...content, industries: newInd });
    };

    const updateIndustry = (index: number, field: string, value: string) => {
        const newInd = [...content.industries];
        newInd[index] = { ...newInd[index], [field]: value };
        setContent({ ...content, industries: newInd });
    };

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Industries Page Content</h2>
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                    <Save size={20} /> Save Changes
                </button>
            </div>

            {/* Header Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-2">Page Header</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Title</label>
                        <input
                            value={content.header?.title || ""}
                            onChange={(e) => setContent({ ...content, header: { ...content.header, title: e.target.value } })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Subtitle</label>
                        <input
                            value={content.header?.subtitle || ""}
                            onChange={(e) => setContent({ ...content, header: { ...content.header, subtitle: e.target.value } })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Industries List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-white">Industry Blocks</h3>
                    <button onClick={addIndustry} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm font-bold"><Plus size={16} /> Add Block</button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {content.industries?.map((ind: any, i: number) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative group hover:border-slate-700 transition-all">
                            <button
                                onClick={() => removeIndustry(i)}
                                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Icon</label>
                                    <select
                                        value={ind.icon}
                                        onChange={(e) => updateIndustry(i, "icon", e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white focus:border-cyan-500/50 outline-none text-sm"
                                    >
                                        {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Name</label>
                                    <input
                                        value={ind.name}
                                        onChange={(e) => updateIndustry(i, "name", e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none font-bold"
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Description</label>
                                    <textarea
                                        value={ind.description}
                                        onChange={(e) => updateIndustry(i, "description", e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none resize-none h-24"
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
