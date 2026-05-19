import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getProjectBySeoSlug, getProjects } from "@/lib/projects";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, ExternalLink, Globe, Layout, Layers } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSeoSlug } from "@/lib/seo-utils";
import { BreadcrumbSchema } from "@/components/StructuredData";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// ISR: Incremental Static Regeneration with revalidate = 60
export const revalidate = 60;

export async function generateStaticParams() {
    const projects = await getProjects(100);
    return projects.map((project) => ({
        slug: createSeoSlug(project.title, project.id),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const project = await getProjectBySeoSlug(slug);
    if (!project) return {};

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com';
    const canonicalUrl = `${baseUrl}/projects/${slug}`;

    return {
        title: `${project.title} | VAELINSA Projects`,
        description: project.description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: project.title,
            description: project.description,
            images: [project.image],
            type: "article",
        }
    };
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const project = await getProjectBySeoSlug(slug);

    if (!project) notFound();

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 text-white">
            <Navbar />
            <BreadcrumbSchema
                items={[
                    { name: "Home", item: "/" },
                    { name: "Projects", item: "/projects" },
                    { name: project.title, item: `/projects/${slug}` }
                ]}
            />
            
            {/* Hero Section */}
            <header className="relative h-[60vh] min-h-[400px] w-full overflow-hidden pt-20">
                <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <div className="absolute inset-0 flex items-end">
                    <div className="dynamic-container pb-12">
                        <Link href="/projects" className="inline-flex items-center gap-2 text-cyan-400 font-extrabold mb-6 hover:text-cyan-300 transition-colors group uppercase tracking-widest text-xs">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Projects
                        </Link>
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                                {project.category}
                            </span>
                            <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                                project.status === "Completed" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                            }`}>
                                {project.status}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-7xl font-extrabold text-white uppercase tracking-tight mb-8">
                            {project.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-500">
                                <Calendar size={18} className="text-cyan-500" />
                                {project.date}
                            </div>
                            <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-500">
                                <User size={18} className="text-cyan-500" />
                                Client: {project.client || "Confidential"}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="dynamic-container py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                            <Layout className="text-cyan-500" size={24} />
                            Project Overview
                        </h2>
                        <div className="prose prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                            {project.description}
                        </div>
                        
                        {project.images && project.images.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold text-white mb-8 uppercase tracking-tight flex items-center gap-2">
                                    <Layers className="text-cyan-500" size={24} />
                                    Project Gallery
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {project.images.map((img, i) => (
                                        <div key={i} className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                            <Image
                                                src={img}
                                                alt={`${project.title} screenshot ${i + 1}`}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sticky top-32">
                            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Project Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Category</span>
                                    <span className="text-white font-bold">{project.category}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</span>
                                    <span className={`font-bold ${
                                        project.status === "Completed" ? "text-green-400" : "text-yellow-400"
                                    }`}>{project.status}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Timeline</span>
                                    <span className="text-white font-bold">{project.date}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Partner / Client</span>
                                    <span className="text-white font-bold">{project.client || "Vaelinsa Strategic Partner"}</span>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
                                <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2">
                                    Enquire about this
                                    <ExternalLink size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
