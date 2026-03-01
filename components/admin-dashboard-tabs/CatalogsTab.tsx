"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, BookOpen, ToggleLeft, ToggleRight } from "lucide-react";
import { Catalog } from "@/lib/catalogs";

export default function CatalogsTab() {
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true,
    });

    useEffect(() => {
        fetchCatalogs();
    }, []);

    const fetchCatalogs = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/catalogs");
            const data = await res.json();
            if (data.success) setCatalogs(data.catalogs);
        } catch (error) {
            console.error("Error fetching catalogs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const url = editingCatalog ? `/api/catalogs/${editingCatalog.id}` : "/api/catalogs";
            const method = editingCatalog ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchCatalogs();
            } else {
                alert("Failed to save catalog");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this catalog?")) return;
        try {
            const res = await fetch(`/api/catalogs/${id}`, { method: "DELETE" });
            if (res.ok) fetchCatalogs();
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = (c?: Catalog) => {
        if (c) {
            setEditingCatalog(c);
            setFormData({
                name: c.name,
                description: c.description,
                isActive: c.isActive,
            });
        } else {
            setEditingCatalog(null);
            setFormData({
                name: "",
                description: "",
                isActive: true,
            });
        }
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Product Catalogs</h2>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                    <Plus size={20} /> New Catalog
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogs.map((c) => (
                    <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-800 rounded-xl text-cyan-400">
                                <BookOpen size={24} />
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${c.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                                {c.isActive ? "Active" : "Inactive"}
                            </div>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">{c.name}</h3>
                        <p className="text-slate-400 text-sm mb-6 h-10 line-clamp-2">{c.description}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => openModal(c)}
                                className="flex-1 py-2 bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-xs font-bold transition-all border border-slate-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="flex-1 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-slate-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingCatalog ? "Edit" : "New"} Catalog
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                placeholder="Catalog Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                            />
                            <textarea
                                placeholder="Description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white h-32 focus:border-cyan-500/50 outline-none resize-none"
                            />

                            <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`transition-colors ${formData.isActive ? "text-cyan-400" : "text-slate-600"}`}
                                >
                                    {formData.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                                <span className="text-slate-400 text-sm font-bold">
                                    {formData.isActive ? "Catalog is Active" : "Catalog is Hidden"}
                                </span>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-cyan-500/20"
                            >
                                Save Catalog
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
