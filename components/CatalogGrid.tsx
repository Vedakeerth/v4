"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Package, Filter, ArrowRight, Search, ListFilter, SortAsc, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/products";
import ProductQuickView from "./ProductQuickView";
import CustomDropdown from "./CustomDropdown";


interface CatalogGridProps {
    products: Product[];
}

export default function CatalogGrid({ products }: CatalogGridProps) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("featured");
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100000 });
    const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);


    const filteredProducts = useMemo(() => {
        let result = [...products];

        // 1. Text Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // 2. Category Filter
        if (selectedCategory !== "All") {
            result = result.filter(p => p.category === selectedCategory);
        }

        // 3. Price Range Filter
        result = result.filter(p => {
            const price = typeof p.price === 'string'
                ? parseFloat(p.price.replace(/[^0-9.-]+/g, ""))
                : p.price;
            return price >= priceRange.min && price <= priceRange.max;
        });

        // 4. Sorting
        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => {
                    const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^0-9.-]+/g, "")) : a.price;
                    const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^0-9.-]+/g, "")) : b.price;
                    return priceA - priceB;
                });
                break;
            case "price-high":
                result.sort((a, b) => {
                    const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^0-9.-]+/g, "")) : a.price;
                    const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^0-9.-]+/g, "")) : b.price;
                    return priceB - priceA;
                });
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
    }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
        return ["All", ...uniqueCategories.sort()];
    }, [products]);

    return (
        <>
            {/* Filters Toolbar */}
            <div className="max-w-7xl mx-auto mb-12 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <CustomDropdown
                            label="Category"
                            value={selectedCategory}
                            onChange={(val) => setSelectedCategory(val)}
                            options={categories.map(cat => ({ value: cat, label: cat }))}
                            icon={<Filter className="h-4 w-4" />}
                        />

                        {/* Sort */}
                        <CustomDropdown
                            label="Sort By"
                            value={sortBy}
                            onChange={(val) => setSortBy(val)}
                            options={[
                                { value: "featured", label: "Featured" },
                                { value: "price-low", label: "Price: Low to High" },
                                { value: "price-high", label: "Price: High to Low" },
                                { value: "name-asc", label: "Name: A to Z" },
                                { value: "name-desc", label: "Name: Z to A" }
                            ]}
                            icon={<SortAsc className="h-4 w-4" />}
                        />

                        {/* Price Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Max Price: ₹{priceRange.max}</label>
                            <input
                                type="range"
                                min="0"
                                max="100000"
                                step="1000"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
                    <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                        {selectedCategory === "All"
                            ? "No products available."
                            : `No products found in category "${selectedCategory}".`}
                    </p>
                    {selectedCategory !== "All" && (
                        <button
                            onClick={() => setSelectedCategory("All")}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Show All Products
                        </button>
                    )}
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 group cursor-pointer"
                                onClick={() => setSelectedQuickView(product)}
                            >
                                <div className="relative h-64 w-full bg-slate-800">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${product.inStock
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                                }`}
                                        >
                                            {product.inStock ? "In Stock" : "Out of Stock"}
                                        </span>
                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-900/80 text-blue-400">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">{product.name}</h3>
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-blue-400 font-bold text-xl">
                                            {typeof product.price === 'number'
                                                ? `₹${product.price.toLocaleString('en-IN')}`
                                                : product.price.startsWith('₹') ? product.price : `₹${product.price}`}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-red-500 bg-red-500/5 px-2 py-1 rounded-lg border border-red-500/10">
                                            <Heart className="h-3.5 w-3.5" fill="currentColor" />
                                            <span className="text-xs font-bold">{product.likes || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/products/${product.id}`);
                                            }}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            View Details
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            <ProductQuickView
                product={selectedQuickView}
                onClose={() => setSelectedQuickView(null)}
            />
        </>
    );
}
