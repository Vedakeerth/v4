import React from "react";
import Image from "next/image";
import { getProjects } from "@/lib/projects";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Projects | VAELINSA",
    description: "Explore our latest 3D printing and engineering projects.",
};

export const revalidate = 0;

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <main className="min-h-screen bg-slate-950 pt-32 pb-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Our Projects</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Showcasing innovation and precision in every layer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all group"
                        >
                            <div className="relative h-72 w-full overflow-hidden">
                                <Image
                                    src={project.image || "/placeholder.png"}
                                    alt={project.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-slate-950/80 backdrop-blur border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                        {project.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-slate-400 mb-6 line-clamp-3">
                                    {project.description}
                                </p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">
                                        Client: {project.client || "Confidential"}
                                    </span>
                                    <span className={`font-bold ${project.status === "Completed" ? "text-green-400" : "text-yellow-400"
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
