import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getBlogBySlug } from "@/lib/blogs";
import Image from "next/image";
import Link from "next/link";
import { Clock, User, Calendar, ArrowLeft, Share2, Tag, Hash } from "lucide-react";
import { notFound } from "next/navigation";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import type { Metadata } from "next";
import BlogContent from "@/components/BlogContent";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);
    if (!blog) return {};

    return {
        title: blog.metaTitle || `${blog.title} | VAELINSA Insights`,
        description: blog.metaDescription || blog.excerpt,
        keywords: blog.hashtags || [],
        openGraph: {
            title: blog.metaTitle || blog.title,
            description: blog.metaDescription || blog.excerpt,
            images: [blog.image],
            type: "article",
            publishedTime: blog.date,
            authors: [blog.author],
        },
        twitter: {
            card: "summary_large_image",
            title: blog.metaTitle || blog.title,
            description: blog.metaDescription || blog.excerpt,
            images: [blog.image],
        }
    };
}

export default async function BlogDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);

    if (!blog) notFound();

    return (
        <main className="min-h-screen bg-slate-950 pt-24 text-white">

            {/* Hero Section */}
            <header className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
                <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />

                <div className="absolute inset-0 flex items-end">
                    <div className="container mx-auto px-4 pb-20">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-cyan-400 font-bold mb-8 hover:text-cyan-300 transition-colors group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Insights
                        </Link>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <span className="px-4 py-1.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                {blog.category}
                            </span>
                            <span className="px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                                {blog.readTime}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-7xl font-black text-white leading-[0.9] max-w-5xl uppercase tracking-tighter mb-8">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-400">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-500 font-black text-xl shadow-xl">
                                    {blog.author.charAt(0)}
                                </div>
                                <div>
                                    <span className="block font-black text-white text-sm uppercase tracking-tight">{blog.author}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">Lead Engineer</span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                                <Calendar size={16} className="text-cyan-500" />
                                {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto">
                    {/* Interaction Bar Top */}
                    <div className="flex items-center justify-between mb-16 pb-8 border-b border-slate-900">
                        <LikeButton blogId={blog.id} initialLikes={blog.likes || 0} />
                        <div className="group flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-cyan-500 transition-colors">Share Insight</span>
                            <button className="p-3 bg-slate-900 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-2xl text-slate-400 transition-all border border-slate-800">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <BlogContent content={blog.content} />

                    {/* Hashtags */}
                    {blog.hashtags && blog.hashtags.length > 0 && (
                        <div className="mt-16 flex flex-wrap gap-2">
                            {blog.hashtags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-xs font-bold hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer">
                                    <Hash size={12} className="text-cyan-500" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Interaction Bar Bottom */}
                    <div className="mt-20 pt-10 border-t border-slate-900 flex items-center justify-between">
                        <div className="flex gap-4">
                            <LikeButton blogId={blog.id} initialLikes={blog.likes || 0} />
                        </div>
                        <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
                            End of Insight • Vaelinsa Labs
                        </div>
                    </div>

                    {/* Comments Section */}
                    <CommentSection blogId={blog.id} initialComments={blog.comments || []} />
                </div>
            </div>

            <Footer />
        </main>
    );
}
