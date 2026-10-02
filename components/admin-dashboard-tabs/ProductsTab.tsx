"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Upload, X, LogOut, Search, ArrowLeft, Star, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { type Product } from "@/lib/products";
import CustomDropdown from "../CustomDropdown";
import RichTextEditor from "../RichTextEditor";
import { formatINR } from "@/lib/utils";
import { toast } from 'sonner';

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
    const getImageUrl = (url: string) => {
        if (url && url.includes("mega.nz")) {
            return `/api/mega-image?url=${encodeURIComponent(url)}`;
        }
        return url;
    };

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
        stockCount: "" as number | string,
        likes: "" as number | string,
        views: "" as number | string,
        isPopular: false,
        availabilityStatus: "In Stock" as "In Stock" | "Out of Stock" | "Pre-order" | "Draft",
        colors: [] as string[],
        defaultColor: "",
        weight: "" as number | string,
        length: "" as number | string,
        width: "" as number | string,
        height: "" as number | string,
    });

    // Import state
    const [catalogUrl, setCatalogUrl] = useState("");
    const [jsonData, setJsonData] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importMode, setImportMode] = useState<"url" | "json" | "csv">("csv");
    const [importAsDraft, setImportAsDraft] = useState(false);

    const [manualGalleryUrl, setManualGalleryUrl] = useState("");
    const [isAddingUrl, setIsAddingUrl] = useState(false);

    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadSessionId, setUploadSessionId] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<"All" | "In Stock" | "Out of Stock" | "Draft">("All");

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
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);
        
        const uploadedUrls: string[] = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const formDataPayload = new FormData();
                formDataPayload.append('file', file);
                formDataPayload.append('quotationID', editingProduct ? editingProduct.id : uploadSessionId);
                formDataPayload.append('rootFolder', 'products');

                const responseData: any = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/upload-to-mega', true);

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const baseProgress = (i / files.length) * 100;
                            const fileProgress = (event.loaded / event.total) * (100 / files.length);
                            setUploadProgress(Math.round(baseProgress + fileProgress));
                        }
                    };

                    xhr.onload = () => {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            reject(new Error('Invalid JSON response'));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Network Error'));
                    xhr.send(formDataPayload);
                });
                
                if (responseData.success) {
                    uploadedUrls.push(responseData.data.url);
                } else {
                    console.error('Upload error response:', responseData.error);
                }
            } catch (error) {
                console.error('Upload failed', error);
            }
        }

        if (uploadedUrls.length > 0) {
            if (targetField === 'image') {
                setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
            } else if (targetField === 'gallery') {
                setFormData(prev => {
                    const currentImages = prev.images ? prev.images.split(',').map(i => i.trim()).filter(Boolean) : [];
                    if (index !== undefined && index < currentImages.length) {
                        currentImages[index] = uploadedUrls[0];
                        return { ...prev, images: [...currentImages, ...uploadedUrls.slice(1)].join(', ') };
                    } else {
                        return { ...prev, images: [...currentImages, ...uploadedUrls].join(', ') };
                    }
                });
            }
        }
        
        setIsUploading(false);
        setUploadProgress(null);
        e.target.value = '';
    };

    const removeGalleryImage = (index: number) => {
        const currentImages = formData.images.split(",").map(i => i.trim()).filter(Boolean);
        currentImages.splice(index, 1);
        setFormData(prev => ({ ...prev, images: currentImages.join(", ") }));
    };

    const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
        const currentImages = formData.images.split(",").map(i => i.trim()).filter(Boolean);
        if (direction === 'left' && index > 0) {
            const temp = currentImages[index - 1];
            currentImages[index - 1] = currentImages[index];
            currentImages[index] = temp;
        } else if (direction === 'right' && index < currentImages.length - 1) {
            const temp = currentImages[index + 1];
            currentImages[index + 1] = currentImages[index];
            currentImages[index] = temp;
        }
        setFormData(prev => ({ ...prev, images: currentImages.join(", ") }));
    };

    const handleAddGalleryUrl = async () => {
        if (!manualGalleryUrl.trim()) return;
        setIsAddingUrl(true);
        try {
            if (manualGalleryUrl.includes("mega.nz/folder/")) {
                const res = await fetch("/api/mega-folder", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ folderUrl: manualGalleryUrl })
                });
                const data = await res.json();
                if (data.success && data.urls && data.urls.length > 0) {
                    setFormData(prev => {
                        const currentImages = prev.images ? prev.images.split(",").map(i => i.trim()).filter(Boolean) : [];
                        const newImages = [...currentImages, ...data.urls];
                        return { ...prev, images: newImages.join(", ") };
                    });
                    setManualGalleryUrl("");
                    toast.error(`Added ${data.urls.length} images from MEGA folder!`);
                } else {
                    toast.error(data.error || "Failed to load MEGA folder");
                }
            } else {
                setFormData(prev => {
                    const currentImages = prev.images ? prev.images.split(",").map(i => i.trim()).filter(Boolean) : [];
                    currentImages.push(manualGalleryUrl.trim());
                    return { ...prev, images: currentImages.join(", ") };
                });
                setManualGalleryUrl("");
            }
        } catch (err) {
            console.error(err);
            toast.error(`Failed to add URL`);
        } finally {
            setIsAddingUrl(false);
        }
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
            stockCount: "",
            likes: "",
            views: "",
            isPopular: false,
            availabilityStatus: "In Stock",
            colors: [],
            defaultColor: "",
            weight: "",
            length: "",
            width: "",
            height: "",
        });
        setUploadedImages([]);
        setEditingProduct(null);
        setUploadSessionId(`NEW_${Date.now()}`);
        setShowAddModal(true);
    };

    const handleEditProduct = (product: Product) => {
        const allImages = [product.image, ...product.images].filter(Boolean);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString().replace(/[^\d.]/g, ""),
            mrp: product.mrp ? product.mrp.toString().replace(/[^\d.]/g, "") : "",
            image: product.image,
            images: product.images.join(", "),
            category: product.category,
            inStock: product.inStock,
            stockCount: product.stockCount || "",
            likes: product.likes || "",
            views: product.views || "",
            isPopular: product.isPopular || false,
            availabilityStatus: (product.availabilityStatus || "In Stock") as "In Stock" | "Out of Stock" | "Pre-order" | "Draft",
            colors: product.colors || [],
            defaultColor: product.defaultColor || (product.colors && product.colors.length > 0 ? product.colors[0] : ""),
            weight: product.weight || "",
            length: product.length || "",
            width: product.width || "",
            height: product.height || "",
        });
        setUploadedImages(allImages);
        setEditingProduct(product);
        setUploadSessionId(product.id);
        setShowAddModal(true);
    };

    const handleSaveProduct = async (asDraft: boolean = false) => {
        try {
            if (asDraft && !formData.name.trim()) {
                return toast.error("Product Name is required to save as a draft.");
            }
            if (!asDraft && (!formData.name.trim() || !formData.price || !formData.mrp || !formData.category || !formData.image || formData.stockCount === null || formData.stockCount === undefined || formData.likes === null || formData.likes === undefined || !formData.availabilityStatus || formData.colors.length === 0 || !formData.description.trim() || formData.weight === "" || formData.length === "" || formData.width === "" || formData.height === "")) {
                const missingFields: string[] = [];
                if (!formData.name.trim()) missingFields.push("Product Name");
                if (!formData.price) missingFields.push("Selling Price");
                if (!formData.mrp) missingFields.push("MRP");
                if (!formData.category) missingFields.push("Category");
                if (!formData.image) missingFields.push("Primary Image");
                if (formData.stockCount === null || formData.stockCount === undefined || formData.stockCount === "") missingFields.push("Stock Count");
                if (formData.likes === null || formData.likes === undefined || formData.likes === "") missingFields.push("Initial Likes");
                if (formData.views === null || formData.views === undefined || formData.views === "") missingFields.push("Initial Views");
                if (!formData.availabilityStatus) missingFields.push("Status");
                if (formData.colors.length === 0) missingFields.push("Finish/Color");
                if (!formData.description.trim()) missingFields.push("Description");
                if (formData.weight === "") missingFields.push("Weight");
                if (formData.length === "") missingFields.push("Length");
                if (formData.width === "") missingFields.push("Width");
                if (formData.height === "") missingFields.push("Height");
                
                return toast.error(`Missing fields: ${missingFields.join(", ")}`);
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
                availabilityStatus: asDraft ? "Draft" : formData.availabilityStatus,
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
                toast.error(data.message || "Failed to save product");
            }
        } catch (error) {
            toast.error(`Failed to save product`);
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
            toast.error(`Failed to delete product`);
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
                    body: JSON.stringify({ products: productsToImport, asDraft: importAsDraft }),
                });
                const data = await res.json();
                if (data.success) {
                    toast.error(`Imported ${data.imported} products from CSV`);
                    setShowImportModal(false);
                    fetchProducts();
                }
            } catch (error) {
                toast.error(`CSV Import failed`);
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
                body = { products: Array.isArray(p) ? p : (p.products || []), asDraft: importAsDraft };
            } else if (importMode === "url") {
                body = { catalogUrl, asDraft: importAsDraft };
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
                toast.error(`Imported ${data.imported} products`);
                setShowImportModal(false);
                fetchProducts();
            }
        } catch (error) {
            toast.error(`Import failed`);
        } finally {
            setIsImporting(false);
        }
    };

    if (showAddModal) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSaveProduct(true)}
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all"
                        >
                            Save as Draft
                        </button>
                        <button
                        onClick={() => handleSaveProduct(false)}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                    >
                        {editingProduct ? "Save Changes" : "Save Product"}
                    </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-300px)]">
                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Product Name <span className="text-red-500">*</span></label>
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Selling Price <span className="text-red-500">*</span></label>
                                    <input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="2499" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">MRP <span className="text-red-500">*</span></label>
                                    <input value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="3999" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Initial Likes <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.likes} onChange={e => setFormData({ ...formData, likes: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="0" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Initial Views <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.views} onChange={e => setFormData({ ...formData, views: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="0" />
                                </div>
                                <div className="col-span-1 lg:col-span-2">
                                    <CustomDropdown
                                        label={<>Category <span className="text-red-500">*</span></>}
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
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Weight (g) <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="500" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Length (cm) <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.length} onChange={e => setFormData({ ...formData, length: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="20" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Width (cm) <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="15" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Height (cm) <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="10" />
                                </div>
                            </div>
                            
                            <div className="mt-4 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={formData.isPopular} 
                                            onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })} 
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors ${formData.isPopular ? "bg-cyan-500" : "bg-slate-200 dark:bg-slate-800"}`} />
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPopular ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Show on Homepage (Featured)</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-6 sm:flex-row">
                                <div className="flex-1">
                                    <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 ml-1">Stock Count <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.stockCount} onChange={e => setFormData({ ...formData, stockCount: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-cyan-500 transition-all" placeholder="0" />
                                </div>
                                <div className="flex-1">
                                    <CustomDropdown
                                        label={<>Status <span className="text-red-500">*</span></>}
                                        value={formData.availabilityStatus}
                                        onChange={val => setFormData({ ...formData, availabilityStatus: val as any })}
                                        options={[
                                            { value: "In Stock", label: "In Stock" },
                                            { value: "Out of Stock", label: "Out of Stock" },
                                            { value: "Pre-order", label: "Pre-order" }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>




                        <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Gallery & Primary Image <span className="text-red-500">*</span></label>
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                                    <Star size={10} className="text-red-500 fill-red-500" /> Click image to set as Primary
                                </span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {(() => {
                                    const imgs = formData.images ? formData.images.split(",").map(i => i.trim()).filter(Boolean) : [];
                                    return (
                                        <>
                                            {imgs.map((img, idx) => {
                                                const isPrimary = formData.image === img;
                                                return (
                                                    <div key={idx} className={`relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 transition-all group cursor-pointer ${
                                                        isPrimary
                                                            ? "border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-cyan-400"
                                                    }`}
                                                        onClick={() => setFormData(prev => ({ ...prev, image: img }))}
                                                    >
                                                        {/* Image Rendering */}
                                                        {isPrimary ? (
                                                            <>
                                                                {/* Blurred background for primary */}
                                                                <div className="absolute inset-0 z-0 overflow-hidden">
                                                                    <Image src={getImageUrl(img)} alt={`Gallery bg ${idx}`} fill className="object-cover blur-md opacity-40 scale-125" unoptimized={img.includes("mega.nz")} />
                                                                </div>
                                                                {/* Full foreground image for primary */}
                                                                <Image src={getImageUrl(img)} alt={`Gallery ${idx}`} fill className="object-contain z-10 relative group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" unoptimized={img.includes("mega.nz")} />
                                                            </>
                                                        ) : (
                                                            <Image src={getImageUrl(img)} alt={`Gallery ${idx}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized={img.includes("mega.nz")} />
                                                        )}

                                                        {/* Primary badge */}
                                                        {isPrimary && (
                                                            <div className="absolute inset-0 bg-cyan-500/10 flex items-end justify-center pb-2 z-20 pointer-events-none">
                                                                <span className="bg-cyan-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                    <Star size={8} className="fill-white" /> Primary
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Hover select hint */}
                                                        {!isPrimary && (
                                                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
                                                                <span className="text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                    <Star size={10} className="fill-white" /> Set Primary
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Delete button */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeGalleryImage(idx); }}
                                                            className="absolute top-1.5 right-1.5 p-1 bg-red-500/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 z-10"
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>

                                                        {/* Rearrange buttons */}
                                                        {idx > 0 && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); moveGalleryImage(idx, 'left'); }}
                                                                className="absolute left-1 top-1/2 -translate-y-1/2 p-1 bg-slate-900/80 text-white rounded-md hover:bg-slate-900 z-20 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <ChevronLeft size={14} />
                                                            </button>
                                                        )}
                                                        {idx < imgs.length - 1 && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); moveGalleryImage(idx, 'right'); }}
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-slate-900/80 text-white rounded-md hover:bg-slate-900 z-20 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <ChevronRight size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Upload new snap */}
                                            {imgs.length < 5 && (
                                                <label className="aspect-square bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                                                    {isUploading && uploadProgress !== null ? (
                                                        <div className="flex flex-col items-center justify-center gap-1"><div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /><span className="text-cyan-500 font-bold text-[10px] text-center">{uploadProgress === 100 ? "Loading..." : `Uploading ${uploadProgress}%`}</span></div>
                                                    ) : (
                                                        <>
                                                            <Plus size={22} className="text-slate-400 group-hover:text-cyan-400 mb-1" />
                                                            <span className="text-[9px] font-bold text-slate-400 group-hover:text-cyan-400 uppercase tracking-widest">Add Snap</span>
                                                        </>
                                                    )}
                                                    <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, "gallery")} disabled={isUploading} />
                                                </label>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Add URL or MEGA Folder */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Add Image URL or MEGA Folder Link</p>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                        value={manualGalleryUrl}
                                        onChange={e => setManualGalleryUrl(e.target.value)}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-cyan-500 transition-all"
                                        placeholder="https://mega.nz/folder/... or image URL"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddGalleryUrl}
                                        disabled={isAddingUrl}
                                        className="flex cursor-pointer items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 px-5 py-2.5 transition-all hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300 gap-2 disabled:opacity-50"
                                    >
                                        {isAddingUrl ? "Adding..." : <><Plus size={16} /> Add to Gallery</>}
                                    </button>
                                </div>
                            </div>

                            {/* Manual URL + upload fallback */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Or enter primary image URL manually</p>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-cyan-500 transition-all"
                                        placeholder="https://..."
                                    />
                                    <label className="flex cursor-pointer items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 px-5 py-2.5 transition-all hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300 gap-2">
                                        {isUploading && uploadProgress !== null ? (
                                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /><span className="text-cyan-500 whitespace-nowrap text-xs">{uploadProgress === 100 ? "Loading..." : `Uploading ${uploadProgress}%`}</span></div>
                                        ) : (
                                            <><Upload size={16} /> Upload</>
                                        )}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "image")} disabled={isUploading} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Available Colors <span className="text-red-500">*</span></label>
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
                                            className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all hover:scale-105 shadow-sm ${isSelected ? "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"}`}
                                        >
                                            <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundColor: color }} />
                                            <span className={`text-xs font-bold ${isSelected ? "text-cyan-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"}`}>{getColorName(color)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.colors.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Default Color</label>
                                    <div className="flex gap-4 flex-wrap">
                                        {formData.colors.map(color => (
                                            <button
                                                key={`default-${color}`}
                                                onClick={() => setFormData(prev => ({ ...prev, defaultColor: color }))}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all hover:scale-105 shadow-sm ${formData.defaultColor === color ? "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"}`}
                                            >
                                                <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundColor: color }} />
                                                <span className={`text-xs font-bold ${formData.defaultColor === color ? "text-cyan-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"}`}>{getColorName(color)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Description <span className="text-red-500">*</span></label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                                placeholder="Detailed product description..."                            />
                        </div>
                    </div>

                    {/* Preview Pane */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-y-auto custom-scrollbar hidden lg:block">
                        <div className="prose dark:prose-invert max-w-none">
                            <h1 className="text-3xl font-bold mb-4">{formData.name || "Product Name"}</h1>
                            
                            {formData.image && (
                                <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <Image src={getImageUrl(formData.image)} alt="Cover" fill className="object-contain p-4" unoptimized={formData.image.includes("mega.nz")} />
                                </div>
                            )}
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-cyan-500">{formData.price ? formatINR(formData.price) : "₹0"}</span>
                                    {formData.mrp && <span className="text-sm font-bold text-slate-400 line-through">MRP {formatINR(formData.mrp)}</span>}
                                </div>
                                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                    {formData.category || "Hardware"}
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${formData.availabilityStatus === 'In Stock' ? 'bg-green-500/10 text-green-500 border-green-500/20' : formData.availabilityStatus === 'Pre-order' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {formData.availabilityStatus || 'Draft'}
                                </div>
                            </div>
                            
                            <div className="mb-6 grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weight</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.weight || 0}g</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Length</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.length || 0}cm</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Width</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.width || 0}cm</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Height</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.height || 0}cm</span>
                                </div>
                            </div>

                            {formData.colors && formData.colors.length > 0 && (
                                <div className="mb-6">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Available Colors</span>
                                    <div className="flex gap-2">
                                        {formData.colors.map(c => (
                                            <div key={c} className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8" dangerouslySetInnerHTML={{ __html: formData.description || "<p class='text-slate-400 italic'>Product description will appear here...</p>" }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 w-full sm:w-auto">
                <button onClick={handleAddProduct} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 sm:py-3 font-black text-[10px] sm:text-sm text-white dark:text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 sm:w-auto uppercase tracking-widest">
                    <Plus size={18} /> Add Product
                </button>
                <button onClick={() => setShowImportModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-2.5 sm:py-3 font-black text-[10px] sm:text-sm text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:bg-slate-700 sm:w-auto uppercase tracking-widest border border-slate-300 dark:border-slate-700">
                    <Upload size={18} /> Bulk Import
                </button>
            </div>
            <div className="w-full sm:w-48 z-10">
                <CustomDropdown
                    value={filterStatus}
                    onChange={(val) => setFilterStatus(val as any)}
                    options={[
                        { value: "All", label: "All Statuses" },
                        { value: "In Stock", label: "In Stock" },
                        { value: "Out of Stock", label: "Out of Stock" },
                        { value: "Draft", label: "Draft" },
                    ]}
                />
            </div>
            </div>

            {isLoading ? (
                <div className="text-slate-900 dark:text-white">Loading products...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.filter(p => {
                        if (filterStatus === "All") return true;
                        if (filterStatus === "Draft") return p.availabilityStatus === "Draft";
                        if (filterStatus === "In Stock") return p.availabilityStatus === "In Stock" || (p.inStock && p.availabilityStatus !== "Draft" && p.availabilityStatus !== "Out of Stock");
                        if (filterStatus === "Out of Stock") return p.availabilityStatus === "Out of Stock" || (!p.inStock && p.availabilityStatus !== "Draft" && p.availabilityStatus !== "In Stock");
                        return true;
                    }).map(p => (
                        <div key={p.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-all">
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                                {/* Blurred background */}
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <Image src={getImageUrl(p.image) || "/placeholder.png"} alt={`${p.name} bg`} fill className="object-cover blur-md opacity-40 scale-125" unoptimized={p.image?.includes("mega.nz")} />
                                </div>
                                {/* Full foreground image */}
                                <Image src={getImageUrl(p.image) || "/placeholder.png"} alt={p.name} fill className="object-contain z-10 relative group-hover:scale-105 transition-transform duration-500 drop-shadow-md" unoptimized={p.image?.includes("mega.nz")} />
                                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.availabilityStatus === "Draft" ? "bg-yellow-500/20 text-yellow-500" : (p.availabilityStatus === "Out of Stock" || (!p.availabilityStatus && !p.inStock)) ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
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
                                <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 h-8 mb-4">{p.description ? p.description.replace(/<[^>]+>/g, '') : ''}</p>
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
                        <label className="flex items-center gap-2 mb-4 mt-2 cursor-pointer">
                            <input type="checkbox" checked={importAsDraft} onChange={(e) => setImportAsDraft(e.target.checked)} className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Save imported products as Draft</span>
                        </label>
                        {importMode !== "csv" && (
                            <button onClick={handleImportCatalog} disabled={isImporting} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
                                {isImporting ? "Importing..." : "Start Import"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}




