"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ArrowLeft, Upload, LayoutList, LayoutGrid, FileText, Save, BookOpen } from "lucide-react";
import Image from "next/image";
import { BlogPost } from "@/types";
import BlogContent from "@/components/BlogContent";
import { toast } from 'sonner';
import RichTextEditor from "@/components/RichTextEditor";

// ── Built-in templates ──────────────────────────────────────────────────────
const BLOG_TEMPLATES = [
    {
        id: "tech-article",
        label: "Tech Article",
        icon: "⚙️",
        category: "Technology",
        content: `<h2>Introduction</h2><p>Write a brief introduction to the topic here.</p><h2>Key Points</h2><ul><li>Point one</li><li>Point two</li><li>Point three</li></ul><h2>Deep Dive</h2><p>Expand on the topic in detail here.</p><h2>Conclusion</h2><p>Summarise key takeaways.</p>`,
    },
    {
        id: "case-study",
        label: "Case Study",
        icon: "📊",
        category: "Projects",
        content: `<h2>Project Overview</h2><p>Describe the project and its goals.</p><h2>Challenge</h2><p>What problem were you solving?</p><h2>Solution</h2><p>How did you approach it?</p><h2>Results</h2><ul><li>Result 1</li><li>Result 2</li></ul><h2>Lessons Learned</h2><p>What did you take away from this?</p>`,
    },
    {
        id: "tutorial",
        label: "Tutorial / How-To",
        icon: "📖",
        category: "Education",
        content: `<h2>What You'll Learn</h2><p>By the end of this tutorial you will be able to...</p><h2>Prerequisites</h2><ul><li>Requirement 1</li><li>Requirement 2</li></ul><h2>Step 1 – Getting Started</h2><p>Describe the first step.</p><h2>Step 2 – Core Concept</h2><p>Describe the second step.</p><h2>Step 3 – Finishing Up</h2><p>Describe the final step.</p><h2>Conclusion</h2><p>Wrap up and point to next resources.</p>`,
    },
    {
        id: "news",
        label: "News / Announcement",
        icon: "📢",
        category: "News",
        content: `<h2>The Announcement</h2><p>State the news clearly and concisely.</p><h2>Background</h2><p>Provide context for the reader.</p><h2>What This Means</h2><p>Explain the impact or implications.</p><h2>Next Steps</h2><p>Tell the reader what to expect or do next.</p>`,
    },
];

export default function BlogsTab() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showTemplates, setShowTemplates] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [filterCat, setFilterCat] = useState("All");

    // Editor state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [image, setImage] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("Published");
    const [hashtags, setHashtags] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [likes, setLikes] = useState(0);
    const [reads, setReads] = useState(0);

    // Derived list of existing categories for the datalist
    const categoryOptions = Array.from(new Set(blogs.map(b => b.category).filter(Boolean)));

    useEffect(() => { fetchBlogs(); }, []);

    const fetchBlogs = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/blogs");
            const data = await res.json();
            if (data.success) setBlogs(data.blogs);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartEdit = (blog?: BlogPost) => {
        if (blog) {
            setActiveBlog(blog);
            setTitle(blog.title);
            setContent(blog.content);
            setExcerpt(blog.excerpt);
            setImage(blog.image);
            setCategory(blog.category);
            setStatus((blog as any).status || "Published");
            setHashtags(blog.hashtags?.join(", ") || "");
            setMetaTitle(blog.metaTitle || "");
            setMetaDescription(blog.metaDescription || "");
            setLikes(blog.likes || 0);
            setReads((blog as any).reads || 0);
        } else {
            setActiveBlog(null);
            setTitle(""); setContent(""); setExcerpt(""); setImage("");
            setCategory(""); setStatus("Published"); setHashtags("");
            setMetaTitle(""); setMetaDescription(""); setLikes(0); setReads(0);
        }
        setShowTemplates(false);
        setIsEditing(true);
    };

    const applyTemplate = (tpl: typeof BLOG_TEMPLATES[0]) => {
        setContent(tpl.content);
        if (!category) setCategory(tpl.category);
        setShowTemplates(false);
        toast.success(`Template "${tpl.label}" applied!`);
    };

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setUploadProgress(0);
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('file', file);
            const blogId = activeBlog ? activeBlog.id : `blog_${Date.now()}`;
            formDataPayload.append('quotationID', blogId);
            formDataPayload.append('rootFolder', 'blogs');

            const responseData = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/upload-to-mega", true);
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error("Invalid response")); }
                    } else { reject(new Error(`Upload failed: ${xhr.status}`)); }
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.send(formDataPayload);
            });

            if (responseData.success) {
                setImage(responseData.data.url);
                toast.success("Cover image uploaded!");
            } else { toast.error("Upload failed."); }
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSave = async (saveAsDraft = false) => {
        if (!title.trim()) { toast.error("Please add a title."); return; }
        setIsSaving(true);
        const resolvedStatus = saveAsDraft ? "Draft" : status;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const payload = {
            id: activeBlog?.id || Date.now().toString(),
            slug: activeBlog?.slug || slug,
            title, content, excerpt, image, category,
            author: activeBlog?.author || "Admin",
            date: activeBlog?.date || new Date().toISOString().split('T')[0],
            readTime: `${Math.ceil(content.split(' ').length / 200)} min read`,
            likes, reads,
            comments: activeBlog?.comments || [],
            hashtags: hashtags.split(",").map(h => h.trim()).filter(Boolean),
            metaTitle, metaDescription,
            status: resolvedStatus,
        };

        try {
            const url = activeBlog ? `/api/blogs/${activeBlog.id}` : "/api/blogs";
            const method = activeBlog ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if ((await res.json()).success) {
                toast.success(saveAsDraft ? "Saved as Draft!" : (activeBlog ? "Blog updated!" : "Blog published!"));
                setIsEditing(false);
                fetchBlogs();
            } else { toast.error("Failed to save blog"); }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred.");
        } finally { setIsSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this post?")) return;
        const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Post deleted."); fetchBlogs(); }
    };

    // ─── EDITOR VIEW ──────────────────────────────────────────────────────────
    if (isEditing) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                {/* Header bar */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activeBlog ? "Edit Post" : "New Post"}</h2>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'Draft' ? 'text-amber-400' : 'text-green-400'}`}>{status}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowTemplates(v => !v)}
                            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm transition-all flex items-center gap-2"
                        >
                            <FileText size={15} /> Templates
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                            className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold rounded-xl text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={15} /> {isSaving ? "Saving…" : "Save Draft"}
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                        >
                            {activeBlog ? "Update" : "Publish"}
                        </button>
                    </div>
                </div>

                {/* Template picker */}
                {showTemplates && (
                    <div className="mb-6 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Choose a Template</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {BLOG_TEMPLATES.map(tpl => (
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
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none text-lg font-bold" placeholder="Post Title" />
                        </div>

                        {/* Category + Status */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Category</label>
                                <input
                                    list="blog-categories"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none"
                                    placeholder="Tech"
                                />
                                <datalist id="blog-categories">
                                    {categoryOptions.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none">
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Cover Image</label>
                            <div className="flex gap-2">
                                <input value={image} onChange={e => setImage(e.target.value)} className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none" placeholder="Paste URL or upload →" />
                                <label className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-bold text-sm transition-all whitespace-nowrap">
                                    {isUploading ? <span className="animate-pulse">{uploadProgress}%</span> : <><Upload size={16} /> Upload</>}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} disabled={isUploading} />
                                </label>
                            </div>
                            {image && (
                                <div className="mt-2 relative h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                    <Image src={image} alt="cover" fill className="object-cover" />
                                </div>
                            )}
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Excerpt</label>
                            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white h-20 focus:border-cyan-500/50 outline-none resize-none text-sm" placeholder="Short description for the blog list..." />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Content</label>
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Write your blog post here…"
                                uploadContext={activeBlog?.id || `blog_${Date.now()}`}
                                uploadFolder="blogs"
                            />
                        </div>

                        {/* SEO */}
                        <div className="p-4 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                            <h3 className="text-cyan-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">SEO & Metadata</h3>
                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Hashtags (comma separated)</label>
                                <input value={hashtags} onChange={e => setHashtags(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none text-xs" placeholder="3DPrinting, Innovation" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Meta Title</label>
                                    <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none text-xs" placeholder="Meta title for SEO" />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Meta Description</label>
                                    <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white h-16 focus:border-cyan-500/50 outline-none text-xs resize-none" />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Initial Likes</label>
                                    <input type="number" value={likes} onChange={e => setLikes(parseInt(e.target.value) || 0)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none text-xs" />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Initial Reads</label>
                                    <input type="number" value={reads} onChange={e => setReads(parseInt(e.target.value) || 0)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none text-xs" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Pane */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-y-auto custom-scrollbar hidden lg:block">
                        <div className="prose dark:prose-invert max-w-none">
                            <h1 className="text-3xl font-bold mb-4">{title || "Post Title"}</h1>
                            {image && (
                                <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden">
                                    <Image src={image} alt="Cover" fill className="object-cover" />
                                </div>
                            )}
                            <BlogContent content={content} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── LIST VIEW ────────────────────────────────────────────────────────────
    const categories = ["All", ...Array.from(new Set(blogs.map(b => b.category).filter(Boolean)))];
    const filtered = filterCat === "All" ? blogs : blogs.filter(b => b.category === filterCat);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Blog Posts</h2>
                    <p className="text-slate-500 text-sm mt-0.5">{blogs.length} post{blogs.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="List view"><LayoutList size={16} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Grid view"><LayoutGrid size={16} /></button>
                    </div>
                    <button onClick={() => handleStartEdit()} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
                        <Plus size={18} /> New Post
                    </button>
                </div>
            </div>

            {/* Category filter tabs */}
            {categories.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-5">
                    {categories.map(cat => (
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
                    <p className="text-sm font-medium">No posts found.</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-2">
                    {filtered.map(blog => (
                        <div key={blog.id} className="group flex items-center gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-3 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200">
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <Image src={blog.image || "/placeholder.png"} alt={blog.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-slate-900 dark:text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">{blog.title}</h3>
                                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${(blog as any).status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>{(blog as any).status || 'Published'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                    {blog.category && <span className="bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-md font-bold">{blog.category}</span>}
                                    {blog.date && <span>{blog.date}</span>}
                                    {blog.readTime && <span>{blog.readTime}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleStartEdit(blog)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-700" title="Edit"><Edit size={14} /></button>
                                <button onClick={() => handleDelete(blog.id)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-600 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-700" title="Delete"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(blog => (
                        <div key={blog.id} className="group relative bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-500 flex flex-col">
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                                <Image src={blog.image || "/placeholder.png"} alt={blog.title} fill className="object-cover" />
                                <div className="absolute top-3 right-3 bg-white dark:bg-slate-950/80 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest border border-white/10">{blog.category}</div>
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${(blog as any).status === 'Draft' ? 'bg-amber-500/80 text-white border-amber-500' : 'bg-green-500/80 text-white border-green-500'}`}>{(blog as any).status || 'Published'}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">{blog.title}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{blog.excerpt}</p>
                                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                    <button onClick={() => handleStartEdit(blog)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
                                    <button onClick={() => handleDelete(blog.id)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}