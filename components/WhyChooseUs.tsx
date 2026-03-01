"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Gauge, CheckCircle2, Zap, Scaling } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { motion } from "framer-motion";

const ICON_MAP: Record<string, any> = {
    Gauge,
    CheckCircle2,
    Zap,
    Scaling
};

interface WhyChooseUsData {
    header: {
        badge: string;
        title: string;
        titleSuffix: string;
        description: string;
    };
    features: {
        icon: string;
        title: string;
        description: string;
    }[];
    images: {
        src: string;
        label: string;
    }[];
}

interface WhyChooseUsProps {
    content: WhyChooseUsData;
}

export default function WhyChooseUs({ content }: WhyChooseUsProps) {
    const [isLoading, setIsLoading] = useState(false);

    // useEffect(() => {
    //     // Simple loading state simulation if needed
    //     const timer = setTimeout(() => {}, 600);
    //     return () => clearTimeout(timer);
    // }, []);

    return (
        <section className="py-24 bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        {isLoading ? (
                            <>
                                <Skeleton variant="text" width="40%" height={16} className="mb-2" />
                                <Skeleton variant="text" width="90%" height={48} className="mb-6" />
                                <Skeleton variant="text" width="100%" height={20} className="mb-2" />
                                <Skeleton variant="text" width="95%" height={20} className="mb-8" />
                                <div className="space-y-6">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-start">
                                            <Skeleton variant="circular" width={40} height={40} className="mr-4" />
                                            <div className="flex-1">
                                                <Skeleton variant="text" width="70%" height={20} className="mb-2" />
                                                <Skeleton variant="text" width="100%" height={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-blue-500 font-medium tracking-wide mb-2 uppercase text-sm">{content.header.badge}</h2>
                                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                    {content.header.title} <br />
                                    <span className="text-slate-400">{content.header.titleSuffix}</span>
                                </h3>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    {content.header.description}
                                </p>

                                <div className="space-y-6">
                                    {content.features.map((feature, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="mt-1 bg-blue-500/10 p-2 rounded-full mr-4">
                                                {(() => {
                                                    const Icon = ICON_MAP[feature.icon] || Zap;
                                                    return <Icon className="h-5 w-5 text-blue-400" />;
                                                })()}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                                                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <Skeleton variant="rounded" height={192} />
                                    <Skeleton variant="rounded" height={192} />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton variant="rounded" height={256} />
                                    <Skeleton variant="rounded" height={128} />
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative"
                            >
                                {/* Abstract visual representation of precision/layers */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-3xl rounded-full opacity-30" />
                                <div className="relative z-10 grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                            className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-700/50"
                                        >
                                            <Image
                                                src={content.images[0]?.src || "/images/bento-1-precision.png"}
                                                alt={content.images[0]?.label || "Precision Engineering"}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                            <div className="absolute bottom-2 left-3 font-mono text-xs text-blue-400">{content.images[0]?.label}</div>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: 0.5 }}
                                            className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-700/50"
                                        >
                                            <Image
                                                src={content.images[1]?.src || "/images/bento-4-mechanical.png"}
                                                alt={content.images[1]?.label || "Mechanical Parts"}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                            <div className="absolute bottom-2 left-3 font-mono text-xs text-blue-400">{content.images[1]?.label}</div>
                                        </motion.div>
                                    </div>
                                    <div className="space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: 0.4 }}
                                            className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-700/50"
                                        >
                                            <Image
                                                src={content.images[2]?.src || "/images/bento-2-industrial.png"}
                                                alt={content.images[2]?.label || "Industrial Automation"}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                            <div className="absolute bottom-2 left-3 font-mono text-xs text-blue-400">{content.images[2]?.label}</div>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: 0.6 }}
                                            className="relative h-32 w-full overflow-hidden rounded-2xl border border-slate-700/50"
                                        >
                                            <Image
                                                src={content.images[3]?.src || "/images/bento-3-shipping.png"}
                                                alt={content.images[3]?.label || "Worldwide Shipping"}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                            <div className="absolute bottom-2 left-3 font-mono text-xs text-blue-400">{content.images[3]?.label}</div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
