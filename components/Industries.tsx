"use client";

import React, { useState, useEffect } from "react";
import { Activity, Factory, Rocket, Library } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { motion } from "framer-motion";

const ICON_MAP: Record<string, any> = {
    Activity,
    Factory,
    Rocket,
    Library
};

interface IndustriesProps {
    content: {
        header: { title: string; subtitle: string };
        industries: { icon: string; name: string; description: string }[];
    }
}

export default function Industries({ content }: IndustriesProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Simple loading state simulation if needed
        const timer = setTimeout(() => { }, 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="py-24 bg-slate-950 border-t border-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    {isLoading ? (
                        <>
                            <Skeleton variant="text" width="50%" height={32} className="mx-auto mb-4" />
                            <Skeleton variant="rounded" width={80} height={4} className="mx-auto" />
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{content?.header?.title || "Industries We Serve"}</h2>
                            <div className="h-1 w-20 bg-cyan-500 mx-auto rounded-full" />
                        </motion.div>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-8 bg-slate-900 border border-slate-800 rounded-2xl">
                                <Skeleton variant="rounded" width={32} height={32} className="mb-6" />
                                <Skeleton variant="text" width="70%" height={24} className="mb-2" />
                                <Skeleton variant="text" width="100%" height={16} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(content?.industries || []).map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-8 hover:bg-slate-800 transition-colors"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    {(() => {
                                        const Icon = ICON_MAP[item?.icon || "Rocket"] || Factory;
                                        return <Icon size={80} className="text-white" />;
                                    })()}
                                </div>

                                <div className="relative z-10">
                                    {(() => {
                                        const Icon = ICON_MAP[item?.icon || "Rocket"] || Factory;
                                        return <Icon className="h-8 w-8 text-cyan-500 mb-6" />;
                                    })()}
                                    <h3 className="text-xl font-bold text-white mb-2">{item?.name || "Target Industry"}</h3>
                                    <p className="text-slate-400 text-sm">
                                        {item?.description || "Specialized engineering solutions optimized for this sector."}
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
