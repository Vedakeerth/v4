"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, User } from "lucide-react";
import { BlogPost } from "@/lib/blogs";

interface BlogSectionProps {
    blogs: BlogPost[];
}

export default function BlogSection({ blogs }: BlogSectionProps) {
    if (!blogs || blogs.length === 0) return null;

    return (
        <section className="py-24 bg-slate-950 relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4">
                        <BookOpen size={16} />
                        <span>Our Blog</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                        Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Updates</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl text-lg">
                        Stay informed about the latest trends in 3D printing and Additive Manufacturing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {blogs.slice(0, 3).map((blog) => (
                        <Link
                            href={`/blog/${blog.slug}`}
                            key={blog.id}
                            className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 flex flex-col"
                        >
                            <div className="relative h-56 w-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 z-10" />
                                <Image
                                    src={blog.image || "/placeholder.png"}
                                    alt={blog.title}
                                    fill
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-cyan-500 text-slate-950 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wide">
                                        {blog.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {blog.readTime}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User size={12} /> {blog.author}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                                    {blog.title}
                                </h3>
                                <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                                    {blog.excerpt}
                                </p>

                                <div className="flex items-center text-cyan-400 text-sm font-bold mt-auto group-hover:gap-2 transition-all">
                                    Read Article <ArrowRight size={16} className="ml-2" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all group"
                    >
                        View All Articles
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
