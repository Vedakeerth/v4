"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save, Tag, BookOpen, Briefcase, GripVertical, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Catalogue {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;       // hex
    icon?: string;        // emoji
    type: "blog" | "project";
    count?: number;       // auto-computed from live data
}

// ── Preset colors ─────────────────────────────────────────────────────────────
const PALETTE = [
    "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981",
    "#ef4444", "#f97316", "#ec4899", "#3b82f6",
    "#84cc16", "#14b8a6", "#a855f7", "#6366f1",
];

const ICONS = ["📁", "🔬", "🔧", "🏢", "🏆", "🎨", "🌐", "📐", "⚙️", "🚀", "💡", "📊", "🖥️", "📷", "🎯", "🧠"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSlug(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Default form state ────────────────────────────────────────────────────────
const EMPTY: Omit<Catalogue, "id" | "count"> = {
    name: "",
    slug: "",
    description: "",
    color: PALETTE[0],
    icon: "📁",
    type: "blog",
};

export default function CataloguesTab() {
    const [blogsData, setBlogsData] = useState<any[]>([]);
    const [projectsData, setProjectsData] = useState<any[]>([]);
    const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeType, setActiveType] = useState<"blog" | "project">("blog");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Catalogue | null>(null);
    const [form, setForm] = useState<Omit<Catalogue, "id" | "count">>({ ...EMPTY });
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");

    // ── Local storage key ──────────────────────────────────────────────────────
    const STORAGE_KEY = "veda_catalogues_v1";

    // ── Load catalogues from localStorage + live content counts ───────────────
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setIsLoading(true);
        try {
            // Load saved catalogues
            const saved = localStorage.getItem(STORAGE_KEY);
            let cats: Catalogue[] = saved ? JSON.parse(saved) : [];

            // Fetch live content
            const [bRes, pRes] = await Promise.all([
                fetch("/api/blogs"),
                fetch("/api/projects"),
            ]);
            const bData = await bRes.json();
            const pData = await pRes.json();

            const blogs: any[] = bData.success ? bData.blogs : [];
            const projects: any[] = pData.success ? pData.projects : [];
            setBlogsData(blogs);
            setProjectsData(projects);

            // Auto-seed: import any category that exists in live data but not yet in catalogues
            const seedCats = (items: any[], type: "blog" | "project") => {
                const seeded: string[] = [];
                items.forEach((item) => {
                    const name = item.category?.trim();
                    if (!name) return;
                    const already = cats.find(c => c.type === type && c.name.toLowerCase() === name.toLowerCase());
                    if (!already && !seeded.includes(name.toLowerCase())) {
                        cats.push({
                            id: `${type}_${toSlug(name)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                            name,
                            slug: toSlug(name),
                            description: "",
                            color: PALETTE[cats.length % PALETTE.length],
                            icon: type === "blog" ? "📁" : "🔧",
                            type,
                        });
                        seeded.push(name.toLowerCase());
                    }
                });
            };

            seedCats(blogs, "blog");
            seedCats(projects, "project");

            // Compute counts
            cats = cats.map(cat => ({
                ...cat,
                count: (cat.type === "blog" ? blogs : projects).filter(
                    item => item.category?.toLowerCase() === cat.name.toLowerCase()
                ).length,
            }));

            setCatalogues(cats);
            persist(cats);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load catalogues.");
        } finally {
            setIsLoading(false);
        }
    };

    const persist = (cats: Catalogue[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
    };

    // ── CRUD ───────────────────────────────────────────────────────────────────
    const openNew = () => {
        setEditing(null);
        setForm({ ...EMPTY, type: activeType });
        setShowModal(true);
    };

    const openEdit = (cat: Catalogue) => {
        setEditing(cat);
        setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", color: cat.color || PALETTE[0], icon: cat.icon || "📁", type: cat.type });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.name.trim()) { toast.error("Name is required."); return; }
        setIsSaving(true);
        try {
            let next: Catalogue[];
            if (editing) {
                next = catalogues.map(c =>
                    c.id === editing.id ? { ...c, ...form, slug: form.slug || toSlug(form.name) } : c
                );
                toast.success("Catalogue updated!");
            } else {
                const newCat: Catalogue = {
                    id: `${form.type}_${toSlug(form.name)}_${Date.now()}`,
                    ...form,
                    slug: form.slug || toSlug(form.name),
                    count: 0,
                };
                next = [...catalogues, newCat];
                toast.success("Catalogue created!");
            }
            setCatalogues(next);
            persist(next);
            setShowModal(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this catalogue?")) return;
        const next = catalogues.filter(c => c.id !== id);
        setCatalogues(next);
        persist(next);
        toast.success("Deleted.");
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const visible = catalogues
        .filter(c => c.type === activeType)
        .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

    // ── Uncategorised items ────────────────────────────────────────────────────
    const uncat = (activeType === "blog" ? blogsData : projectsData).filter(
        item => !item.category?.trim()
    );

    // ── Editor View ──────────────────────────────────────────────────────────
    if (showModal) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {editing ? "Edit Catalogue" : "New Catalogue"}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {editing ? `Editing /catalogues/${form.slug}` : "Create a new category for your content"}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                            <X size={16} /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50">
                            <Save size={18} /> {isSaving ? "Saving…" : (editing ? "Update" : "Create")}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Col - Main Details */}
                    <div className="space-y-6">
                        {/* Type */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Type</label>
                            <div className="flex gap-2">
                                {(["blog", "project"] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setForm(f => ({ ...f, type: t }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all ${form.type === t ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400"}`}
                                    >
                                        {t === "blog" ? <BookOpen size={16} /> : <Briefcase size={16} />}
                                        {t === "blog" ? "Blog" : "Project"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name & Slug */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Name *</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:border-cyan-500/50 outline-none transition-all"
                                    placeholder="e.g. Technology"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Slug</label>
                                <input
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-sm focus:border-cyan-500/50 outline-none transition-all"
                                    placeholder="auto-generated"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm h-32 focus:border-cyan-500/50 outline-none resize-none transition-all"
                                placeholder="Short description…"
                            />
                        </div>
                    </div>

                    {/* Right Col - Visuals */}
                    <div className="space-y-6">
                        {/* Icon picker */}
                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Catalogue Icon</label>
                            <div className="flex flex-wrap gap-2">
                                {ICONS.map(ic => (
                                    <button
                                        key={ic}
                                        onClick={() => setForm(f => ({ ...f, icon: ic }))}
                                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all border ${form.icon === ic ? "bg-cyan-500/10 border-cyan-500/50 scale-110 shadow-lg shadow-cyan-500/20" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:scale-105"}`}
                                    >{ic}</button>
                                ))}
                            </div>
                        </div>

                        {/* Color picker */}
                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Theme Color</label>
                            <div className="flex flex-wrap gap-2.5">
                                {PALETTE.map(col => (
                                    <button
                                        key={col}
                                        onClick={() => setForm(f => ({ ...f, color: col }))}
                                        className={`w-8 h-8 rounded-full transition-all ${form.color === col ? "scale-125 ring-2 ring-white dark:ring-slate-900 ring-offset-2 shadow-lg" : "hover:scale-110 shadow-sm"}`}
                                        style={{ background: col, boxShadow: form.color === col ? `0 4px 14px 0 ${col}40` : '' }}
                                    />
                                ))}
                                {/* Custom hex */}
                                <label className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors overflow-hidden" title="Custom color">
                                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="opacity-0 absolute w-1 h-1" />
                                    <span className="text-[12px] text-slate-400 font-bold">+</span>
                                </label>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Preview</label>
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner" style={{ background: form.color + "22", border: `2px solid ${form.color}44` }}>
                                    {form.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{form.name || "Catalogue Name"}</h3>
                                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{form.description || "Short description will appear here..."}</p>
                                </div>
                                <div className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: form.color + "1a", color: form.color }}>
                                    0 items
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── List View ────────────────────────────────────────────────────────────
    return (
        <div className="w-full">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Blog's Catalogues</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Manage categories for Blogs & Projects</p>
                </div>
                <button
                    onClick={openNew}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                    <Plus size={18} /> New Catalogue
                </button>
            </div>

            {/* ── Type Switcher ── */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 mb-5 w-fit">
                {(["blog", "project"] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveType(t)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeType === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                    >
                        {t === "blog" ? <BookOpen size={15} /> : <Briefcase size={15} />}
                        {t === "blog" ? "Blog" : "Project"} catalogues
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${activeType === t ? "bg-cyan-500/15 text-cyan-500" : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"}`}>
                            {catalogues.filter(c => c.type === t).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Search ── */}
            <div className="mb-5">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search catalogues…"
                    className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:border-cyan-500/50 outline-none transition-all"
                />
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Total Catalogues", value: catalogues.filter(c => c.type === activeType).length, color: "text-cyan-500" },
                    { label: "Total Items", value: (activeType === "blog" ? blogsData : projectsData).length, color: "text-violet-400" },
                    { label: "Categorised", value: (activeType === "blog" ? blogsData : projectsData).filter(i => i.category?.trim()).length, color: "text-green-400" },
                    { label: "Uncategorised", value: uncat.length, color: "text-amber-400" },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── List ── */}
            {isLoading ? (
                <div className="flex items-center justify-center h-40 text-slate-400">Loading…</div>
            ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <FolderOpen size={40} className="opacity-30" />
                    <p className="text-sm font-medium">No {activeType} catalogues yet.</p>
                    <button onClick={openNew} className="text-cyan-500 text-sm font-bold hover:underline">Create one →</button>
                </div>
            ) : (
                <div className="space-y-2">
                    {visible.map(cat => (
                        <motion.div
                            key={cat.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group flex items-center gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-3.5 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200"
                        >
                            {/* Drag handle (visual only) */}
                            <GripVertical size={16} className="text-slate-300 dark:text-slate-700 flex-shrink-0 cursor-grab" />

                            {/* Color dot + icon */}
                            <div
                                className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-lg shadow-inner"
                                style={{ background: cat.color + "22", border: `1.5px solid ${cat.color}44` }}
                            >
                                {cat.icon}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="text-slate-900 dark:text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <span
                                        className="flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black"
                                        style={{ background: cat.color + "1a", color: cat.color }}
                                    >
                                        {cat.count ?? 0} item{cat.count !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                    <span className="font-mono">/catalogues/{cat.slug}</span>
                                    {cat.description && <span className="truncate max-w-xs">{cat.description}</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-700"
                                    title="Edit"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-700"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ── Uncategorised warning ── */}
            {uncat.length > 0 && (
                <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                    <Tag size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-amber-400 font-bold text-sm">{uncat.length} {activeType}(s) have no category</p>
                        <p className="text-slate-500 text-xs mt-0.5">Go to the {activeType === "blog" ? "Blog" : "Projects"} tab and assign a category to each.</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {uncat.slice(0, 6).map((item, i) => (
                                <span key={i} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    {item.title?.slice(0, 30) || "Untitled"}
                                </span>
                            ))}
                            {uncat.length > 6 && <span className="text-amber-400 text-[10px] font-bold">+{uncat.length - 6} more</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
