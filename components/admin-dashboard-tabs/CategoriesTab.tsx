"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
    id: string;
    name: string;
    description?: string;
    order: number;
}

export default function CategoriesTab() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoriesSettings, setCategoriesSettings] = useState({ speed: 30 });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        order: 0,
    });

    useEffect(() => {
        fetchCategories();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data.success && data.settings?.categoriesSettings) {
                setCategoriesSettings(data.settings.categoriesSettings);
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoriesSettings })
            });
            if (!res.ok) throw new Error("Failed to save settings");
            alert("Settings saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save settings");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (data.success) setCategories(data.categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({ name: "", description: "", order: categories.length });
        setEditingCategory(null);
        setShowModal(true);
    };

    const handleImportDefaults = async () => {
        const defaults = ["Gifts", "Table Decor", "Wall Decals", "Organizers", "3D Prints", "Machine Organizers", "Uncategorized"];
        if (!confirm(`This will add ${defaults.length} default categories. Proceed?`)) return;

        try {
            setIsLoading(true);
            for (const [idx, name] of defaults.entries()) {
                await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, description: `Default ${name} category`, order: idx }),
                });
            }
            fetchCategories();
        } catch (error) {
            console.error("Import failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (cat: Category) => {
        setFormData({ name: cat.name, description: cat.description || "", order: cat.order });
        setEditingCategory(cat);
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const method = editingCategory ? "PUT" : "POST";
            const body = editingCategory ? { id: editingCategory.id, ...formData } : formData;

            const res = await fetch("/api/categories", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowModal(false);
                fetchCategories();
            }
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This might affect products using this category.")) return;
        try {
            await fetch("/api/categories", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            fetchCategories();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-3">
                    <button onClick={handleAdd} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
                        <Plus size={20} /> Add Category
                    </button>
                    {categories.length === 0 && (
                        <button onClick={handleImportDefaults} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition-all">
                            Import Defaults
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Categories Marquee Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Speed</label>
                        <input
                            type="number"
                            value={categoriesSettings.speed}
                            onChange={(e) => setCategoriesSettings({ ...categoriesSettings, speed: parseInt(e.target.value) || 30 })}
                            className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                    >
                        {isSavingSettings ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-white">Loading categories...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl group hover:border-cyan-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Order: {cat.order}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(cat)} className="p-2 bg-slate-800 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-lg transition-all border border-slate-700">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all border border-slate-700">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm line-clamp-2">{cat.description || "No description"}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{editingCategory ? "Edit Category" : "Add Category"}</h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Name</label>
                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Display Order</label>
                                    <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none" />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl">Cancel</button>
                                <button onClick={handleSave} className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                                    <Save size={18} /> Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
