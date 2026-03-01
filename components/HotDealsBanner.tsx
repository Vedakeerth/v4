"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Tag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dealsData from "@/data/deals.json";

interface Deal {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    discount: string;
    image: string;
    color: string;
    cta: string;
    link: string;
}

export default function HotDealsBanner() {
    const [currentDeal, setCurrentDeal] = useState(0);
    const deals: Deal[] = dealsData as any;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDeal((prev) => (prev + 1) % deals.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [deals.length]);

    const nextDeal = () => setCurrentDeal((prev) => (prev + 1) % deals.length);
    const prevDeal = () => setCurrentDeal((prev) => (prev - 1 + deals.length) % deals.length);

    return (
        <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Sparkles className="text-slate-950" size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Hot Deals & Special Offers</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-4" />
                </div>

                <div className="relative h-[400px] md:h-[350px] w-full bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 group shadow-2xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentDeal}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.6, ease: "circOut" }}
                            className="absolute inset-0 flex flex-col md:flex-row"
                        >
                            {/* Content side */}
                            <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                                        Limited Offer
                                    </span>
                                    <span className="text-cyan-400 font-bold text-xs uppercase tracking-widest">
                                        {deals[currentDeal].subtitle}
                                    </span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                                    {deals[currentDeal].title}
                                </h3>
                                <p className="text-slate-400 text-lg mb-8 line-clamp-2 italic">
                                    {deals[currentDeal].description}
                                </p>
                                <div className="flex items-center gap-6">
                                    <Link href={deals[currentDeal].link} className="contents">
                                        <button className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 group">
                                            {deals[currentDeal].cta}
                                            <ArrowRight size={18} className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Save Up To</span>
                                        <span className="text-3xl font-black text-cyan-500 tracking-tighter">{deals[currentDeal].discount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Image side */}
                            <div className="hidden md:block w-1/2 relative bg-slate-950">
                                <Image
                                    src={deals[currentDeal].image}
                                    alt={deals[currentDeal].title}
                                    fill
                                    className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-transparent to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />

                                {/* Decoration */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-cyan-500/10 rounded-full animate-pulse" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-cyan-500/5 rounded-full animate-ping" />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="absolute bottom-10 left-10 md:left-16 flex items-center gap-4 z-20">
                        <button
                            onClick={prevDeal}
                            className="p-3 bg-slate-950/50 hover:bg-slate-800 text-white rounded-xl border border-slate-800/50 transition-all backdrop-blur-md"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-2">
                            {deals.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentDeal(i)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentDeal === i ? "bg-cyan-500 w-8" : "bg-slate-700 hover:bg-slate-600"}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={nextDeal}
                            className="p-3 bg-slate-950/50 hover:bg-slate-800 text-white rounded-xl border border-slate-800/50 transition-all backdrop-blur-md"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Static Background Pattern */}
                    <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-20">
                        <div className="absolute inset-0 grid grid-cols-10 gap-2 p-4">
                            {Array.from({ length: 100 }).map((_, i) => (
                                <div key={i} className="w-1 h-1 bg-cyan-500 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
