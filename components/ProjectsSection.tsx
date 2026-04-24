"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, ArrowUpRight } from "lucide-react";
import { Project } from "@/types";
import { createSeoSlug } from "@/lib/seo-utils";

interface ProjectsSectionProps {
    projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
    const safeProjects = Array.isArray(projects) ? projects : [];
    if (safeProjects.length === 0) return null;

    return (
        <section className="py-20 md:py-28 bg-white dark:bg-slate-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-30" />

            <div className="dynamic-container relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-cyan-400 font-extrabold uppercase tracking-[0.2em] text-[10px] md:text-xs mb-4">
                            <Briefcase size={14} className="md:w-4 md:h-4" />
                            <span>Our Portfolio</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Projects</span>
                        </h2>
                    </div>
                    <Link
                        href="/projects"
                        className="group flex items-center gap-3 text-slate-500 hover:text-white transition-all text-sm font-bold uppercase tracking-widest"
                    >
                        <span>View All Projects</span>
                        <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all">
                            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {safeProjects.slice(0, 3).map((project, index) => (
                        <Link
                            key={project?.id || index}
                            href={`/projects/${createSeoSlug(project?.title || "", project?.id || "")}`}
                            className="group relative bg-slate-50 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/50 hover:border-cyan-500/30 transition-all duration-500 hover:translate-y-[-4px] flex flex-col h-full"
                        >
                            <div className="relative h-64 md:h-72 overflow-hidden">
                                <Image
                                    src={project?.image || "/placeholder.png"}
                                    alt={project?.title || "Project"}
                                    fill
                                    className="object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute top-4 right-4 z-20">
                                    <span className="bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[10px] font-extrabold px-4 py-2 rounded-xl uppercase tracking-widest">
                                        {project?.category || "Industrial"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 flex flex-col flex-grow">
                                 <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-400 transition-colors leading-tight tracking-tight">
                                    {project?.title || "Engineering Solution"}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-8 text-sm/relaxed">
                                    {project?.description || "High-precision engineering project delivered with excellence."}
                                </p>
                                
                                <div className="mt-auto flex items-center justify-between border-t border-slate-200 dark:border-slate-800/50 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-500 font-extrabold text-[10px] border border-slate-300 dark:border-slate-700/50">
                                            {project?.client?.charAt(0) || "V"}
                                        </div>
                                        <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] ${
                                            project?.status === "Completed" ? "text-green-400" : "text-yellow-400"
                                        }`}>
                                            {project?.status || "Ongoing"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-600 text-[11px] font-bold tracking-tighter">
                                            {project?.date ? new Date(project.date).getFullYear() : new Date().getFullYear()}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300">
                                            <ArrowUpRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
