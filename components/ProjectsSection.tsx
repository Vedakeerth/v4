"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { Project } from "@/lib/projects";

interface ProjectsSectionProps {
    projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
    if (!projects || projects.length === 0) return null;

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4">
                            <Briefcase size={16} />
                            <span>Our Portfolio</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Projects</span>
                        </h2>
                    </div>
                    <Link
                        href="/projects"
                        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <span>View All Projects</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.slice(0, 3).map((project, index) => (
                        <div
                            key={project.id}
                            className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/30 transition-all duration-500"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors z-10" />
                                <Image
                                    src={project.image || "/placeholder.png"}
                                    alt={project.title}
                                    fill
                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 right-4 z-20">
                                    <span className="bg-slate-950/80 backdrop-blur border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                        {project.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-slate-400 line-clamp-2 mb-6">
                                    {project.description}
                                </p>
                                <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${project.status === "Completed" ? "text-green-400" : "text-yellow-400"
                                        }`}>
                                        {project.status}
                                    </span>
                                    <span className="text-slate-500 text-sm">
                                        {new Date(project.date).getFullYear()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
