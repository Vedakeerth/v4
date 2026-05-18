"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Upload, X, LogOut, Search } from "lucide-react";
import Image from "next/image";
import { type Product } from "@/lib/products";
import CustomDropdown from "../CustomDropdown";
import { formatINR } from "@/lib/utils";

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

export default function ProductsTab() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [categoriesList, setCategoriesList] = useState<{ value: string; label: string }[]>([]);

    // Edit/Delete state
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        mrp: "",
        image: "",
        images: "",
        category: "",
        inStock: true,
        stockCount: 0,
        likes: 0,
        isPopular: false,
        availabilityStatus: "In Stock" as "In Stock" | "Out of Stock" | "Pre-order",
        colors: [] as string[],
        defaultColor: "",
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
    });

    // Import state
    const [catalogUrl, setCatalogUrl] = useState("");
    const [jsonData, setJsonData] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importMode, setImportMode] = useState<"url" | "json" | "csv">("csv");

    // Image Upload State
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (data.success) {
                setCategoriesList(data.categories.map((c: any) => ({ value: c.name, label: c.name })));
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/products");
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'image' | 'gallery', index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: JSON.stringify({
                        file: reader.result,
                        fileName: file.name,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    if (targetField === 'image') {
                        setFormData(prev => ({ ...prev, image: data.url }));
                    } else if (targetField === 'gallery') {
                        const currentImages = formData.images ? formData.images.split(",").map(i => i.trim()).filter(Boolean) : [];
                        if (index !== undefined && index < currentImages.length) {
                            currentImages[index] = data.url;
                        } else {
                            currentImages.push(data.url);
                        }
                        setFormData(prev => ({ ...prev, images: currentImages.join(", ") }));
                    }
                }
            } catch (error) {
                console.error("Upload failed", error);
            } finally {
                setIsUploading(false);
            }
        };
    };

    const removeGalleryImage = (index: number) => {
        const currentImages = formData.images.split(",").map(i => i.trim()).filter(Boolean);
        currentImages.splice(index, 1);
        setFormData(prev => ({ ...prev, images: currentImages.join(", ") }));
    };

    const handleAddProduct = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            mrp: "",
            image: "",
            images: "",
            category: "",
            inStock: true,
            stockCount: 0,
            likes: 0,
            isPopular: false,
            availabilityStatus: "In Stock",
            colors: [],
            defaultColor: "",
            weight: 0,
            length: 0,
            width: 0,
            height: 0,
        });
        setUploadedImages([]);
        setEditingProduct(null);
        setShowAddModal(true);
    };

    const handleEditProduct = (product: Product) => {
        const allImages = [product.image, ...product.images].filter(Boolean);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString().replace("₹", ""),
            mrp: product.mrp ? product.mrp.toString().replace("₹", "") : "",
            image: product.image,
            images: product.images.join(", "),
            category: product.category,
            inStock: product.inStock,
            stockCount: product.stockCount || 0,
            likes: product.likes || 0,
            isPopular: product.isPopular || false,
            availabilityStatus: product.availabilityStatus || "In Stock",
            colors: product.colors || [],
            defaultColor: product.defaultColor || (product.colors && product.colors.length > 0 ? product.colors[0] : ""),
            weight: product.weight || 0,
            length: product.length || 0,
            width: product.width || 0,
            height: product.height || 0,
        });
        setUploadedImages(allImages);
        setEditingProduct(product);
        setShowAddModal(true);
    };

    const handleSaveProduct = async () => {
        try {
            if (!formData.name.trim() || !formData.price || !formData.category || !formData.image || formData.stockCount === null || formData.stockCount === undefined || formData.likes === null || formData.likes === undefined || !formData.availabilityStatus || formData.colors.length === 0 || !formData.description.trim()) {
                return alert("Please fill out all mandatory fields, including selecting at least one finish/color.");
            }
            let finalImages: string[] = [];
            let mainImage = formData.image;

            // Simple logic: if user provided comma separated images, use them.
            // If we had a complex multi-upload UI, we'd use uploadedImages.
            const imagesArray = formData.images.split(",").map(i => i.trim()).filter(Boolean);
            finalImages = imagesArray;

            const productData = {
                ...formData,
                price: formData.price.startsWith("₹") ? formData.price : `₹${formData.price}`,
                mrp: formData.mrp ? (formData.mrp.startsWith("₹") ? formData.mrp : `₹${formData.mrp}`) : "",
                image: mainImage,
                images: finalImages,
                stockCount: parseInt(formData.stockCount.toString()) || 0,
            };

            const res = await fetch(editingProduct ? `/api/products/${editingProduct.id}` : "/api/products", {
                method: editingProduct ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                fetchProducts();
                // Trigger cache revalidation
                await fetch("/api/revalidate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tag: "products" }),
                });
            } else {
                alert(data.message || "Failed to save product");
            }
        } catch (error) {
            alert("Failed to save product");
        }
    };

    const handleDeleteProduct = async (id: string | number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setDeleteConfirm(null);
                fetchProducts();
                // Trigger cache revalidation
                await fetch("/api/revalidate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tag: "products" }),
                });
            }
        } catch (error) {
            alert("Failed to delete product");
        }
    };

    const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const rows = text.split("\n").map(r => r.split(",").map(c => c.trim()));
            const headers = rows[0];
            const dataRows = rows.slice(1).filter(r => r.length > 1);

            const productsToImport = dataRows.map(row => {
                const p: any = {};
                headers.forEach((h, i) => {
                    const key = h.toLowerCase();
                    if (key === "images") {
                        p[key] = row[i] ? row[i].split(";").map(img => img.trim()) : [];
                    } else if (key === "stockcount" || key === "likes") {
                        p[key === "stockcount" ? "stockCount" : "likes"] = parseInt(row[i]) || 0;
                    } else if (key === "instock") {
                        p.inStock = row[i].toLowerCase() === "true";
                    } else {
                        p[key] = row[i];
                    }
                });
                return p;
            });

            try {
                const res = await fetch("/api/products/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ products: productsToImport }),
                });
                const data = await res.json();
                if (data.success) {
                    alert(`Imported ${data.imported} products from CSV`);
                    setShowImportModal(false);
                    fetchProducts();
                }
            } catch (error) {
                alert("CSV Import failed");
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsText(file);
    };

    const downloadCsvTemplate = () => {
        const headers = "name,description,price,mrp,category,image,images,stockCount,availabilityStatus,inStock";
        const example = "Example Product,Great product description,₹2499.00,₹3999.00,Electronics,https://img.com/main.png,https://img.com/1.png;https://img.com/2.png,50,In Stock,true";
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "product_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCatalog = async () => {
        setIsImporting(true);
        try {
            let body: any;
            if (importMode === "json") {
                const p = JSON.parse(jsonData);
                body = { products: Array.isArray(p) ? p : (p.products || []) };
            } else if (importMode === "url") {
                body = { catalogUrl };
            } else {
                return; // CSV handled by separate input
            }
            const res = await fetch("/api/products/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                alert(`Imported ${data.imported} products`);
                setShowImportModal(false);
                fetchProducts();
            }
        } catch (error) {
            alert("Import failed");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button onClick={handleAddProduct} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 sm:py-3 font-black text-[10px] sm:text-sm text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 sm:w-auto uppercase tracking-widest">
                    <Plus size={18} /> Add Product
                </button>
                <button onClick={() => setShowImportModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-2.5 sm:py-3 font-black text-[10px] sm:text-sm text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:bg-slate-700 sm:w-auto uppercase tracking-widest border border-slate-300 dark:border-slate-700">
                    <Upload size={18} /> Bulk Import
                </button>
            </div>

            {isLoading ? (
                <div className="text-slate-900 dark:text-white">Loading products...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-all">
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                                <Image src={p.image || "/placeholder.png"} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.inStock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                        {p.availabilityStatus || (p.inStock ? "In Stock" : "Out of Stock")}
                                    </span>
                                    {p.isPopular && (
                                        <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-center border border-cyan-500/30">
                                            POPULAR
                                        </span>
                                    )}
                                    {p.stockCount !== undefined && (
                                        <span className="bg-white dark:bg-slate-950/80 text-slate-900 dark:text-white px-2 py-1 rounded-lg text-[10px] font-black text-center border border-slate-200 dark:border-slate-800">
                                            QTY: {p.stockCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1 truncate">{p.name}</h3>
                                <p className="text-[9px] text-cyan-500/80 font-black uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">ID: {p.id}</p>
                                <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 h-8 mb-4">{p.description}</p>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-cyan-400 font-black text-xl">
                                            {formatINR(p.price)}
                                        </span>
                                        {p.mrp && (
                                            <span className="text-xs text-slate-400 font-bold line-through">
                                                MRP {formatINR(p.mrp)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{p.category}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditProduct(p)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold border border-slate-300 dark:border-slate-700">
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-400 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold border border-slate-300 dark:border-slate-700">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-slate-950/60 p-3 backdrop-blur-2xl sm:p-4 transition-all duration-500">
                    <div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/30 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-3xl sm:p-6 lg:p-8">
                        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8 sm:items-center">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Product Name</label>
                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Selling Price</label>
                                        <input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="2499" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">MRP</label>
                                        <input value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="3999" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Initial Likes</label>
                                        <input type="number" value={formData.likes} onChange={e => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Weight (g)</label>
                                        <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="500" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Length (cm)</label>
                                        <input type="number" value={formData.length} onChange={e => setFormData({ ...formData, length: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="20" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Width (cm)</label>
                                        <input type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="15" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Height (cm)</label>
                                        <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="10" />
                                    </div>
                                </div>
                                <CustomDropdown
                                    label="Category"
                                    value={formData.category}
                                    onChange={val => setFormData({ ...formData, category: val })}
                                    options={categoriesList.length > 0 ? categoriesList : [
                                        { value: "Hardware", label: "Hardware" },
                                        { value: "Enclosures", label: "Enclosures" },
                                        { value: "Electronics", label: "Electronics" },
                                        { value: "Mechanical", label: "Mechanical" },
                                        { value: "Tooling", label: "Tooling" },
                                        { value: "Uncategorized", label: "Uncategorized" }
                                    ]}
                                />
                                <div className="mt-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={formData.isPopular} 
                                                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })} 
                                            />
                                            <div className={`w-10 h-6 rounded-full transition-colors ${formData.isPopular ? "bg-cyan-500" : "bg-slate-100 dark:bg-slate-800"}`} />
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPopular ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Show on Homepage (Featured)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <div className="flex-1">
                                        <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Stock Count</label>
                                        <input type="number" value={formData.stockCount} onChange={e => setFormData({ ...formData, stockCount: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" />
                                    </div>
                                    <CustomDropdown
                                        label="Status"
                                        value={formData.availabilityStatus}
                                        onChange={val => setFormData({ ...formData, availabilityStatus: val as any })}
                                        options={[
                                            { value: "In Stock", label: "In Stock" },
                                            { value: "Out of Stock", label: "Out of Stock" },
                                            { value: "Pre-order", label: "Pre-order" }
                                        ]}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Image URL / Upload</label>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-cyan-500 transition-all"
                                        />
                                        <label className="flex cursor-pointer items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 px-4 py-3 transition-all hover:bg-slate-600">
                                            <Upload size={18} className={isUploading ? "animate-bounce" : ""} />
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "image")} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Product Gallery (Snaps)</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {(() => {
                                    const imgs = formData.images ? formData.images.split(",").map(i => i.trim()).filter(Boolean) : [];
                                    return (
                                        <>
                                            {imgs.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 group">
                                                    <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                                                    <button
                                                        onClick={() => removeGalleryImage(idx)}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-slate-900 dark:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {imgs.length < 5 && (
                                                <label className="aspect-square bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-slate-100 dark:bg-slate-800 transition-all group">
                                                    <Plus size={24} className="text-slate-500 group-hover:text-cyan-400 mb-2" />
                                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-cyan-400 uppercase tracking-widest">Add Snap</span>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "gallery")} />
                                                </label>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Finished Color</label>
                            <div className="flex gap-4 flex-wrap">
                                {availableColors.map((color) => {
                                    const isSelected = formData.colors.includes(color);
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                setFormData(prev => {
                                                    const isCurrentlySelected = prev.colors.includes(color);
                                                    const newColors = isCurrentlySelected 
                                                        ? prev.colors.filter(c => c !== color) 
                                                        : [...prev.colors, color];
                                                    
                                                    let newDefaultColor = prev.defaultColor;
                                                    if (!newColors.includes(prev.defaultColor)) {
                                                        newDefaultColor = newColors.length > 0 ? newColors[0] : "";
                                                    } else if (newColors.length === 1) {
                                                        newDefaultColor = newColors[0];
                                                    }

                                                    return {
                                                        ...prev,
                                                        colors: newColors,
                                                        defaultColor: newDefaultColor
                                                    };
                                                });
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all hover:scale-105 shadow-sm ${isSelected ? "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"}`}
                                        >
                                            <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm" style={{ backgroundColor: color }} />
                                            <span className={`text-xs font-bold ${isSelected ? "text-cyan-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"}`}>{getColorName(color)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {formData.colors.length > 0 && (
                            <div className="mt-6">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Default Color</label>
                                <div className="flex gap-4 flex-wrap">
                                    {formData.colors.map(color => (
                                        <button
                                            key={`default-${color}`}
                                            onClick={() => setFormData(prev => ({ ...prev, defaultColor: color }))}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all hover:scale-105 shadow-sm ${formData.defaultColor === color ? "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50"}`}
                                        >
                                            <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm" style={{ backgroundColor: color }} />
                                            <span className={`text-xs font-bold ${formData.defaultColor === color ? "text-cyan-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"}`}>{getColorName(color)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-24 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none" />
                        </div>

                        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-8 sm:flex-row sm:justify-end sm:gap-4">
                            <button onClick={() => setShowAddModal(false)} className="rounded-xl bg-slate-100 dark:bg-slate-800 px-8 py-3 font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:bg-slate-700">Cancel</button>
                            <button onClick={handleSaveProduct} className="rounded-xl bg-cyan-500 px-8 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400">Save {editingProduct ? "Changes" : "Product"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-950/90 p-3 backdrop-blur-md sm:p-4">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 shadow-2xl sm:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bulk Import Products</h2>
                            <button onClick={() => setShowImportModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button onClick={() => setImportMode("csv")} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${importMode === "csv" ? "bg-slate-200 dark:bg-slate-700 text-cyan-400" : "text-slate-600 dark:text-slate-400"}`}>CSV File</button>
                            <button onClick={() => setImportMode("url")} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${importMode === "url" ? "bg-slate-200 dark:bg-slate-700 text-cyan-400" : "text-slate-600 dark:text-slate-400"}`}>Link</button>
                            <button onClick={() => setImportMode("json")} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${importMode === "json" ? "bg-slate-200 dark:bg-slate-700 text-cyan-400" : "text-cyan-400"}`}>Raw</button>
                        </div>
                        {importMode === "csv" ? (
                            <div className="space-y-4">
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 hover:border-cyan-500/50 hover:bg-slate-100 dark:bg-slate-800/50 cursor-pointer transition-all">
                                    <Upload size={32} className="text-slate-500 mb-4" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white mb-2">Upload CSV File</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-black">Click to select product file</span>
                                    <input type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
                                </label>
                                <button
                                    onClick={downloadCsvTemplate}
                                    className="w-full py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-xl font-bold transition-all text-xs uppercase tracking-widest"
                                >
                                    Download CSV Template
                                </button>
                            </div>
                        ) : importMode === "url" ? (
                            <input value={catalogUrl} onChange={e => setCatalogUrl(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none mb-4" placeholder="https://example.com/catalog.json" />
                        ) : (
                            <textarea value={jsonData} onChange={e => setJsonData(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-cyan-500/50 outline-none mb-4 h-32" placeholder='[{"name": "Product 1", ...}]' />
                        )}
                        {importMode !== "csv" && (
                            <button onClick={handleImportCatalog} disabled={isImporting} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
                                {isImporting ? "Importing..." : "Start Import"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
