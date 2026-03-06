"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Project } from "@/lib/projects";

export default function ProjectsTab() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        status: "Ongoing",
        date: "",
        client: "",
        image: "",
        images: "",
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/projects");
            const data = await res.json();
            if (data.success) setProjects(data.projects);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: JSON.stringify({
                        file: reader.result,
                        fileName: file.name,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setFormData(prev => ({ ...prev, image: data.url }));
                }
            } catch (error) {
                console.error("Upload failed", error);
            } finally {
                setIsUploading(false);
            }
        };
    };

    const handleSave = async () => {
        try {
            const imagesArray = formData.images
                .split(",")
                .map((img) => img.trim())
                .filter((img) => img.length > 0);

            const payload = {
                ...formData,
                images: imagesArray.length > 0 ? imagesArray : [formData.image],
            };

            const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
            const method = editingProject ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchProjects();
            } else {
                alert("Failed to save project");
            }
        } catch (error) {
            console.error("Error saving project:", error);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            if (res.ok) fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const openModal = (project?: Project) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                title: project.title,
                description: project.description,
                category: project.category,
                status: project.status,
                date: project.date,
                client: project.client || "",
                image: project.image,
                images: project.images.join(", "),
            });
        } else {
            setEditingProject(null);
            setFormData({
                title: "",
                description: "",
                category: "",
                status: "Ongoing",
                date: new Date().toISOString().split("T")[0],
                client: "",
                image: "",
                images: "",
            });
        }
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">My Projects</h2>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                    <Plus size={20} /> Add Project
                </button>
            </div>

            {isLoading ? (
                <div className="text-white">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-all">
                            <div className="relative h-48 bg-slate-800">
                                <Image
                                    src={project.image || "/placeholder.png"}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${project.status === "Completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-white font-bold text-lg mb-1">{project.title}</h3>
                                <p className="text-slate-400 text-xs mb-4 line-clamp-2">{project.description}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(project)}
                                        className="flex-1 py-2 bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-xs font-bold transition-all border border-slate-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="flex-1 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-slate-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                {editingProject ? "Edit Project" : "Add Project"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Title</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Category</label>
                                    <input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 outline-none"
                                    >
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Conceptual">Conceptual</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Cover Image</label>
                                <div className="flex gap-2">
                                    <input
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500/50 outline-none"
                                        placeholder="Image URL"
                                    />
                                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl flex items-center justify-center transition-all">
                                        <Upload size={18} className={isUploading ? "animate-bounce text-cyan-400" : "text-white"} />
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white h-24 focus:border-cyan-500/50 outline-none"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-cyan-500/20 mt-4"
                            >
                                {editingProject ? "Save Changes" : "Create Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
