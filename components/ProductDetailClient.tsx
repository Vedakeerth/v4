"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, ShoppingCart, Share2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/products";

interface ProductDetailClientProps {
    product: Product;
    similarProducts: Product[];
    pageData: any;
}

const availableColors = ['#2563eb', '#ef4444', '#22c55e', '#eab308', '#ffffff', '#000000'];

const getColorName = (color: string) => {
    const colorMap: Record<string, string> = {
        '#2563eb': 'Blue',
        '#ef4444': 'Red',
        '#22c55e': 'Green',
        '#eab308': 'Yellow',
        '#ffffff': 'White',
        '#000000': 'Black'
    };
    return colorMap[color] || 'Custom';
};

export default function ProductDetailClient({ product, similarProducts, pageData }: ProductDetailClientProps) {
    const [selectedColor, setSelectedColor] = useState(product.name.toLowerCase().includes('plant') ? '#000000' : '#2563eb');
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const { addToCart } = useCart();

    const images = product.images && product.images.length > 0 ? product.images : [product.image];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleAddToCart = () => {
        addToCart(product, selectedColor, quantity);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link
                    href="/gallery"
                    className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="mr-2 h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                    {pageData?.backButton || "Back to Gallery"}
                </Link>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                >
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group">
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                        <Image
                            src={images[currentImageIndex]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />

                        {/* Tags */}
                        <div className="absolute top-6 left-6 flex gap-2">
                            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-slate-950/80 text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
                                {product.category}
                            </span>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={cn(
                                        "relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all",
                                        idx === currentImageIndex
                                            ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/20"
                                            : "border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600"
                                    )}
                                >
                                    <Image src={img} alt="" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-8 lg:pl-8"
                >
                    <div>
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={cn(
                                    "p-3 rounded-full transition-all border",
                                    isLiked
                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                                )}
                            >
                                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                            </button>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-3xl font-bold text-cyan-400">
                                {product.price}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    product.availabilityStatus === "In Stock" || (product.inStock && !product.availabilityStatus)
                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                        : product.availabilityStatus === "Pre-order"
                                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                )}>
                                    {product.availabilityStatus || (product.inStock ? "In Stock" : "Out of Stock")}
                                </span>
                                {product.stockCount !== undefined && product.stockCount > 0 && (
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                        {product.stockCount} Units Available
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            {product.description}
                        </p>

                    </div>

                    {/* Configuration */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
                        {/* Color */}
                        <div>
                            <label className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 block">
                                {pageData?.finishLabel || "Select Finish / Color"}
                            </label>
                            <div className="flex gap-4 flex-wrap">
                                {availableColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            "w-12 h-12 rounded-full border-2 transition-transform hover:scale-110 shadow-lg",
                                            selectedColor === color
                                                ? "border-white scale-110 ring-4 ring-cyan-500/30"
                                                : "border-slate-600"
                                        )}
                                        style={{ backgroundColor: color }}
                                        title={getColorName(color)}
                                    />
                                ))}
                            </div>
                            <p className="mt-3 text-sm text-slate-400">
                                Selected: <span className="text-white font-medium">{getColorName(selectedColor)}</span>
                            </p>
                        </div>

                        <div className="h-px bg-slate-800" />

                        {/* Quantity */}
                        <div>
                            <label className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 block">
                                {pageData?.quantityLabel || "Quantity"}
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-slate-950 rounded-lg p-1.5 border border-slate-800">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                                    >
                                        <span className="text-xl">-</span>
                                    </button>
                                    <span className="w-16 text-center font-bold text-white text-lg">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                                    >
                                        <span className="text-xl">+</span>
                                    </button>
                                </div>
                                <div className="text-slate-400">
                                    {pageData?.totalLabel || "Total"}: <span className="text-cyan-400 font-bold text-xl ml-2">
                                        ₹{(parseFloat(product.price.replace(/[^0-9.]/g, '')) * quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.inStock}
                            className={cn(
                                "flex-1 py-4 px-8 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl",
                                product.inStock
                                    ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-900/30 hover:shadow-cyan-900/50 hover:scale-[1.02]"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            )}
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {product.inStock ? (pageData?.addToCartButton || "Add to Cart") : (pageData?.outOfStockButton || "Out of Stock")}
                        </button>
                        <button className="w-14 h-14 flex items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                            <Share2 className="w-6 h-6" />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="border-t border-slate-800 pt-16"
                >
                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="w-1 h-8 bg-cyan-500 rounded-full" />
                        {pageData?.similarProductsTitle || "Similar Products"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {similarProducts.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                            >
                                <Link
                                    href={`/products/${item.id}`}
                                    className="block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-900/20 transition-all group"
                                >
                                    <div className="relative h-48 w-full bg-slate-800">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.inStock
                                                ? "bg-green-500/90 text-white shadow-sm"
                                                : "bg-red-500/90 text-white shadow-sm"
                                                }`}>
                                                {item.inStock ? "IN STOCK" : "OUT OF STOCK"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="mb-2 text-xs font-medium text-cyan-400 uppercase tracking-widest">
                                            {item.category}
                                        </div>
                                        <h3 className="text-white font-semibold mb-2 truncate group-hover:text-cyan-400 transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="text-slate-300 font-bold">
                                            {item.price}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}
        </div>
    );
}
