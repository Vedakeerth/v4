"use client";

import React from "react";
import { X, Info, ShoppingCart, Heart, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { cn, parsePrice, formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import BuyNowModal from "./BuyNowModal";
import Link from "next/link";
import { createSeoSlug } from "@/lib/seo-utils";

interface ProductQuickViewProps {
    product: Product | null;
    onClose: () => void;
}

export default function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
    const router = useRouter();
    const [activeImageIndex, setActiveImageIndex] = React.useState(0);
    const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
    const [quantity, setQuantity] = React.useState(1);
    const [showBuyNow, setShowBuyNow] = React.useState(false);
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
                key="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-white dark:bg-slate-950 backdrop-blur-xl cursor-pointer"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-[90vw] lg:max-w-[80vw] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative cursor-default"
                >

                     <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-[200] p-3 bg-white dark:bg-slate-950/80 hover:bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full backdrop-blur-md transition-all border border-slate-200 dark:border-slate-800/50 shadow-xl"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col lg:flex-row h-full max-h-[92vh] lg:max-h-[88vh] overflow-hidden">
                        {/* Image Section */}
                        <div className="w-full lg:w-3/5 h-[30vh] lg:h-auto relative bg-white dark:bg-slate-950 group">
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
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-950/80 text-slate-900 dark:text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-950/80 text-slate-900 dark:text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
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
                        <div className="w-full lg:w-2/5 p-6 lg:p-12 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar">
                            <div className="mb-4">
                                <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/5 px-3 py-1 rounded-md border border-cyan-500/10">
                                    {product.category}
                                </span>
                            </div>
                            <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">
                                {product.name}
                            </h2>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 flex items-baseline gap-2">
                                    {formatINR(product.price)}
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">per unit</span>
                                </div>
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                                    <Heart size={18} fill="currentColor" />
                                    <span className="text-lg font-black">{product?.likes || 0}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 mb-3">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Engineering description</label>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                                    "{product.description}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Color Selection */}
                                {product.colors && product.colors.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Material Color</label>
                                        <div className="flex flex-wrap gap-3">
                                            {product.colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg border-2 transition-all duration-300 relative group",
                                                        selectedColor === color
                                                            ? "border-cyan-500 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
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
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Quantity</label>
                                    <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 w-fit">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-900 dark:text-white transition-all"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-10 text-center font-bold text-slate-900 dark:text-white">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-900 dark:text-white transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                {/* Primary Action: Buy Now */}
                                <button
                                    onClick={() => {
                                        // Clear cart and add only this item for "Buy Now"
                                        localStorage.removeItem('veda_cart'); // Direct clear to be safe
                                        addToCart(product, selectedColor || undefined, quantity, false);
                                        router.push('/checkout');
                                    }}
                                    disabled={!product.inStock}
                                    className="w-full py-6 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-3 text-lg group disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Zap size={24} className="group-hover:scale-110 transition-transform" fill="currentColor" />
                                    Buy Now
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Add to Cart */}
                                    <button
                                        onClick={() => {
                                            addToCart(product, selectedColor || undefined, quantity);
                                            onClose();
                                        }}
                                        className="w-full py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-sm group"
                                    >
                                        <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                                        Add to Cart
                                    </button>

                                    <Link
                                        href={`/gallery/${createSeoSlug(product.name, product.id)}`}
                                        onClick={onClose}
                                        className="w-full"
                                    >
                                        <button className="w-full h-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-sm">
                                            <Info size={18} />
                                            Details
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-4 text-center font-bold">
                                Free premium delivery on machines
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Buy Now Modal */}
            {showBuyNow && (
                <BuyNowModal
                    product={product}
                    quantity={quantity}
                    selectedColor={selectedColor}
                    onClose={() => setShowBuyNow(false)}
                />
            )}
        </AnimatePresence>
    );
}
