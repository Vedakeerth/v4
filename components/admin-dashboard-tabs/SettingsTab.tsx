"use client";

import React, { useState, useEffect } from "react";
import { Save, ToggleLeft, ToggleRight, Settings as SettingsIcon } from "lucide-react";
import { SiteSettings } from "@/lib/settings";

export default function SettingsTab() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data.success) setSettings(data.settings);
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (data.success) {
                alert("Settings saved successfully!");
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div className="text-white">Loading settings...</div>;
    if (!settings) return <div className="text-red-400">Failed to load settings</div>;

    const Toggle = ({ check, onChange, label }: { check: boolean, onChange: () => void, label: string }) => (
        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-bold">{label}</span>
            <button
                onClick={onChange}
                className={`transition-colors ${check ? "text-cyan-400" : "text-slate-600"}`}
            >
                {check ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <SettingsIcon className="text-cyan-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">General Settings</h2>
                </div>
            </div>

            <div className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Page Visibility</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Toggle
                            label="Show Testimonials Section"
                            check={settings.showTestimonials}
                            onChange={() => setSettings({ ...settings, showTestimonials: !settings.showTestimonials })}
                        />
                        <Toggle
                            label="Show Blog Section"
                            check={settings.showBlog}
                            onChange={() => setSettings({ ...settings, showBlog: !settings.showBlog })}
                        />
                        <Toggle
                            label="Show Catalogs"
                            check={settings.showCatalogs}
                            onChange={() => setSettings({ ...settings, showCatalogs: !settings.showCatalogs })}
                        />
                        <Toggle
                            label="Show Projects Section"
                            check={settings.showProjects}
                            onChange={() => setSettings({ ...settings, showProjects: !settings.showProjects })}
                        />
                        <Toggle
                            label="Show Machinery Section"
                            check={settings.showMachinery}
                            onChange={() => setSettings({ ...settings, showMachinery: !settings.showMachinery })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Machinery Section Settings</h3>
                    <div className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Display Delay (seconds)</label>
                            <input
                                type="number"
                                value={settings.machineryDelay}
                                onChange={(e) => setSettings({ ...settings, machineryDelay: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                                min="0"
                            />
                            <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider ml-1">Wait this many seconds before showing the section on homepage</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Hero Section Content</h3>
                    <div className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Hero Title</label>
                            <input
                                value={settings.heroTitle}
                                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Hero Subtitle</label>
                            <input
                                value={settings.heroSubtitle}
                                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Save size={20} />
                        Save All Settings
                    </div>
                </button>
            </div>
        </div>
    );
}
