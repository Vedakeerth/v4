"use client";

import React, { useState, useEffect } from "react";
import { Save, ToggleLeft, ToggleRight, Settings as SettingsIcon, Mail, Phone, MapPin, Link as LinkIcon, Plus, Trash2, Layout, Info } from "lucide-react";
import { SiteSettings } from "@/lib/settings";

export default function SettingsTab() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
        setIsSaving(true);
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
        } finally {
            setIsSaving(false);
        }
    };

    const addLink = (type: 'navbar' | 'footer' | 'service') => {
        if (!settings) return;
        const newLink = { name: "New Link", href: "/" };
        if (type === 'navbar') setSettings({ ...settings, navbarLinks: [...settings.navbarLinks, newLink] });
        if (type === 'footer') setSettings({ ...settings, footerLinks: [...settings.footerLinks, newLink] });
        if (type === 'service') setSettings({ ...settings, footerServiceLinks: [...settings.footerServiceLinks, newLink] });
    };

    const removeLink = (type: 'navbar' | 'footer' | 'service', index: number) => {
        if (!settings) return;
        if (type === 'navbar') {
            const next = [...settings.navbarLinks];
            next.splice(index, 1);
            setSettings({ ...settings, navbarLinks: next });
        }
        if (type === 'footer') {
            const next = [...settings.footerLinks];
            next.splice(index, 1);
            setSettings({ ...settings, footerLinks: next });
        }
        if (type === 'service') {
            const next = [...settings.footerServiceLinks];
            next.splice(index, 1);
            setSettings({ ...settings, footerServiceLinks: next });
        }
    };

    const updateLink = (type: 'navbar' | 'footer' | 'service', index: number, field: 'name' | 'href', value: string) => {
        if (!settings) return;
        if (type === 'navbar') {
            const next = [...settings.navbarLinks];
            next[index] = { ...next[index], [field]: value };
            setSettings({ ...settings, navbarLinks: next });
        }
        if (type === 'footer') {
            const next = [...settings.footerLinks];
            next[index] = { ...next[index], [field]: value };
            setSettings({ ...settings, footerLinks: next });
        }
        if (type === 'service') {
            const next = [...settings.footerServiceLinks];
            next[index] = { ...next[index], [field]: value };
            setSettings({ ...settings, footerServiceLinks: next });
        }
    };

    if (isLoading) return <div className="text-slate-900 dark:text-white p-8">Loading settings...</div>;
    if (!settings) return <div className="text-red-400 p-8">Failed to load settings</div>;

    const Toggle = ({ check, onChange, label }: { check: boolean, onChange: () => void, label: string }) => (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-700 dark:text-slate-300 font-bold text-sm">{label}</span>
            <button
                onClick={onChange}
                className={`transition-colors ${check ? "text-cyan-400" : "text-slate-600"}`}
            >
                {check ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
        <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                <Icon size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase italic tracking-wider">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
            </div>
        </div>
    );

    const LinkEditor = ({ links, type, title }: { links: { name: string, href: string }[], type: 'navbar' | 'footer' | 'service', title: string }) => (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h4>
                <button 
                    onClick={() => addLink(type)}
                    className="p-2 bg-cyan-500/10 text-cyan-500 rounded-lg hover:bg-cyan-500 hover:text-slate-950 transition-all"
                >
                    <Plus size={16} />
                </button>
            </div>
            <div className="space-y-3">
                {links.map((link, idx) => (
                    <div key={idx} className="flex gap-3 items-center group">
                        <input
                            value={link.name}
                            onChange={(e) => updateLink(type, idx, 'name', e.target.value)}
                            placeholder="Label"
                            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500/50"
                        />
                        <input
                            value={link.href}
                            onChange={(e) => updateLink(type, idx, 'href', e.target.value)}
                            placeholder="URL"
                            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-600 dark:text-slate-400 outline-none focus:border-cyan-500/50"
                        />
                        <button 
                            onClick={() => removeLink(type, idx)}
                            className="p-2.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full pb-20">
            <div className="flex justify-between items-center mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <SettingsIcon className="text-cyan-400" size={32} />
                        Global Configuration
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage website content, links, and visibility settings.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/20 hover:scale-[1.05] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs"
                >
                    <Save size={18} />
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="space-y-12">
                {/* Visibility Settings */}
                <section>
                    <SectionHeader icon={Layout} title="Page Visibility" subtitle="Toggle sections on/off across the platform" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Toggle label="Show Testimonials" check={settings.showTestimonials} onChange={() => setSettings({ ...settings, showTestimonials: !settings.showTestimonials })} />
                        <Toggle label="Show Blog" check={settings.showBlog} onChange={() => setSettings({ ...settings, showBlog: !settings.showBlog })} />
                        <Toggle label="Show Catalogs" check={settings.showCatalogs} onChange={() => setSettings({ ...settings, showCatalogs: !settings.showCatalogs })} />
                        <Toggle label="Show Projects" check={settings.showProjects} onChange={() => setSettings({ ...settings, showProjects: !settings.showProjects })} />
                        <Toggle label="Show Machinery" check={settings.showMachinery} onChange={() => setSettings({ ...settings, showMachinery: !settings.showMachinery })} />
                        <Toggle label="Projects on Products Page" check={settings.showProjectsOnProducts} onChange={() => setSettings({ ...settings, showProjectsOnProducts: !settings.showProjectsOnProducts })} />
                    </div>
                </section>

                {/* Contact Information */}
                <section>
                    <SectionHeader icon={Info} title="Contact Information" subtitle="Publicly displayed contact details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    <Mail size={12} className="text-cyan-500" /> Support Email
                                </label>
                                <input
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white font-bold outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    <Phone size={12} className="text-cyan-500" /> Support Phone
                                </label>
                                <input
                                    value={settings.contactPhone}
                                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white font-bold outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                    <MapPin size={12} className="text-cyan-500" /> Office Address
                                </label>
                                <textarea
                                    value={settings.contactAddress}
                                    onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                                    className="w-full h-[124px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white font-bold outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Navigation & Link Management */}
                <section>
                    <SectionHeader icon={LinkIcon} title="Link Management" subtitle="Edit navbar and footer navigation structures" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <LinkEditor type="navbar" links={settings.navbarLinks} title="Main Navigation (Navbar)" />
                        <LinkEditor type="footer" links={settings.footerLinks} title="Quick Links (Footer)" />
                        <div className="lg:col-span-2">
                            <LinkEditor type="service" links={settings.footerServiceLinks} title="Service Links (Footer Column 2)" />
                        </div>
                    </div>
                </section>

                {/* Text Content */}
                <section>
                    <SectionHeader icon={Layout} title="Hero & Branding" subtitle="Main titles and footer about text" />
                    <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Hero Title</label>
                                <input
                                    value={settings.heroTitle}
                                    onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white font-bold outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Hero Subtitle</label>
                                <input
                                    value={settings.heroSubtitle}
                                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white font-bold outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Footer 'About' Text</label>
                            <textarea
                                value={settings.footerAboutText}
                                onChange={(e) => setSettings({ ...settings, footerAboutText: e.target.value })}
                                className="w-full h-24 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white font-bold outline-none focus:border-cyan-500 resize-none"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

