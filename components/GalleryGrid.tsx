"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Search, X, ChevronDown, Filter, SlidersHorizontal, ArrowUpDown, Share2, ShoppingCart, LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/products";
import InstantQuoteModal from "./InstantQuoteModal";
import ProductQuickView from "./ProductQuickView";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import HotDealsBanner from "./HotDealsBanner";
import CustomDropdown from "./CustomDropdown";

interface GalleryGridProps {
    parts: Product[];
}

type SortOption = "default" | "price-low" | "price-high" | "name-asc" | "name-desc";

export default function GalleryGrid({ parts }: GalleryGridProps) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("default");
    const [onlyInStock, setOnlyInStock] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
    const [quotingProduct, setQuotingProduct] = useState<Product | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const { addToCart, setIsCartOpen, cartCount } = useCart();

    // We'll simulate likes and comments as client-side state for now
    const [likes, setLikes] = useState<Record<string, number>>(
        Object.fromEntries(parts.map((p: Product) => [p.id, p.likes || 0]))
    );
    const [commentsCount] = useState<Record<string, number>>(
        Object.fromEntries(parts.map((p: Product) => [p.id, 0]))
    );

    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(parts.map(p => p.category)));
        return ["All", ...uniqueCategories.sort()];
    }, [parts]);

    const filteredAndSortedParts = useMemo(() => {
        const getPrice = (p: string | number) => typeof p === 'string' ? (parseFloat(p.replace(/[^0-9.]/g, '')) || 0) : p;
        const min = minPrice === "" ? 0 : parseFloat(minPrice) || 0;
        const max = maxPrice === "" ? Infinity : parseFloat(maxPrice) || Infinity;

        let result = parts.filter((part: Product) => {
            const price = getPrice(part.price);
            const matchesCategory = selectedCategory === "All" || part.category === selectedCategory;
            const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                part.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStock = !onlyInStock || part.inStock;
            const matchesPrice = price >= min && price <= max;

            return matchesCategory && matchesSearch && matchesStock && matchesPrice;
        });

        // Sorting logic
        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => getPrice(a.price) - getPrice(b.price));
                break;
            case "price-high":
                result.sort((a, b) => getPrice(b.price) - getPrice(a.price));
                break;
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        return result;
    }, [parts, selectedCategory, searchQuery, onlyInStock, sortBy, minPrice, maxPrice]);

    const paginatedParts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedParts.slice(start, start + itemsPerPage);
    }, [filteredAndSortedParts, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedParts.length / itemsPerPage);

    const handlePartClick = (partId: string) => {
        router.push(`/products/${partId}`);
    };

    const handleLike = async (e: React.MouseEvent, partId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const isLiked = likedProducts.has(partId);

        // Optimistic update
        setLikedProducts((prev: Set<string>) => {
            const newSet = new Set(prev);
            if (isLiked) {
                newSet.delete(partId);
                setLikes((l: Record<string, number>) => ({ ...l, [partId]: Math.max(0, l[partId] - 1) }));
            } else {
                newSet.add(partId);
                setLikes((l: Record<string, number>) => ({ ...l, [partId]: l[partId] + 1 }));
            }
            return newSet;
        });

        try {
            await fetch(`/api/products/${partId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: isLiked ? 'unlike' : 'like' })
            });
        } catch (error) {
            console.error("Failed to sync like", error);
        }
    };

    const handleShare = (part: Product) => {
        if (navigator.share) {
            navigator.share({
                title: part.name,
                text: part.description,
                url: window.location.origin + `/products/${part.id}`,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.origin + `/products/${part.id}`);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="space-y-12">
            {/* Top Search Bar - Sticky */}
            <div className="sticky top-20 z-40 py-4 bg-slate-950/80 backdrop-blur-xl -mx-4 px-4 border-b border-slate-900/50">
                <div className="relative w-full max-w-4xl mx-auto group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search precision parts, components..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-slate-900/60 border-2 border-slate-800 rounded-3xl py-5 pl-16 pr-16 text-white text-lg placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all shadow-2xl"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <aside className="w-full lg:w-80 shrink-0 sticky top-48 space-y-6 z-30">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-white font-bold mb-6 text-lg uppercase tracking-wider">
                            <Filter className="h-5 w-5 text-cyan-500" />
                            Filters
                        </div>

                        <CustomDropdown
                            label="Sort By"
                            value={sortBy}
                            onChange={(val) => setSortBy(val as SortOption)}
                            options={[
                                { value: "default", label: "Newest First" },
                                { value: "price-low", label: "Price: Low to High" },
                                { value: "price-high", label: "Price: High to Low" },
                                { value: "name-asc", label: "Name: A to Z" },
                                { value: "name-desc", label: "Name: Z to A" }
                            ]}
                            className="mb-8"
                        />

                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Categories</label>
                            <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {categories.map((category: string) => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setCurrentPage(1);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group",
                                            selectedCategory === category
                                                ? "bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20 shadow-[0_4px_12px_rgba(6,182,212,0.1)]"
                                                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                                        )}
                                    >
                                        {category}
                                        {selectedCategory === category && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Price Range (₹)</label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => {
                                            setMinPrice(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="text-slate-700 font-bold">—</div>
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => {
                                            setMaxPrice(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Items Per Page</label>
                            <div className="flex items-center gap-2">
                                {[25, 50, 100].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            setItemsPerPage(num);
                                            setCurrentPage(1);
                                        }}
                                        className={cn(
                                            "flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                                            itemsPerPage === num
                                                ? "bg-cyan-500 border-cyan-400 text-slate-950"
                                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                        )}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">Availability</label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={onlyInStock}
                                        onChange={() => {
                                            setOnlyInStock(!onlyInStock);
                                            setCurrentPage(1);
                                        }}
                                    />
                                    <div className={cn(
                                        "w-10 h-6 rounded-full transition-colors",
                                        onlyInStock ? "bg-cyan-500" : "bg-slate-800"
                                    )} />
                                    <div className={cn(
                                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md",
                                        onlyInStock ? "translate-x-4" : "translate-x-0"
                                    )} />
                                </div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Only In Stock</span>
                            </label>
                        </div>

                        {(selectedCategory !== "All" || searchQuery || sortBy !== "default" || onlyInStock || itemsPerPage !== 25 || minPrice || maxPrice) && (
                            <button
                                onClick={() => {
                                    setSelectedCategory("All");
                                    setSearchQuery("");
                                    setSortBy("default");
                                    setOnlyInStock(false);
                                    setItemsPerPage(25);
                                    setMinPrice("");
                                    setMaxPrice("");
                                    setCurrentPage(1);
                                }}
                                className="w-full mt-8 py-3 text-xs font-bold text-slate-500 hover:text-cyan-400 border border-slate-800 rounded-xl hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 bg-slate-950/50"
                            >
                                <X className="h-3 w-3" />
                                Reset All Filters
                            </button>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 border border-cyan-500/20 rounded-2xl p-6 hidden lg:block shadow-lg">
                        <h4 className="text-white font-bold mb-2">Custom Fabrication</h4>
                        <p className="text-cyan-100/60 text-xs leading-relaxed mb-4">
                            Don't see what you need? We specialize in one-off custom engineering solutions.
                        </p>
                        <button
                            onClick={() => router.push('/quote')}
                            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-black transition-all shadow-[0_4px_12px_rgba(6,182,212,0.3)]"
                        >
                            GET AI QUOTE
                        </button>
                    </div>
                </aside>

                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-900">
                        <div className="text-slate-400 text-sm">
                            Showing <span className="text-white font-bold">{filteredAndSortedParts.length}</span> results
                            {selectedCategory !== "All" && <span> for <span className="text-cyan-400 font-semibold">{selectedCategory}</span></span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        viewMode === "grid" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white"
                                    )}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        viewMode === "list" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white"
                                    )}
                                    title="List View"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {filteredAndSortedParts.length === 0 ? (
                        <div className="text-center py-24 bg-slate-900/20 border border-slate-900 rounded-3xl border-dashed">
                            <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-8 w-8 text-slate-600" />
                            </div>
                            <h3 className="text-white text-xl font-bold mb-2">Query matched no parts</h3>
                            <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                                Refine your search or categories to explore our precision-engineered collection.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedCategory("All");
                                    setSearchQuery("");
                                    setSortBy("default");
                                    setOnlyInStock(false);
                                }}
                                className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all border border-slate-700 hover:border-cyan-500/50"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            <div className={cn(
                                "grid gap-6",
                                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                            )}>
                                <AnimatePresence mode="popLayout">
                                    {paginatedParts.map((part: Product, index: number) => (
                                        <motion.div
                                            key={part.id}
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                            className={cn(
                                                "group relative bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer flex",
                                                viewMode === "grid" ? "flex-col h-full" : "flex-row h-48"
                                            )}
                                            onMouseEnter={() => setHoveredId(part.id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                            onClick={() => setSelectedQuickView(part)}
                                        >
                                            <div className={cn(
                                                "relative overflow-hidden bg-slate-950 shrink-0",
                                                viewMode === "grid" ? "h-60 w-full" : "h-full w-64"
                                            )}>
                                                <Image
                                                    src={part.image}
                                                    alt={part.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                                                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-950/80 text-cyan-400 border border-cyan-500/20 backdrop-blur-md">
                                                        {part.category}
                                                    </span>
                                                </div>

                                                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg",
                                                        part.inStock
                                                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    )}>
                                                        {part.inStock ? "In Stock" : "Out of Stock"}
                                                    </span>
                                                </div>

                                                <div className="absolute top-4 right-4 flex flex-col gap-2 z-30 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleLike(e, part.id)}
                                                        className={cn(
                                                            "p-2.5 rounded-full transition-all shadow-xl hover:scale-110 border backdrop-blur-md",
                                                            likedProducts.has(part.id)
                                                                ? "bg-red-500 text-white border-red-400 shadow-red-500/20"
                                                                : "bg-slate-900/60 text-white border-slate-700 hover:bg-slate-800"
                                                        )}
                                                        title="Add to Wishlist"
                                                    >
                                                        <Heart size={16} fill={likedProducts.has(part.id) ? "currentColor" : "none"} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleShare(part); }}
                                                        className="p-2.5 rounded-full transition-all shadow-xl hover:scale-110 bg-slate-900/60 text-white border border-slate-700 hover:bg-slate-800 backdrop-blur-md"
                                                        title="Share Part"
                                                    >
                                                        <Share2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-5 flex flex-col flex-1 bg-slate-900/20 backdrop-blur-sm">
                                                <div className="flex-1">
                                                    <h3 className="text-white font-bold text-lg mb-1 leading-tight group-hover:text-cyan-400 transition-colors line-clamp-1">
                                                        {part.name}
                                                    </h3>
                                                    <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                                                        {part.description}
                                                    </p>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Component Price</span>
                                                            <div className="flex items-center gap-1 text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded text-[10px] font-bold border border-red-400/20">
                                                                <Heart size={10} fill="currentColor" />
                                                                {likes[part.id] || 0}
                                                            </div>
                                                        </div>
                                                        <span className="text-xl font-bold text-white tracking-tight">
                                                            {part.price}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart(part);
                                                            setIsCartOpen(true);
                                                        }}
                                                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-3.5 rounded-2xl transition-all shadow-[0_4px_12px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.5)] hover:-translate-y-1 active:translate-y-0"
                                                        title="Add to AI Quote Cart"
                                                    >
                                                        <ShoppingCart className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-900">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronDown className="h-5 w-5 rotate-90" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                                                    currentPage === i + 1
                                                        ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                                                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                                                )}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronDown className="h-5 w-5 -rotate-90" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {quotingProduct && (
                    <InstantQuoteModal
                        product={quotingProduct}
                        onClose={() => setQuotingProduct(null)}
                    />
                )}

                {selectedQuickView && (
                    <ProductQuickView
                        product={selectedQuickView}
                        onClose={() => setSelectedQuickView(null)}
                    />
                )}
            </div>
        </div>
    );
}
