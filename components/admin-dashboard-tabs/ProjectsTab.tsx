"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Upload, ArrowLeft, BookOpen, LayoutList, LayoutGrid, FileText, Save } from "lucide-react";
import Image from "next/image";
import { Project } from "@/types";
import { toast } from 'sonner';
import RichTextEditor from "@/components/RichTextEditor";

// ── Built-in project templates ────────────────────────────────────────────────
const PROJECT_TEMPLATES = [
    {
        id: "product-build",
        label: "Product Build",
        icon: "🔧",
        category: "Engineering",
        status: "Ongoing",
        content: `<h2>Project Overview</h2><p>Describe what you are building and why.</p><h2>Goals & Requirements</h2><ul><li>Goal 1</li><li>Goal 2</li></ul><h2>Design & Architecture</h2><p>Explain the design decisions and architecture.</p><h2>Progress</h2><p>Document the current state and milestones.</p><h2>Next Steps</h2><p>Outline what still needs to be done.</p>`,
    },
    {
        id: "research",
        label: "R&D / Research",
        icon: "🔬",
        category: "Research",
        status: "Ongoing",
        content: `<h2>Research Question</h2><p>What question are you trying to answer?</p><h2>Methodology</h2><p>Describe the approach you are taking.</p><h2>Findings</h2><ul><li>Finding 1</li><li>Finding 2</li></ul><h2>Conclusions</h2><p>What can be concluded from the research so far?</p>`,
    },
    {
        id: "client-project",
        label: "Client Project",
        icon: "🏢",
        category: "Client Work",
        status: "Ongoing",
        content: `<h2>Client Brief</h2><p>Summary of the client's requirements.</p><h2>Our Approach</h2><p>How we are solving the brief.</p><h2>Key Deliverables</h2><ul><li>Deliverable 1</li><li>Deliverable 2</li></ul><h2>Timeline</h2><p>Milestones and expected completion dates.</p><h2>Outcome</h2><p>Results and client feedback once complete.</p>`,
    },
    {
        id: "showcase",
        label: "Completed Showcase",
        icon: "🏆",
        category: "Showcase",
        status: "Completed",
        content: `<h2>What We Built</h2><p>Brief description of the completed project.</p><h2>The Challenge</h2><p>What problem did this solve?</p><h2>The Solution</h2><p>How we solved it.</p><h2>Key Features</h2><ul><li>Feature 1</li><li>Feature 2</li></ul><h2>Impact & Results</h2><p>Measurable outcomes and impact.</p>`,
    },
];

export default function ProjectsTab() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isSavingAsBlog, setIsSavingAsBlog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [filterCat, setFilterCat] = useState("All");

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

    // Derived category list from existing projects
    const allCategories = ["All", ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];
    const categoryOptions = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    const filtered = filterCat === "All" ? projects : projects.filter(p => p.category === filterCat);

    useEffect(() => { fetchProjects(); }, []);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'image' | 'images') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);
        setUploadProgress(0);
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const formDataPayload = new FormData();
                formDataPayload.append('file', file);
                const projectId = editingProject ? editingProject.id : `proj_${Date.now()}`;
                formDataPayload.append('quotationID', projectId);
                formDataPayload.append('rootFolder', 'projects');
                const responseData: any = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/upload-to-mega', true);
                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            setUploadProgress(Math.round(((i / files.length) + (event.loaded / event.total) * (1 / files.length)) * 100));
                        }
                    };
                    xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error('Invalid response')); } } else { reject(new Error(`Upload failed: ${xhr.status}`)); } };
                    xhr.onerror = () => reject(new Error('Network Error'));
                    xhr.send(formDataPayload);
                });
                if (responseData.success) uploadedUrls.push(responseData.data.url);
            } catch (error) { console.error('Upload failed', error); }
        }
        if (uploadedUrls.length > 0) {
            setFormData(prev => {
                const next = { ...prev };
                if (targetField === 'image') {
                    next.image = uploadedUrls[0];
                } else {
                    const cur = prev.images ? prev.images.split(',').map(i => i.trim()).filter(Boolean) : [];
                    next.images = [...cur, ...uploadedUrls].join(', ');
                }
                return next;
            });
            toast.success(`Uploaded ${uploadedUrls.length} file(s)!`);
        } else { toast.error("Upload failed."); }
        setIsUploading(false);
        setUploadProgress(0);
        e.target.value = '';
    };

    const handleSave = async (saveAsDraft = false) => {
        if (!formData.title.trim()) { toast.error("Please add a title."); return; }
        setIsSaving(true);
        try {
            const imagesArray = formData.images.split(",").map(img => img.trim()).filter(img => img.length > 0);
            const payload = {
                ...formData,
                status: saveAsDraft ? "Draft" : formData.status,
                images: imagesArray.length > 0 ? imagesArray : [formData.image],
            };
            const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
            const method = editingProject ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.success) {
                toast.success(saveAsDraft ? "Saved as Draft!" : (editingProject ? "Project updated!" : "Project created!"));
                setShowModal(false);
                fetchProjects();
            } else { toast.error("Failed to save project"); }
        } catch (error) {
            console.error("Error saving project:", error);
            toast.error("An error occurred.");
        } finally { setIsSaving(false); }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Project deleted."); fetchProjects(); }
        } catch (error) { console.error("Error deleting project:", error); }
    };

    const handleSaveAsBlog = async () => {
        if (!formData.title) { toast.error("Please add a title first."); return; }
        setIsSavingAsBlog(true);
        try {
            const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const payload = {
                id: `blog_${Date.now()}`, slug,
                title: formData.title, content: formData.description,
                excerpt: formData.description.replace(/<[^>]*>/g, '').slice(0, 160),
                image: formData.image, category: formData.category || "Projects",
                author: "Admin", date: formData.date || new Date().toISOString().split('T')[0],
                readTime: `${Math.ceil(formData.description.split(' ').length / 200)} min read`,
                likes: 0, reads: 0, comments: [],
                hashtags: [formData.category].filter(Boolean),
                metaTitle: formData.title,
                metaDescription: formData.description.replace(/<[^>]*>/g, '').slice(0, 160),
                status: "Published",
            };
            const res = await fetch("/api/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.success) { toast.success("Saved as Blog post!"); } else { toast.error("Failed to save as blog."); }
        } catch (err) { console.error(err); toast.error("An error occurred."); } finally { setIsSavingAsBlog(false); }
    };

    const applyTemplate = (tpl: typeof PROJECT_TEMPLATES[0]) => {
        setFormData(prev => ({
            ...prev,
            description: tpl.content,
            category: prev.category || tpl.category,
            status: prev.status === "Ongoing" ? tpl.status : prev.status,
        }));
        setShowTemplates(false);
        toast.success(`Template "${tpl.label}" applied!`);
    };

    const openModal = (project?: Project) => {
        if (project) {
            setEditingProject(project);
            setFormData({ title: project.title, description: project.description, category: project.category, status: project.status, date: project.date, client: project.client || "", image: project.image, images: project.images.join(", ") });
        } else {
            setEditingProject(null);
            setFormData({ title: "", description: "", category: "", status: "Ongoing", date: new Date().toISOString().split("T")[0], client: "", image: "", images: "" });
        }
        setShowTemplates(false);
        setShowModal(true);
    };

    // ─── EDITOR VIEW ──────────────────────────────────────────────────────────
    if (showModal) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editingProject ? "Edit Project" : "New Project"}</h2>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${formData.status === 'Draft' ? 'text-amber-400' : formData.status === 'Completed' ? 'text-green-400' : 'text-cyan-400'}`}>{formData.status}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowTemplates(v => !v)} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm transition-all flex items-center gap-2">
                            <FileText size={15} /> Templates
                        </button>
                        <button onClick={() => handleSaveAsBlog()} disabled={isSavingAsBlog} className="px-4 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 font-bold rounded-xl text-sm transition-all flex items-center gap-2 disabled:opacity-50">
                            <BookOpen size={15} /> {isSavingAsBlog ? "Saving…" : "→ Blog"}
                        </button>
                        <button onClick={() => handleSave(true)} disabled={isSaving} className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold rounded-xl text-sm transition-all flex items-center gap-2 disabled:opacity-50">
                            <Save size={15} /> {isSaving ? "Saving…" : "Save Draft"}
                        </button>
                        <button onClick={() => handleSave(false)} disabled={isSaving} className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50">
                            {editingProject ? "Update" : "Publish"}
                        </button>
                    </div>
                </div>

                {/* Template picker */}
                {showTemplates && (
                    <div className="mb-6 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Choose a Template</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {PROJECT_TEMPLATES.map(tpl => (
                                <button
                                    key={tpl.id}
                                    onClick={() => applyTemplate(tpl)}
                                    className="group flex flex-col items-start gap-2 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-xl transition-all text-left"
                                >
                                    <span className="text-2xl">{tpl.icon}</span>
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">{tpl.label}</p>
                                        <p className="text-slate-500 text-[10px] font-medium">{tpl.category}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-300px)]">
                    <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar pb-10">
                        {/* Title */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Title *</label>
                            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg font-bold focus:border-cyan-500/50 outline-none transition-all" placeholder="Project title…" />
                        </div>

                        {/* Category + Status */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                                <input
                                    list="project-categories"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                                    placeholder="e.g. Robotics"
                                />
                                <datalist id="project-categories">
                                    {categoryOptions.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none">
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Conceptual">Conceptual</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        {/* Date + Client */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Client</label>
                                <input value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none" placeholder="Client name…" />
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Cover Image</label>
                            <div className="flex gap-2">
                                <input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none" placeholder="Paste URL or upload →" />
                                <label className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-bold text-sm transition-all whitespace-nowrap">
                                    {isUploading ? <span className="animate-pulse">{uploadProgress}%</span> : <><Upload size={16} /> Upload</>}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploading} />
                                </label>
                            </div>
                            {formData.image && (
                                <div className="mt-2 relative h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                    <Image src={formData.image} alt="Cover preview" fill className="object-cover" unoptimized />
                                </div>
                            )}
                        </div>

                        {/* Gallery Images */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Gallery Images</label>
                            <textarea value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white h-20 focus:border-cyan-500/50 outline-none resize-none text-sm" placeholder="URLs comma separated, or use upload below…" />
                            <div className="mt-2 flex justify-end">
                                <label className="cursor-pointer flex items-center gap-2 px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/30 text-slate-600 dark:text-slate-400 hover:text-cyan-400 rounded-xl font-bold text-xs transition-all whitespace-nowrap">
                                    {isUploading ? <span className="animate-pulse">Uploading…</span> : <><Upload size={13} /> Upload Multiple</>}
                                    <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'images')} disabled={isUploading} />
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                                placeholder="Describe this project…"
                                uploadContext={editingProject?.id || `proj_${Date.now()}`}
                                uploadFolder="projects"
                            />
                        </div>
                    </div>

                    {/* Preview Pane */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-y-auto custom-scrollbar hidden lg:block">
                        <div className="prose dark:prose-invert max-w-none">
                            {formData.image && (
                                <div className="relative w-full h-64 mb-6 rounded-2xl overflow-hidden">
                                    <Image src={formData.image} alt="Preview" fill className="object-cover" unoptimized />
                                </div>
                            )}
                            <div className="flex gap-2 mb-3">
                                {formData.category && <span className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest">{formData.category}</span>}
                                <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${formData.status === "Completed" ? "bg-green-500/20 border-green-500/30 text-green-400" : formData.status === "Draft" ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"}`}>{formData.status}</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{formData.title || "Project Title"}</h1>
                            <div dangerouslySetInnerHTML={{ __html: formData.description || "<p class='text-slate-400'>Description will appear here...</p>" }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── LIST VIEW ────────────────────────────────────────────────────────────
    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h2>
                    <p className="text-slate-500 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="List view"><LayoutList size={16} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Grid view"><LayoutGrid size={16} /></button>
                    </div>
                    <button onClick={() => openModal()} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
                        <Plus size={18} /> New Project
                    </button>
                </div>
            </div>

            {/* Category filter tabs */}
            {allCategories.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-5">
                    {allCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filterCat === cat ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm shadow-cyan-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-400'}`}
                        >{cat}</button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center h-40 text-slate-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                    <LayoutList size={40} className="opacity-30" />
                    <p className="text-sm font-medium">No projects found.</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-2">
                    {filtered.map((project) => (
                        <div key={project.id} className="group flex items-center gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-3 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200">
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <Image src={project.image || "/placeholder.png"} alt={project.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-slate-900 dark:text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${project.status === "Completed" ? "bg-green-500/10 text-green-400 border-green-500/20" : project.status === "Draft" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"}`}>{project.status}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                    {project.category && <span className="bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-md font-bold">{project.category}</span>}
                                    {project.client && <span>Client: <span className="text-slate-700 dark:text-slate-300 font-medium">{project.client}</span></span>}
                                    {project.date && <span>{project.date}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(project)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-700" title="Edit"><Edit size={14} /></button>
                                <button onClick={() => handleDelete(project.id)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-700" title="Delete"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((project) => (
                        <div key={project.id} className="group relative bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-500 flex flex-col">
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                                <Image src={project.image || "/placeholder.png"} alt={project.title} fill className="object-cover" />
                                <div className="absolute top-3 right-3 bg-white dark:bg-slate-950/80 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest border border-white/10">{project.category || "Uncategorized"}</div>
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${(project.status as string) === "Completed" ? "bg-green-500/80 text-white border-green-500" : (project.status as string) === "Draft" ? "bg-amber-500/80 text-white border-amber-500" : "bg-cyan-500/80 text-white border-cyan-500"}`}>{project.status}</span>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                                <div className="text-slate-500 text-sm mb-4 line-clamp-2 h-10 overflow-hidden" dangerouslySetInnerHTML={{ __html: project.description }} />
                                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-200 dark:border-slate-800">
                                    <button onClick={() => openModal(project)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
                                    <button onClick={() => handleDelete(project.id)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
