"use client";

import React from "react";
import { X, Info, ShoppingCart, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

interface ProductQuickViewProps {
    product: Product | null;
    onClose: () => void;
}

export default function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
    const [activeImageIndex, setActiveImageIndex] = React.useState(0);
    const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
    const [quantity, setQuantity] = React.useState(1);
    const { addToCart } = useCart();

    React.useEffect(() => {
        if (!product?.images?.length) return;

        const interval = setInterval(() => {
            setActiveImageIndex((prev) => (prev + 1) % (product?.images?.length || 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [product]);

    React.useEffect(() => {
        if (product?.colors?.length) {
            setSelectedColor(product.colors[0]);
        }
        setQuantity(1);
        setActiveImageIndex(0);
    }, [product]);

    const handlePrev = () => {
        if (!product?.images?.length) return;
        setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    const handleNext = () => {
        if (!product?.images?.length) return;
        setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    };

    if (!product) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 border border-slate-800 w-full max-w-[85vw] lg:max-w-[75vw] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative cursor-default"
                >

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-[200] p-3 bg-slate-950/80 hover:bg-slate-800 text-white rounded-full backdrop-blur-md transition-all border border-slate-800/50 shadow-xl"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col lg:flex-row h-full max-h-[90vh] lg:max-h-[85vh] overflow-hidden">
                        {/* Image Section */}
                        <div className="w-full lg:w-3/5 h-[40vh] lg:h-auto relative bg-slate-950 group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeImageIndex}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={product.images?.[activeImageIndex] || product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50" />

                            {/* Navigation Arrows */}
                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-slate-950/40 hover:bg-slate-950/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-slate-950/40 hover:bg-slate-950/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Slideshow Pagination */}
                            {product.images?.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                    {product.images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImageIndex(i)}
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                activeImageIndex === i ? "bg-cyan-500 w-6 shadow-[0_0_10px_rgba(6,182,212,0.8)]" : "bg-white/30 hover:bg-white/50"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="absolute top-6 left-6 flex gap-2 z-20">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${product?.inStock
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}>
                                    {product?.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="w-full lg:w-2/5 p-8 lg:p-14 flex flex-col bg-slate-900 overflow-y-auto custom-scrollbar">
                            <div className="mb-4">
                                <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/5 px-3 py-1 rounded-md border border-cyan-500/10">
                                    {product.category}
                                </span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
                                {product.name}
                            </h2>
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-3xl font-black text-cyan-500 flex items-baseline gap-2">
                                    {product?.price
                                        ? (typeof product.price === 'number'
                                            ? `₹${product.price.toLocaleString('en-IN')}`
                                            : product.price.startsWith('₹') ? product.price : `₹${product.price}`)
                                        : "₹0"}
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">per unit</span>
                                </div>
                                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1.5 rounded-xl border border-red-400/20 shadow-lg shadow-red-500/5">
                                    <Heart size={18} fill="currentColor" />
                                    <span className="text-lg font-black">{product?.likes || 0}</span>
                                </div>
                            </div>

                            <div className="bg-slate-950/30 border border-slate-800/50 rounded-2xl p-6 mb-8">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 block">Engineering description</label>
                                <p className="text-slate-400 text-sm leading-relaxed italic">
                                    "{product.description}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                {/* Color Selection */}
                                {product.colors && product.colors.length > 0 && (
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 block">Material Color</label>
                                        <div className="flex flex-wrap gap-3">
                                            {product.colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg border-2 transition-all duration-300 relative group",
                                                        selectedColor === color
                                                            ? "border-cyan-500 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                                            : "border-slate-800 hover:border-slate-600"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                >
                                                    {selectedColor === color && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Selector */}
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 block">Quantity</label>
                                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1.5 w-fit">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-10 text-center font-bold text-white">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-800/50 space-y-4">
                                <button
                                    onClick={() => {
                                        addToCart(product, selectedColor || undefined, quantity);
                                        onClose();
                                    }}
                                    className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 text-lg group"
                                >
                                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                                    Add to Quote Cart
                                </button>

                                <div className="flex gap-4">
                                    <Link
                                        href={`/products/${product.id}`}
                                        onClick={onClose}
                                        className="flex-1"
                                    >
                                        <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2">
                                            <Info size={18} />
                                            Full Details
                                        </button>
                                    </Link>
                                    <button className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700">
                                        <Heart size={20} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-8 text-center font-bold">
                                Free premium delivery on all machine orders
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

        </AnimatePresence>
    );
}
