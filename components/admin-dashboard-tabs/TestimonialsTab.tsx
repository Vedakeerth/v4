"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Star } from "lucide-react";
import { Testimonial } from "@/lib/testimonials";

export default function TestimonialsTab() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        company: "",
        rating: 5,
        text: "",
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/testimonials");
            const data = await res.json();
            if (data.success) setTestimonials(data.testimonials);
        } catch (error) {
            console.error("Error fetching testimonials:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const url = editingTestimonial ? `/api/testimonials/${editingTestimonial.id}` : "/api/testimonials";
            const method = editingTestimonial ? "PUT" : "POST";

            // Assuming API expects body directly
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchTestimonials();
            } else {
                alert("Failed to save testimonial");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm("Delete this testimonial?")) return;
        try {
            const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
            if (res.ok) fetchTestimonials();
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = (t?: Testimonial) => {
        if (t) {
            setEditingTestimonial(t);
            setFormData({
                name: t.name,
                role: t.role,
                company: t.company,
                rating: t.rating,
                text: t.text,
            });
        } else {
            setEditingTestimonial(null);
            setFormData({
                name: "",
                role: "",
                company: "",
                rating: 5,
                text: "",
            });
        }
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Testimonials</h2>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                    <Plus size={20} /> Add Testimonial
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                    <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-white font-bold">{t.name}</h3>
                                    <p className="text-slate-500 text-xs">{t.role} at {t.company}</p>
                                </div>
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < t.rating ? "currentColor" : "none"} strokeWidth={i < t.rating ? 0 : 2} className={i >= t.rating ? "text-slate-600" : ""} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-6 italic">"{t.text}"</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => openModal(t)}
                                className="flex-1 py-2 bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-xs font-bold transition-all border border-slate-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(t.id)}
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
                                {editingTestimonial ? "Edit" : "New"} Testimonial
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                                />
                                <input
                                    placeholder="Company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-slate-500 text-xs font-bold uppercase ml-1">Rating</label>
                                <div className="flex gap-2 mt-1">
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setFormData({ ...formData, rating: r })}
                                            className={`p-2 rounded-lg ${formData.rating >= r ? "text-yellow-500" : "text-slate-700"}`}
                                        >
                                            <Star fill={formData.rating >= r ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                placeholder="Testimonial text..."
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white h-32 focus:border-cyan-500/50 outline-none resize-none"
                            />
                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-cyan-500/20"
                            >
                                Save Testimonial
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
