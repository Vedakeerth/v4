"use client";

import React, { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { Comment } from "@/lib/blogs";

interface CommentSectionProps {
    blogId: string;
    initialComments: Comment[];
}

export default function CommentSection({ blogId, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !comment || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/blogs/${blogId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author: name, text: comment }),
            });

            const data = await res.json();
            if (data.success) {
                setComments([...comments, data.comment]);
                setName("");
                setComment("");
            }
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-20 border-t border-slate-900 pt-20">
            <div className="flex items-center gap-3 mb-10">
                <MessageSquare className="text-cyan-500" size={28} />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Discussions <span className="text-slate-600 text-lg ml-2">{comments.length}</span>
                </h2>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-16">
                <h3 className="text-white font-bold mb-6">Leave a comment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-cyan-500/50 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="mb-6">
                    <textarea
                        placeholder="Write your thoughts..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white h-32 focus:border-cyan-500/50 outline-none transition-all resize-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                    <Send size={16} />
                </button>
            </form>

            {/* Comment List */}
            <div className="space-y-8">
                {comments.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                        <p className="text-slate-500 font-medium">No comments yet. Be the first to start the conversation!</p>
                    </div>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className="flex gap-6 group">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-500 font-black text-xl border border-slate-700">
                                    {c.author.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-grow pb-8 border-b border-slate-900/50">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{c.author}</h4>
                                    <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                                        {new Date(c.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">{c.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
