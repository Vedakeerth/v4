"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, Eye, EyeOff, GripVertical, Loader2, X, Check, Monitor, Layout, ArrowRight, MousePointer2, MoreVertical, Link2, ExternalLink, ChevronDown } from "lucide-react";
import { getSettings, saveSettings, type SiteSettings } from "@/lib/settings";

interface NavLink {
    name: string;
    href: string;
    isActive?: boolean;
}

const DEFAULT_NAV: NavLink[] = [
    { name: "Services", href: "/services" },
    { name: "Catalogue", href: "/catalog" },
    { name: "Blog", href: "/blog" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
    { name: "Track Order", href: "/track-order" },
];

const DEFAULT_FOOTER_QUICK: NavLink[] = [
    { name: "Gallery", href: "/gallery" },
    { name: "Track Your Order", href: "/track-order" },
    { name: "Blog & Updates", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Return & Refund Policy", href: "/refunds" },
];

const DEFAULT_FOOTER_SERVICES: NavLink[] = [
    { name: "FDM Printing", href: "/services#fdm" },
    { name: "SLA Resin", href: "/services#sla" },
    { name: "Product Design", href: "/services#design" },
    { name: "Rapid Prototyping", href: "/services#prototyping" },
];

const SUGGESTED_PATHS = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Catalogue", href: "/catalog" },
    { name: "Blog", href: "/blog" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
    { name: "Track Order", href: "/track-order" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
];

export default function NavigationManager() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingLink, setEditingLink] = useState<{ section: string; index: number | null; data: NavLink } | null>(null);
    const [activeSection, setActiveSection] = useState<"header" | "footer">("header");
    const [openDropdown, setOpenDropdown] = useState<{ section: string, index: number } | null>(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdown(null);
            setIsStatusDropdownOpen(false);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchSettings = async () => {
        const data = await getSettings();
        setSettings(data);
        setIsLoading(false);
    };

    const handleSave = async (updatedSettings: SiteSettings) => {
        setIsSaving(true);
        try {
            await saveSettings(updatedSettings);
            setSettings(updatedSettings);
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleLinkVisibility = (section: keyof SiteSettings, index: number) => {
        if (!settings) return;
        const newSettings = { ...settings };
        const links = [...(newSettings[section] as NavLink[])];
        links[index] = { ...links[index], isActive: links[index].isActive === false ? true : false };
        (newSettings[section] as NavLink[]) = links;
        handleSave(newSettings);
        setOpenDropdown(null);
    };

    const deleteLink = (section: keyof SiteSettings, index: number) => {
        if (!settings) return;
        if (!confirm("Are you sure you want to remove this link?")) return;
        const newSettings = { ...settings };
        const links = [...(newSettings[section] as NavLink[])];
        links.splice(index, 1);
        (newSettings[section] as NavLink[]) = links;
        handleSave(newSettings);
        setOpenDropdown(null);
    };

    const openEditModal = (section: string, index: number | null = null) => {
        const links = (settings?.[section as keyof SiteSettings] as NavLink[]) || [];
        const linkData = index !== null ? links[index] : { name: "", href: "", isActive: true };
        setEditingLink({ section, index, data: { ...linkData, isActive: linkData.isActive !== false } });
        setOpenDropdown(null);
        setIsStatusDropdownOpen(false);
    };

    const saveEdit = () => {
        if (!settings || !editingLink) return;
        const newSettings = { ...settings };
        const sectionKey = editingLink.section as keyof SiteSettings;
        const links = [...((newSettings[sectionKey] as NavLink[]) || [])];

        if (editingLink.index !== null) {
            links[editingLink.index] = editingLink.data;
        } else {
            links.push(editingLink.data);
        }

        (newSettings[sectionKey] as NavLink[]) = links;
        handleSave(newSettings);
        setEditingLink(null);
    };

    const initializeDefaults = (section: keyof SiteSettings, defaults: NavLink[]) => {
        if (!settings) return;
        if (!confirm(`This will populate this section with default links. Existing links for this section will be overwritten. Continue?`)) return;
        const newSettings = { ...settings, [section]: defaults.map(d => ({ ...d, isActive: true })) };
        handleSave(newSettings);
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-cyan-500" /></div>;

    const renderLinkList = (title: string, sectionKey: keyof SiteSettings, description: string, defaults: NavLink[]) => {
        const links = (settings?.[sectionKey] as NavLink[]) || [];
        return (
            <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-8 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight italic">{title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{description}</p>
                    </div>
                    <button
                        onClick={() => openEditModal(sectionKey as string)}
                        className="px-6 py-3 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={14} className="stroke-[3px]" /> Add New Link
                    </button>
                </div>

                <div className="space-y-4">
                    {links.map((link, index) => (
                        <div key={index} className={`flex items-center justify-between p-5 border rounded-2xl transition-all ${link.isActive === false ? "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-800/50" : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30"}`}>
                            <div className="flex items-center gap-5">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={16} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <p className={`font-black text-sm uppercase tracking-tight ${link.isActive === false ? "text-slate-500" : "text-slate-900 dark:text-white"}`}>
                                            {link.name}
                                        </p>
                                        {link.isActive === false && <span className="text-[8px] font-black px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-full tracking-[0.1em] uppercase">Inactive</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1 opacity-70 italic">{link.href}</p>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(openDropdown?.index === index && openDropdown?.section === sectionKey ? null : { section: sectionKey, index });
                                    }}
                                    className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all border border-slate-200 dark:border-transparent hover:border-cyan-500/30"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {openDropdown?.section === sectionKey && openDropdown?.index === index && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <button 
                                            onClick={() => openEditModal(sectionKey as string, index)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800"
                                        >
                                            <Edit size={14} className="text-cyan-500" /> Edit Link
                                        </button>
                                        <button 
                                            onClick={() => toggleLinkVisibility(sectionKey, index)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800"
                                        >
                                            {link.isActive === false ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-orange-500" />}
                                            {link.isActive === false ? "Show Link" : "Hide Link"}
                                        </button>
                                        <button 
                                            onClick={() => deleteLink(sectionKey, index)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={14} /> Remove Link
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {links.length === 0 && (
                        <div className="text-center py-16 border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[2.5rem]">
                            <p className="text-slate-500 text-sm font-medium italic mb-6">This section is currently empty.</p>
                            <button
                                onClick={() => initializeDefaults(sectionKey, defaults)}
                                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                            >
                                Populate Default Links
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        const fullNavLinks = (settings?.navbarLinks) || DEFAULT_NAV;
        const fullFooterLinks = (settings?.footerLinks) || DEFAULT_FOOTER_QUICK;
        const fullFooterServices = (settings?.footerServiceLinks) || DEFAULT_FOOTER_SERVICES;

        return (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 mb-12 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-10 border-b border-slate-200 dark:border-white/5 pb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 text-cyan-500 mb-1">
                            <Layout size={20} className="stroke-[2.5px]" />
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Live Architecture Preview</h3>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Interactive Simulation • Click any link to edit</p>
                    </div>
                </div>

                {activeSection === "header" ? (
                    <div className="bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-50 pointer-events-none" />
                        
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-6 mb-8 relative z-10">
                            <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
                            <div className="hidden md:flex flex-1 justify-center gap-8 px-10">
                                {fullNavLinks.map((l, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => openEditModal('navbarLinks', i)}
                                        className={`text-[10px] font-black uppercase tracking-widest transition-all hover:text-cyan-600 dark:hover:text-cyan-400 group/link relative flex items-center gap-1 ${l.isActive === false ? "text-slate-300 dark:text-slate-700" : "text-slate-800 dark:text-slate-400"}`}
                                    >
                                        {l.name}
                                        <Edit size={8} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                            <div className="w-32 h-10 bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center">
                                <span className="text-[8px] font-black text-cyan-600 dark:text-cyan-500/50 uppercase">CTA Preview</span>
                            </div>
                        </div>
                        
                        <div className="h-48 bg-white dark:bg-slate-900/50 rounded-[1.5rem] flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-white/5 gap-3">
                            <MousePointer2 className="text-cyan-500 animate-bounce" size={24} />
                            <p className="text-slate-900 dark:text-slate-700 text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">Viewport Content Simulation</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[2rem] p-10 backdrop-blur-md relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-6">
                                <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800/80 rounded-xl mb-2" />
                                <div className="w-full h-20 bg-white dark:bg-slate-800/20 rounded-[1.5rem] border border-slate-200 dark:border-white/5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-[0.3em] mb-6 border-b border-cyan-500/30 pb-2 inline-block">Quick Links</h4>
                                <ul className="space-y-3">
                                    {fullFooterLinks.slice(0, 8).map((l, i) => (
                                        <li key={i} className="group/link flex items-center gap-3">
                                            <button 
                                                onClick={() => openEditModal('footerLinks', i)}
                                                className={`text-[9px] font-black uppercase flex items-center gap-3 transition-all hover:text-cyan-600 dark:hover:text-cyan-400 ${l.isActive === false ? "text-slate-300 dark:text-slate-800" : "text-slate-700 dark:text-slate-400"}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full transition-all ${l.isActive === false ? "bg-slate-300 dark:bg-slate-800" : "bg-cyan-500/30 group-hover/link:bg-cyan-500"}`} />
                                                {l.name}
                                                <Edit size={8} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-[0.3em] mb-6 border-b border-cyan-500/30 pb-2 inline-block">Service Index</h4>
                                <ul className="space-y-3">
                                    {fullFooterServices.slice(0, 8).map((l, i) => (
                                        <li key={i} className="group/link flex items-center gap-3">
                                            <button 
                                                onClick={() => openEditModal('footerServiceLinks', i)}
                                                className={`text-[9px] font-black uppercase flex items-center gap-3 transition-all hover:text-cyan-600 dark:hover:text-cyan-400 ${l.isActive === false ? "text-slate-300 dark:text-slate-800" : "text-slate-700 dark:text-slate-400"}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full transition-all ${l.isActive === false ? "bg-slate-300 dark:bg-slate-800" : "bg-cyan-500/30 group-hover/link:bg-cyan-500"}`} />
                                                {l.name}
                                                <Edit size={8} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-20">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 italic tracking-tight uppercase">NAVIGATION <span className="text-cyan-500">LAB</span></h2>
                    <p className="text-slate-500 text-sm max-w-lg font-medium">Manage how users discover your content. Configure headers, footers, and specialized service indexes with live previews.</p>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-2 mb-10 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[1.5rem] w-full sm:w-fit border border-slate-200 dark:border-transparent">
                <button 
                    onClick={() => setActiveSection("header")}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeSection === "header" ? "bg-cyan-500 text-slate-950" : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"}`}
                >
                    <Layout size={16} />
                    Header Settings
                </button>
                <button 
                    onClick={() => setActiveSection("footer")}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeSection === "footer" ? "bg-cyan-500 text-slate-950" : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"}`}
                >
                    <Monitor size={16} />
                    Footer Settings
                </button>
            </div>

            {renderPreview()}

            <div className="animate-in slide-in-from-bottom-6 duration-700">
                {activeSection === "header" ? (
                    renderLinkList("Primary Header Navbar", "navbarLinks", "Configure the global discovery links visible in the top header.", DEFAULT_NAV)
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {renderLinkList("Strategic Quick Links", "footerLinks", "Primary discovery links for the first footer column.", DEFAULT_FOOTER_QUICK)}
                        {renderLinkList("Service Architecture", "footerServiceLinks", "Specialized service index for the second footer column.", DEFAULT_FOOTER_SERVICES)}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingLink && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-[3rem] p-10 sm:p-12 w-full max-w-3xl animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100 dark:border-white/5">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center gap-3">
                                    <Edit className="text-cyan-500" size={28} />
                                    {editingLink.index !== null ? "Modify Link" : "Inject New Link"}
                                </h3>
                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em] mt-2">Target Space: {editingLink.section}</p>
                            </div>
                            <button onClick={() => setEditingLink(null)} className="p-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-transparent">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-cyan-500 transition-colors">Interface Label</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={editingLink.data.name}
                                        onChange={(e) => setEditingLink({ ...editingLink, data: { ...editingLink.data, name: e.target.value } })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-black focus:outline-none focus:border-cyan-500 transition-all text-lg"
                                        placeholder="e.g. Services"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-cyan-500 transition-colors">Digital Path (URL)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editingLink.data.href}
                                            onChange={(e) => setEditingLink({ ...editingLink, data: { ...editingLink.data, href: e.target.value } })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-cyan-600 dark:text-cyan-400 font-mono text-sm outline-none focus:border-cyan-500 transition-all"
                                            placeholder="e.g. /services"
                                        />
                                        <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-700" size={18} />
                                    </div>
                                </div>

                                {/* Visibility Dropdown in Modal */}
                                <div className="group relative">
                                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-cyan-500 transition-colors">Visibility Status</label>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsStatusDropdownOpen(!isStatusDropdownOpen);
                                        }}
                                        className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white transition-all hover:border-cyan-500"
                                    >
                                        <div className="flex items-center gap-3">
                                            {editingLink.data.isActive !== false ? <Eye className="text-cyan-500" size={18} /> : <EyeOff className="text-slate-500" size={18} />}
                                            {editingLink.data.isActive !== false ? "Active / Visible" : "Hidden / Inactive"}
                                        </div>
                                        <ChevronDown size={18} className={`transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isStatusDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button 
                                                onClick={() => {
                                                    setEditingLink({ ...editingLink, data: { ...editingLink.data, isActive: true } });
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-6 py-4 text-xs font-bold transition-all border-b border-slate-100 dark:border-slate-800 ${editingLink.data.isActive !== false ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Eye size={14} /> Active / Visible
                                                </div>
                                                {editingLink.data.isActive !== false && <Check size={14} className="stroke-[3px]" />}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingLink({ ...editingLink, data: { ...editingLink.data, isActive: false } });
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-6 py-4 text-xs font-bold transition-all ${editingLink.data.isActive === false ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <EyeOff size={14} /> Hidden / Inactive
                                                </div>
                                                {editingLink.data.isActive === false && <Check size={14} className="stroke-[3px]" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                                <h4 className="text-[10px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <ExternalLink size={14} /> Quick Select Paths
                                </h4>
                                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {SUGGESTED_PATHS.map((path) => {
                                        const isSelected = editingLink.data.href === path.href;
                                        return (
                                            <button
                                                key={path.href}
                                                onClick={() => setEditingLink({ ...editingLink, data: { ...editingLink.data, name: path.name, href: path.href } })}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group/path border ${isSelected ? "bg-cyan-500 text-slate-950 border-cyan-500" : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-cyan-500"}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isSelected && <Check size={12} className="stroke-[4px]" />}
                                                    {path.name}
                                                </div>
                                                <span className={`text-[8px] opacity-40 ${isSelected ? "text-slate-950" : "group-hover/path:opacity-100"}`}>{path.href}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-10 flex gap-4">
                            <button
                                onClick={saveEdit}
                                disabled={!editingLink.data.name || !editingLink.data.href || isSaving}
                                className="flex-[2] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-6 rounded-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} className="stroke-[4px]" />}
                                {editingLink.index !== null ? "Commit Changes" : "Confirm Injection"}
                            </button>
                            <button
                                onClick={() => setEditingLink(null)}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-black py-6 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] border border-slate-200 dark:border-transparent"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isSaving && !editingLink && (
                <div className="fixed bottom-12 right-12 bg-cyan-500 text-slate-950 px-10 py-5 rounded-full font-black shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-700 border-8 border-slate-950/20 z-50">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="uppercase tracking-[0.3em] text-[10px]">Synchronizing Architecture</span>
                </div>
            )}
        </div>
    );
}
