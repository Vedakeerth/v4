"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Image as ImageIcon, ArrowLeft, Eye } from "lucide-react";
import Image from "next/image";
import { BlogPost } from "@/lib/blogs";
import BlogContent from "@/components/BlogContent";

export default function BlogsTab() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);

    // Editor state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [image, setImage] = useState("");
    const [category, setCategory] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    useEffect(() => {
        fetchBlogs();
    }, []);

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
            setHashtags(blog.hashtags?.join(", ") || "");
            setMetaTitle(blog.metaTitle || "");
            setMetaDescription(blog.metaDescription || "");
        } else {
            setActiveBlog(null);
            setTitle("");
            setContent("");
            setExcerpt("");
            setImage("");
            setCategory("");
            setHashtags("");
            setMetaTitle("");
            setMetaDescription("");
        }
        setIsEditing(true);
    };

    const insertText = (prefix: string, suffix: string = "") => {
        const textarea = document.getElementById("blog-content-area") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newContent = before + prefix + selection + suffix + after;
        setContent(newContent);

        // Reset focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleSave = async () => {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const payload = {
            id: activeBlog?.id || Date.now().toString(),
            slug: activeBlog?.slug || slug,
            title,
            content,
            excerpt,
            image,
            category,
            author: activeBlog?.author || "Admin",
            date: activeBlog?.date || new Date().toISOString().split('T')[0],
            readTime: `${Math.ceil(content.split(' ').length / 200)} min read`,
            likes: activeBlog?.likes || 0,
            comments: activeBlog?.comments || [],
            hashtags: hashtags.split(",").map(h => h.trim()).filter(Boolean),
            metaTitle,
            metaDescription
        };

        try {
            const url = activeBlog ? `/api/blogs/${activeBlog.id}` : "/api/blogs";
            const method = activeBlog ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if ((await res.json()).success) {
                setIsEditing(false);
                fetchBlogs();
            } else {
                alert("Failed to save blog");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this post?")) return;
        const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
        if (res.ok) fetchBlogs();
    };

    if (isEditing) {
        return (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-white">{activeBlog ? "Edit Post" : "New Post"}</h2>
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                    >
                        {activeBlog ? "Update" : "Publish"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-300px)]">
                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none text-lg font-bold" placeholder="Post Title" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Category</label>
                                    <input value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none" placeholder="Tech" />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Cover Image URL</label>
                                    <input value={image} onChange={e => setImage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none" placeholder="https://..." />
                                </div>
                            </div>

                            {/* Metadata Fields */}
                            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-4">
                                <h3 className="text-cyan-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800 pb-2">SEO & Metadata</h3>
                                <div>
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Hashtags (comma separated)</label>
                                    <input value={hashtags} onChange={e => setHashtags(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none text-xs" placeholder="3DPrinting, Innovation, Robots" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Meta Title</label>
                                        <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none text-xs" placeholder="Meta title for SEO" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Meta Description</label>
                                        <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white h-20 focus:border-cyan-500/50 outline-none text-xs resize-none" placeholder="Short description for search results" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5 ml-1">Excerpt</label>
                                <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white h-24 focus:border-cyan-500/50 outline-none resize-none" placeholder="Short description for the blog list..." />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="block text-slate-500 text-[10px] font-bold uppercase">Content (Markdown)</label>
                                    {/* Toolbar */}
                                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                                        <button onClick={() => insertText("### ")} title="Heading 3" className="p-1.5 hover:bg-slate-800 rounded text-slate-400 font-bold text-xs px-2">H3</button>
                                        <button onClick={() => insertText("#### ")} title="Heading 4" className="p-1.5 hover:bg-slate-800 rounded text-slate-400 font-bold text-xs px-2">H4</button>
                                        <button onClick={() => insertText("**", "**")} title="Bold" className="p-1.5 hover:bg-slate-800 rounded text-slate-400 font-bold text-xs px-2">B</button>
                                        <button onClick={() => insertText("- ")} title="Bullet List" className="p-1.5 hover:bg-slate-800 rounded text-slate-400"><X size={14} className="rotate-45" /> {/* Using X as a hacky bullet icon or just text */}</button>
                                        <button onClick={() => insertText("1. ")} title="Numbered List" className="p-1.5 hover:bg-slate-800 rounded text-slate-400 font-bold text-xs px-2">1.</button>
                                        <div className="w-px h-4 bg-slate-800 mx-1" />
                                        <button onClick={() => {
                                            const url = prompt("Enter Image URL:");
                                            if (url) insertText(`![image](${url})`);
                                        }} title="Insert Image" className="p-1.5 hover:bg-slate-800 rounded text-slate-400"><ImageIcon size={14} /></button>
                                    </div>
                                </div>
                                <textarea
                                    id="blog-content-area"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-6 text-white h-[600px] font-mono text-sm focus:border-cyan-500/50 outline-none leading-relaxed"
                                    placeholder="# Write your post here..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview Pane */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 overflow-y-auto custom-scrollbar hidden lg:block">
                        <div className="prose prose-invert max-w-none">
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

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Blog Posts</h2>
                <button
                    onClick={() => handleStartEdit()}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                    <Plus size={20} /> Create Post
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => (
                    <div key={blog.id} className="bg-slate-900 shadow-xl border border-slate-800 rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-all">
                        <div className="relative h-48 bg-slate-800">
                            <Image src={blog.image || "/placeholder.png"} alt={blog.title} fill className="object-cover" />
                            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                                {blog.category}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">{blog.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{blog.excerpt}</p>
                            <div className="flex gap-2 pt-2 border-t border-slate-800">
                                <button
                                    onClick={() => handleStartEdit(blog)}
                                    className="flex-1 py-2 bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(blog.id)}
                                    className="flex-1 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
