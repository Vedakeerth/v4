import React from "react";
import Image from "next/image";
import { getProjects } from "@/lib/projects";
import { Metadata } from 'next';
import Link from "next/link";
import { createSeoSlug } from "@/lib/seo-utils";
import { getPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    return await getPageMetadata('Projects', '/projects');
}

export const revalidate = 0;

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-24">
            <div className="dynamic-container py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 uppercase tracking-tight">Our Projects</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                        Showcasing innovation and precision in every layer.
                    </p>
                    <div className="h-1.5 w-20 bg-cyan-500 mx-auto mt-8 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${createSeoSlug(project.title, project.id)}`}
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
                                <div className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-8 text-sm/relaxed overflow-hidden prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: project.description }} />
                                
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
                                            Client: {project?.client || "Confidential"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
