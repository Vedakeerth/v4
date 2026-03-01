"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Package, ShoppingCart } from "lucide-react";
import { Skeleton } from "./Skeleton";
import Link from "next/link";
import ProductQuickView from "./ProductQuickView";


import { Product } from "@/lib/products";


interface ProductsProps {
    products: Product[];
    isLoading?: boolean;
}

export default function Products({ products, isLoading = false }: ProductsProps) {
    // Filter products to show only 3D Pens and 3D Printers
    const filteredProducts = products.filter(
        (product) =>
            product.category === "3D Pens" || product.category === "3D Printers"
    );



    const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

    return (
        <section className="py-24 bg-slate-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
                        <Package className="h-5 w-5 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium">Our Products</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Premium 3D Printing Equipment
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Discover our range of professional 3D pens and 3D printers designed for precision and quality.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                <Skeleton variant="rounded" height={200} />
                                <div className="p-4">
                                    <Skeleton variant="text" width="80%" height={24} className="mb-2" />
                                    <Skeleton variant="text" width="100%" height={16} className="mb-1" />
                                    <Skeleton variant="text" width="60%" height={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
                        <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No products available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => setSelectedQuickView(product)}
                                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 cursor-pointer group"
                            >
                                <div className="relative h-64 w-full bg-slate-800 overflow-hidden">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <span
                                            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${product.inStock
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                                }`}
                                        >
                                            {product.inStock ? "In Stock" : "Out of Stock"}
                                        </span>
                                        <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-slate-900/80 text-blue-400">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{product.name}</h3>
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-blue-400 font-black text-xl">{product.price}</span>
                                        {product.quantity !== undefined && (
                                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                Qty: {product.quantity}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/products/${product.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/20"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <ProductQuickView
                    product={selectedQuickView}
                    onClose={() => setSelectedQuickView(null)}
                />

                {/* View All Products Link */}
                <div className="text-center mt-12">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
}
