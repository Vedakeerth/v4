"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, ShoppingCart, Share2, Zap, Check, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { cn, parsePrice, formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/products";
import BuyNowModal from "./BuyNowModal";
import { useRouter } from "next/navigation";
import { createSeoSlug } from "@/lib/seo-utils";

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
    const router = useRouter();
    const displayColors = product.colors && product.colors.length > 0 ? product.colors : availableColors;
    const [selectedColor, setSelectedColor] = useState(product.defaultColor || (displayColors.includes('#000000') && product.name.toLowerCase().includes('plant') ? '#000000' : (displayColors[0] || '#2563eb')));
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showBuyNow, setShowBuyNow] = useState(false);
    const { addToCart } = useCart();
    const [likedSimilarIds, setLikedSimilarIds] = useState<Record<string, boolean>>({});
    const [localSimilarLikes, setLocalSimilarLikes] = useState<Record<string, number>>({});
    const [showFullDetails, setShowFullDetails] = useState(false);

    const rawImages = [
        product.image,
        ...(Array.isArray(product.images) ? product.images : [])
    ].filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
    const images = Array.from(new Set(rawImages));
    const displayImages = images.length > 0 ? images : ['/placeholder.png'];
    const safeImageIndex = currentImageIndex < displayImages.length ? currentImageIndex : 0;

    // Auto-slideshow: advance every 4 seconds; resets on manual navigation
    const slideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startSlideTimer = () => {
        if (slideTimerRef.current) clearInterval(slideTimerRef.current);
        if (displayImages.length <= 1) return;
        slideTimerRef.current = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % displayImages.length);
        }, 4000);
    };

    useEffect(() => {
        startSlideTimer();
        return () => { if (slideTimerRef.current) clearInterval(slideTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayImages.length]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
        startSlideTimer(); // reset timer on manual nav
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
        startSlideTimer(); // reset timer on manual nav
    };

    const handleAddToCart = () => {
        addToCart(product, selectedColor, quantity);
    };

    return (
        <div className="dynamic-container py-8 md:py-12 px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link
                    href="/gallery"
                    className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="mr-2 h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                    {pageData?.backButton || "Back to Gallery"}
                </Link>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 mb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                >
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl group">
                        {displayImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-70 group-hover:opacity-100 backdrop-blur-sm"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-70 group-hover:opacity-100 backdrop-blur-sm"
                                >
                                    <ChevronRight size={24} />
                                </button>
                                {/* Dot indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                                    {displayImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setCurrentImageIndex(idx); startSlideTimer(); }}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === safeImageIndex ? 'bg-cyan-400 w-5' : 'bg-white/50 hover:bg-white/80'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                        {/* Blurred Background */}
                        <Image
                            src={displayImages[safeImageIndex]}
                            alt={`${product.name} background`}
                            fill
                            className="object-cover opacity-30 blur-2xl scale-110"
                            priority
                            unoptimized={displayImages[safeImageIndex]?.includes('/api/') || displayImages[safeImageIndex]?.includes('mega.nz')}
                        />
                        {/* Contained Foreground */}
                        <div className="absolute inset-0">
                            <Image
                                src={displayImages[safeImageIndex]}
                                alt={product.name}
                                fill
                                className="object-contain"
                                priority
                                unoptimized={displayImages[safeImageIndex]?.includes('/api/') || displayImages[safeImageIndex]?.includes('mega.nz')}
                            />
                        </div>

                        {/* Tags */}
                        <div className="absolute top-6 left-6 flex gap-2">
                            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-cyan-500 text-white shadow-md shadow-cyan-500/20 backdrop-blur-md">
                                {product.category}
                            </span>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {displayImages.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {displayImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={cn(
                                        "relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all",
                                        idx === safeImageIndex
                                            ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/20"
                                            : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-400 dark:border-slate-600"
                                    )}
                                >
                                    <Image
                                        src={img}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        unoptimized={img?.includes('/api/') || img?.includes('mega.nz')}
                                    />
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
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all border",
                                    isLiked
                                        ? "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20"
                                        : "bg-red-500/5 text-red-500 border-red-500/20"
                                )}>
                                    <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                                    { (product.likes || 0) + (isLiked ? 1 : 0) }
                                </div>
                                <button
                                    onClick={() => setIsLiked(!isLiked)}
                                    className={cn(
                                        "p-3 rounded-full transition-all border",
                                        isLiked
                                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:bg-slate-700"
                                    )}
                                >
                                    <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-end gap-4 mb-6">
                            <span className="text-3xl font-bold text-cyan-400">
                                {formatINR(product.price)}
                            </span>
                            {product.mrp && (
                                <span className="text-lg text-slate-400 font-medium line-through mb-1">
                                    MRP {formatINR(product.mrp)}
                                </span>
                            )}
                            <div className="flex items-center gap-2 ml-auto mb-1">
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
                                    <span className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        {product.stockCount} Units Available
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Configuration & Purchase Options */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                        {/* Color */}
                        <div>
                            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 block">
                                {pageData?.finishLabel || "Finished Color"}
                            </label>
                            <div className="flex gap-4 flex-wrap">
                                {displayColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            "w-12 h-12 rounded-full transition-all flex items-center justify-center shadow-md",
                                            selectedColor === color
                                                ? "ring-2 ring-offset-4 ring-cyan-500 ring-offset-slate-50 dark:ring-offset-slate-900 scale-110"
                                                : "border-2 border-slate-300 dark:border-slate-600 hover:scale-110 opacity-80 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: color }}
                                        title={getColorName(color)}
                                    >
                                        {selectedColor === color && (
                                            <Check className={cn("w-6 h-6", ['#ffffff', '#eab308'].includes(color) ? "text-slate-900" : "text-white")} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                                Selected: <span className="text-slate-900 dark:text-white font-medium">{getColorName(selectedColor)}</span>
                            </p>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        {/* Quantity */}
                        <div>
                            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 block">
                                {pageData?.quantityLabel || "Quantity"}
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-white dark:bg-slate-950 rounded-lg p-1.5 border border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                                    >
                                        <span className="text-xl">-</span>
                                    </button>
                                    <span className="w-16 text-center font-bold text-slate-900 dark:text-white text-lg">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                                    >
                                        <span className="text-xl">+</span>
                                    </button>
                                </div>
                                <div className="text-slate-700 dark:text-slate-300">
                                    {pageData?.totalLabel || "Total"}: <span className="text-cyan-400 font-bold text-xl ml-2">
                                        ₹{(parsePrice(product.price) * quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons: Buy Now & Add to Cart */}
                        <div className="pt-2 flex flex-col gap-4">
                            <button
                                onClick={() => {
                                    // Clear cart and add only this item for "Buy Now"
                                    localStorage.removeItem('veda_cart'); // Direct clear to be safe
                                    addToCart(product, selectedColor, quantity, false);
                                    router.push('/checkout');
                                }}
                                disabled={!product.inStock}
                                className={cn(
                                    "w-full py-5 px-8 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl group",
                                    product.inStock
                                        ? "bg-cyan-400 hover:bg-cyan-500 text-slate-950 shadow-cyan-400/20 hover:scale-[1.02]"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                                )}
                            >
                                <Zap className={cn("w-6 h-6", product.inStock && "group-hover:scale-110 transition-transform")} fill="currentColor" />
                                {product.inStock ? "Buy Now" : "Out of Stock"}
                            </button>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock}
                                    className={cn(
                                        "flex-1 py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all border",
                                        product.inStock
                                            ? "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-lg"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                                    )}
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    {product.inStock ? (pageData?.addToCartButton || "Add to Cart") : (pageData?.outOfStockButton || "Out of Stock")}
                                </button>
                                <button className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 hover:text-white transition-colors">
                                    <Share2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Details Container with partial preview + fade out */}
                    <div className="pt-2">
                        {/* Specifications / Product Details */}
                        {(product.weight || product.length || product.width || product.height || product.category) && (
                            <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                                    Product Specifications
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="p-3 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weight</span>
                                        <span className="text-base font-bold text-slate-900 dark:text-white">{product.weight || 0}g</span>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Length</span>
                                        <span className="text-base font-bold text-slate-900 dark:text-white">{product.length || 0}cm</span>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Width</span>
                                        <span className="text-base font-bold text-slate-900 dark:text-white">{product.width || 0}cm</span>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Height</span>
                                        <span className="text-base font-bold text-slate-900 dark:text-white">{product.height || 0}cm</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description Section with Partial Fade-Out */}
                        {(() => {
                            if (!product.description) return null;
                            const hasHtml = /<[a-z][\s\S]*>/i.test(product.description);
                            return (
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                                        About This Product
                                    </h3>
                                    <div className="relative">
                                        <div
                                            className={cn(
                                                "overflow-hidden transition-all duration-500",
                                                showFullDetails ? "max-h-[3000px]" : "max-h-36"
                                            )}
                                        >
                                            {hasHtml ? (
                                                <div
                                                    className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-h1:text-2xl prose-h1:mb-3 prose-h2:text-xl prose-h2:mb-2 prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-p:my-2 prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-1 prose-strong:text-slate-900 dark:prose-strong:text-white prose-a:text-cyan-500 hover:prose-a:underline"
                                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                                />
                                            ) : (
                                                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-line">
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Fade Out Gradient Overlay when collapsed */}
                                        {!showFullDetails && (
                                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
                                        )}
                                    </div>

                                    {/* Show Details / Show Less Button */}
                                    <div className="pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowFullDetails(prev => !prev)}
                                            className="w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-all shadow-sm"
                                        >
                                            <span>{showFullDetails ? "Show Less" : "Show Full Details"}</span>
                                            {showFullDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </motion.div>
            </div>


            {/* Buy Now Modal */}
            {showBuyNow && (
                <BuyNowModal
                    product={product}
                    quantity={quantity}
                    selectedColor={selectedColor}
                    onClose={() => setShowBuyNow(false)}
                />
            )}

            {/* Similar Products Section */}
            {similarProducts && similarProducts.length > 0 && (
                <section className="mt-12 pt-16 border-t border-slate-100 dark:border-slate-900">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-cyan-500 rounded-full" />
                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                Similar <span className="text-cyan-500">Products</span>
                            </h2>
                        </div>
                        <Link href="/gallery" className="px-6 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] hover:border-cyan-500 hover:text-cyan-500 transition-all shadow-xl group flex items-center gap-2">
                            Explore More <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {similarProducts.slice(0, 4).map((p) => (
                            <div 
                                key={p.id}
                                className="group bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 flex flex-col"
                            >
                                <Link href={`/gallery/${createSeoSlug(p.name, p.id)}`} className="relative aspect-[16/10] overflow-hidden block">
                                    <Image 
                                        src={p.image} 
                                        alt={p.name} 
                                        fill 
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        unoptimized={p.image?.includes('/api/') || p.image?.includes('mega.nz')}
                                    />
                                    
                                    {/* Stock Badge - Left Side */}
                                    <div className="absolute top-3 left-3">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-white shadow-lg",
                                            String(p.id).includes('out') ? "bg-red-500" : "bg-emerald-500"
                                        )}>
                                            {String(p.id).includes('out') ? 'Out of Stock' : 'In Stock'}
                                        </span>
                                    </div>

                                    {/* Top Right Heart Button */}
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const isLiked = likedSimilarIds[p.id];
                                            setLikedSimilarIds(prev => ({ ...prev, [p.id]: !isLiked }));
                                            setLocalSimilarLikes(prev => ({
                                                ...prev,
                                                [p.id]: (prev[p.id] || p.likes || 0) + (isLiked ? -1 : 1)
                                            }));
                                        }}
                                        className={cn(
                                            "absolute top-3 right-3 p-2 backdrop-blur-md rounded-lg border transition-all shadow-md group/heart",
                                            likedSimilarIds[p.id] 
                                                ? "bg-red-500 text-white border-red-600 scale-110" 
                                                : "bg-white/90 dark:bg-slate-950/80 text-slate-400 border-slate-200 dark:border-slate-800 hover:text-red-500"
                                        )}
                                        title={likedSimilarIds[p.id] ? "Unlike" : "Like"}
                                    >
                                        <Heart size={14} fill={likedSimilarIds[p.id] ? "currentColor" : "none"} className="group-hover/heart:scale-110 transition-transform" />
                                    </button>
                                </Link>

                                <div className="p-5 flex-1 flex flex-col">
                                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">
                                        {p.category}
                                    </span>
                                    <Link href={`/gallery/${createSeoSlug(p.name, p.id)}`}>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 line-clamp-1 group-hover:text-cyan-500 transition-colors uppercase tracking-tight italic">
                                            {p.name}
                                        </h3>
                                    </Link>
                                    
                                    <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-lg font-black text-slate-950 dark:text-white tracking-tighter">
                                                    {formatINR(p.price)}
                                                </span>
                                                <div className={cn(
                                                    "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full transition-colors",
                                                    likedSimilarIds[p.id] ? "text-white bg-red-500" : "text-red-500 bg-red-500/5"
                                                )}>
                                                    <Heart size={10} fill="currentColor" />
                                                    {localSimilarLikes[p.id] ?? (p.likes || 0)}
                                                </div>
                                            </div>
                                            {p.mrp && (
                                                <span className="text-[10px] text-slate-400 font-bold line-through">
                                                    MRP {formatINR(p.mrp)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (navigator.share) {
                                                        navigator.share({
                                                            title: p.name,
                                                            url: `${window.location.origin}/gallery/${createSeoSlug(p.name, p.id)}`
                                                        });
                                                    }
                                                }}
                                                className="p-2 text-slate-400 hover:text-cyan-500 transition-colors"
                                                title="Share"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(p, p.colors?.[0] || undefined, 1);
                                                }}
                                                className="p-2 text-slate-400 hover:text-cyan-500 transition-colors"
                                                title="Add to Cart"
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
