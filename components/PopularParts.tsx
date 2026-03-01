'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, HeartOff } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    category: string;
    isPopular?: boolean;
}

interface PopularPartsProps {
    header: {
        title: string;
        titleHighlight: string;
        description: string;
        ctaText: string;
        ctaLink: string;
    };
    parts: Product[];
}

export default function PopularParts({ header, parts }: PopularPartsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [liked, setLiked] = useState<Record<number, boolean>>({});
    const [likes, setLikes] = useState<Record<number, number>>({});

    useEffect(() => {
        // Initialize likes if not present
        const initialLikes: Record<number, number> = {};
        parts.forEach(p => {
            initialLikes[p.id] = Math.floor(Math.random() * 20) + 5;
        });
        setLikes(initialLikes);
    }, [parts]);

    const toggleLike = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        setLiked(prev => {
            const isLiked = !prev[id];
            setLikes(l => ({ ...l, [id]: isLiked ? l[id] + 1 : Math.max(0, l[id] - 1) }));
            return { ...prev, [id]: isLiked };
        });
    };

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold text-white mb-4"
                        >
                            {header.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{header.titleHighlight}</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 text-lg"
                        >
                            {header.description}
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Link href={header.ctaLink} className="group inline-flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                            {header.ctaText}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                <Skeleton variant="rounded" height={240} className="mb-4" />
                                <Skeleton variant="text" width="60%" height={24} className="mb-2" />
                                <Skeleton variant="text" width="100%" height={16} />
                            </div>
                        ))
                    ) : (
                        parts.map((part, index) => (
                            <motion.div
                                key={part.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500"
                            >
                                <div className="relative h-64 w-full overflow-hidden">
                                    <Image
                                        src={part.image}
                                        alt={part.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                                    <button
                                        onClick={(e) => toggleLike(e, part.id)}
                                        className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/80 border border-slate-800 text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all duration-300 z-20 backdrop-blur-md"
                                    >
                                        {liked[part.id] ? (
                                            <Heart size={18} className="fill-red-500 text-red-500" />
                                        ) : (
                                            <Heart size={18} />
                                        )}
                                    </button>

                                    <div className="absolute bottom-4 left-4 z-10">
                                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30 backdrop-blur-sm">
                                            {part.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                        {part.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                                        {part.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex items-center gap-1 text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded text-[10px] font-bold border border-red-400/20">
                                                    <Heart size={10} fill={liked[part.id] ? "currentColor" : "none"} />
                                                    {likes[part.id] || 0}
                                                </div>
                                            </div>
                                            <span className="text-2xl font-bold text-white">{part.price}</span>
                                        </div>
                                        <Link href={`/products/${part.id}`}>
                                            <button className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 text-white hover:text-slate-950 font-bold text-sm transition-all duration-300 border border-slate-700 hover:border-cyan-400">
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
