'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingCart, Info, Printer, Cpu, PenLine } from 'lucide-react';
import { Skeleton } from './Skeleton';
import ProductQuickView from './ProductQuickView';


const ICON_MAP: Record<string, any> = {
    Printer,
    Cpu,
    PenLine
};

import { Product } from "@/lib/products";


interface ProductShowcaseProps {
    header: {
        title: string;
        titleHighlight: string;
        suffix: string;
        description: string;
        ctaText: string;
        ctaLink: string;
    };
    categories: { id: string; label: string; icon: string }[];
    products: Product[];
    delay?: number;
}

export default function ProductShowcase({ header, categories, products: initialProducts, delay = 0 }: ProductShowcaseProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '3D Printers');
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(delay === 0);

    const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

    useEffect(() => {
        if (delay > 0) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, delay * 1000);
            return () => clearTimeout(timer);
        }
    }, [delay]);

    // Initial filtering to avoid showing empty tab if possible
    const availableCategories = categories.filter(cat => products.some(p => p.category === cat.id));

    // Safety check - if activeCategory is hidden/empty, switch to first available
    useEffect(() => {
        if (availableCategories.length > 0 && !availableCategories.find(c => c.id === activeCategory)) {
            setActiveCategory(availableCategories[0].id);
        }
    }, [products, categories, activeCategory]);

    const filteredProducts = products.filter(p => p.category === activeCategory);

    if (!isVisible) return null;

    return (
        <section className="py-24 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        {header.title} <span className="text-cyan-500">{header.titleHighlight}</span> {header.suffix}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        {header.description}
                    </motion.p>
                </div>

                {/* Category Navigation */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {categories.filter(cat => products.some(p => p.category === cat.id)).map((cat) => {
                        const Icon = ICON_MAP[cat.icon] || Printer;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 border ${activeCategory === cat.id
                                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                                    }`}
                            >
                                <Icon size={20} className={activeCategory === cat.id ? "text-slate-950" : "text-cyan-500"} />
                                {cat.label}
                                {activeCategory === cat.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Product Grid */}
                <div className="min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                                <Skeleton variant="rounded" height={400} className="rounded-3xl" />
                                <Skeleton variant="rounded" height={400} className="rounded-3xl" />
                            </div>
                        ) : (
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
                            >
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => setSelectedQuickView(product)}
                                        className="group flex flex-col md:flex-row bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 cursor-pointer"
                                    >
                                        <div className="relative w-full md:w-2/5 aspect-square md:aspect-auto h-64 md:h-auto overflow-hidden bg-slate-950">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="flex-1 p-8 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="px-3 py-1 rounded-full bg-slate-800 text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-slate-700">
                                                        {product.inStock ? "Ready to Ship" : "Backorder"}
                                                    </span>
                                                    <span className="text-xl font-bold text-white">
                                                        {typeof product.price === 'number'
                                                            ? `₹${product.price.toLocaleString('en-IN')}`
                                                            : product.price.startsWith('₹') ? product.price : `₹${product.price}`}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                                    {product.description}
                                                </p>
                                            </div>
                                            <div className="flex gap-3 mt-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/products/${product.id}`;
                                                    }}
                                                    className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all duration-300 shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingCart size={18} />
                                                    Order Now
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/products/${product.id}`;
                                                    }}
                                                    className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all duration-300"
                                                >
                                                    <Info size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <ProductQuickView
                    product={selectedQuickView}
                    onClose={() => setSelectedQuickView(null)}
                />


                <div className="mt-16 text-center">
                    <Link href={header.ctaLink}>
                        <button className="px-10 py-4 rounded-full border border-slate-800 text-white font-bold hover:bg-slate-900 transition-all duration-300 flex items-center gap-3 mx-auto">
                            {header.ctaText}
                            <ArrowRight size={20} />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
