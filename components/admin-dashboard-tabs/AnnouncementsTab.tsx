"use client";

import React, { useState, useEffect, useRef } from "react";
import { Megaphone, Plus, Trash2, Check, Loader2, AlertCircle, ImageIcon as LucideImageIcon, X, UploadCloud, Edit } from "lucide-react";
import { Announcement } from "@/lib/announcements";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import NextImage from "next/image";

export default function AnnouncementsTab() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ text: "", imageUrl: "", active: true, order: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/announcements");
            const data = await res.json();
            if (res.ok) {
                setAnnouncements(data);
            } else {
                setError(data.error || "Failed to fetch announcements");
            }
        } catch (err) {
            setError("Failed to fetch announcements");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadProgress(true);
        try {
            const storageRef = ref(storage, `announcements/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setFormData({ ...formData, imageUrl: downloadURL });
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image");
        } finally {
            setUploadProgress(false);
        }
    };

    const handleEdit = (item: Announcement) => {
        setFormData({
            text: item.text,
            imageUrl: item.imageUrl || "",
            active: item.active,
            order: item.order
        });
        setEditingId(item.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const method = editingId ? "PATCH" : "POST";
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch("/api/admin/announcements", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ text: "", imageUrl: "", active: true, order: announcements.length });
                fetchAnnouncements();
            } else {
                const data = await res.json();
                setError(data.error || "Submit failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchAnnouncements();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    const toggleStatus = async (id: string, active: boolean) => {
        try {
            await fetch("/api/admin/announcements", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, active: !active })
            });
            fetchAnnouncements();
        } catch (err) {
            alert("Failed to toggle status");
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ text: "", imageUrl: "", active: true, order: announcements.length });
    };

    if (isLoading && announcements.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Announcement Bar</h2>
                    <p className="text-slate-400 text-sm">Manage the top scrolling news and festival offers.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                    >
                        <Plus size={18} /> New News
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Announcement Text</label>
                                <input
                                    required
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                                    placeholder="e.g. MEGA DIWALI SALE - UP TO 50% OFF!"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Upload Image (Optional)</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative h-[54px] bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-all flex items-center px-5 group"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    {uploadProgress ? (
                                        <div className="flex items-center gap-3 text-cyan-400 font-bold text-sm">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                                        </div>
                                    ) : formData.imageUrl ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-8 w-12 rounded overflow-hidden bg-slate-800 border border-slate-700">
                                                    <NextImage src={formData.imageUrl} alt="preview" fill className="object-contain" />
                                                </div>
                                                <span className="text-xs text-slate-400 truncate max-w-[150px]">Image Uploaded</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, imageUrl: "" }); }}
                                                className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                                            <UploadCloud size={18} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Click to upload news banner</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition-all uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || uploadProgress}
                                className="px-10 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Update News" : "Save Announcement"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {announcements.map((item) => (
                        <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-4 group hover:border-cyan-500/30 transition-all shadow-lg">
                            <div className="w-20 h-16 bg-slate-900 rounded-lg shrink-0 flex items-center justify-center border border-slate-800 overflow-hidden relative">
                                {item.imageUrl ? (
                                    <NextImage src={item.imageUrl} alt="news" fill className="object-contain" />
                                ) : (
                                    <Megaphone className="text-slate-700" size={24} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <p className="text-white font-bold text-sm line-clamp-2 italic uppercase tracking-wider">{item.text}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            onClick={() => toggleStatus(item.id, item.active)}
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${item.active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                                        >
                                            {item.active ? 'ACTIVE' : 'INACTIVE'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <Megaphone className="mx-auto text-slate-800 mb-3" size={40} />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active announcements</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
