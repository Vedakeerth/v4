"use client";

import React, { useState, useEffect } from "react";
import { Printer, Settings, Layers, Cpu } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { motion } from "framer-motion";

const ICON_MAP: Record<string, any> = {
    Printer,
    Settings,
    Layers,
    Cpu
};

interface ServicesProps {
    content: {
        header: { title: string; description: string };
        services: { icon: string; title: string; description: string }[];
    }
}

export default function Services({ content }: ServicesProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Simple loading state simulation if needed
        const timer = setTimeout(() => { }, 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    {isLoading ? (
                        <>
                            <Skeleton variant="text" width="60%" height={32} className="mx-auto mb-4" />
                            <Skeleton variant="text" width="80%" height={20} className="mx-auto" />
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{content?.header?.title || "Our Services"}</h2>
                            <p className="text-slate-400 max-w-xl mx-auto">
                                {content?.header?.description || "Comprehensive engineering and technology solutions."}
                            </p>
                        </motion.div>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                                <Skeleton variant="rounded" width={48} height={48} className="mb-4" />
                                <Skeleton variant="text" width="80%" height={24} className="mb-2" />
                                <Skeleton variant="text" width="100%" height={16} className="mb-1" />
                                <Skeleton variant="text" width="90%" height={16} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(content?.services || []).map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative p-6 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-900/20"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-slate-800/80 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-950/50 group-hover:text-cyan-400 transition-colors">
                                        {(() => {
                                            const Icon = ICON_MAP[service?.icon || "Printer"] || Printer;
                                            return <Icon className="h-6 w-6 text-slate-300 group-hover:text-cyan-400" />;
                                        })()}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{service?.title || "Specialized Service"}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {service?.description || "High-quality engineering solutions tailored to your needs."}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
