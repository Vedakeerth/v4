"use client";

import React, { useState, useEffect } from "react";
import { Save, RefreshCcw, Info, Settings2, Thermometer, Palette, Grid3x3 } from "lucide-react";
import { getQuoteSettings, saveQuoteSettings, type QuoteSettings, DEFAULT_QUOTE_SETTINGS } from "@/lib/quote-settings";

export default function QuoteSettingsTab() {
    const [settings, setSettings] = useState<QuoteSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const data = await getQuoteSettings();
        setSettings(data);
    };

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await saveQuoteSettings(settings);
            setMessage({ type: 'success', text: 'Pricing settings updated successfully!' });
            // Revalidate cache if needed
            await fetch("/api/revalidate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tag: "quote" }),
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm("Are you sure you want to reset all pricing to defaults?")) return;
        setIsResetting(true);
        try {
            setSettings(DEFAULT_QUOTE_SETTINGS);
            await saveQuoteSettings(DEFAULT_QUOTE_SETTINGS);
            setMessage({ type: 'success', text: 'Settings reset to factory defaults.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to reset settings.' });
        } finally {
            setIsResetting(false);
        }
    };

    if (!settings) return <div className="text-white p-8">Loading pricing configuration...</div>;

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="flex justify-between items-center mb-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Settings2 className="text-cyan-400" /> Quote Pricing Engine
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Configure base costs, material properties, and variable multipliers.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        disabled={isResetting}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <RefreshCcw size={16} className={isResetting ? "animate-spin" : ""} /> Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-sm font-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                    >
                        <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} animate-in fade-in slide-in-from-top-2`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-center">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General & Labour */}
                <section className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Info size={14} className="text-cyan-500" /> General & Operations
                    </h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-tighter">Processing/Labour Fee (₹ per order)</label>
                        <input
                            type="number"
                            value={settings.labourCost}
                            onChange={(e) => setSettings({ ...settings, labourCost: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">Fixed cost added to every order for handling and post-processing.</p>
                    </div>
                </section>

                {/* Infill Pattern Multipliers */}
                <section className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Grid3x3 size={14} className="text-cyan-500" /> Infill Pattern Complexity
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(settings.infillPatternMultipliers).map(([pattern, multiplier]) => (
                            <div key={pattern}>
                                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">{pattern}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.05"
                                        value={multiplier}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            infillPatternMultipliers: {
                                                ...settings.infillPatternMultipliers,
                                                [pattern]: parseFloat(e.target.value) || 1.0
                                            }
                                        })}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">x</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Materials Pricing */}
                <section className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Thermometer size={14} className="text-cyan-500" /> Material & Filament Costs
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(settings.materials).map(([mat, data]) => (
                            <div key={mat} className="bg-white dark:bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                <p className="text-cyan-400 font-black mb-3">{mat}</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Cost per KG (₹)</label>
                                        <input
                                            type="number"
                                            value={data.costPerKg}
                                            onChange={(e) => {
                                                const newMaterials = { ...settings.materials };
                                                newMaterials[mat] = { ...data, costPerKg: parseFloat(e.target.value) || 0 };
                                                setSettings({ ...settings, materials: newMaterials });
                                            }}
                                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Density (g/cm³)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.density}
                                            onChange={(e) => {
                                                const newMaterials = { ...settings.materials };
                                                newMaterials[mat] = { ...data, density: parseFloat(e.target.value) || 0 };
                                                setSettings({ ...settings, materials: newMaterials });
                                            }}
                                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Price Multiplier (Machine + Prep)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.multiplier}
                                            onChange={(e) => {
                                                const newMaterials = { ...settings.materials };
                                                newMaterials[mat] = { ...data, multiplier: parseFloat(e.target.value) || 1.0 };
                                                setSettings({ ...settings, materials: newMaterials });
                                            }}
                                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Color Multipliers & Availability */}
                <section className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Palette size={14} className="text-cyan-500" /> Color Specific Surcharges & Availability
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(settings.colors).map(([hex, data]) => {
                            return (
                                <div key={hex} className={`bg-white dark:bg-slate-950/30 p-4 rounded-2xl border transition-all ${data.isAvailable ? 'border-white/5' : 'border-red-500/20 opacity-60'} flex flex-col items-center gap-3`}>
                                    <div className="w-8 h-8 rounded-full border border-white/10 shadow-lg relative" style={{ backgroundColor: hex }}>
                                        {!data.isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                                <div className="w-full h-0.5 bg-red-500 rotate-45 shadow-sm" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center w-full">
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-2">{data.name}</p>
                                        
                                        <div className="space-y-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter text-left">Multiplier</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.multiplier}
                                                        onChange={(e) => {
                                                            const newColors = { ...settings.colors };
                                                            newColors[hex] = { ...data, multiplier: parseFloat(e.target.value) || 1.0 };
                                                            setSettings({ ...settings, colors: newColors });
                                                        }}
                                                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs text-center"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const newColors = { ...settings.colors };
                                                    newColors[hex] = { ...data, isAvailable: !data.isAvailable };
                                                    setSettings({ ...settings, colors: newColors });
                                                }}
                                                className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    data.isAvailable 
                                                    ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500/20' 
                                                    : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                                                }`}
                                            >
                                                {data.isAvailable ? 'Available' : 'Unavailable'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
