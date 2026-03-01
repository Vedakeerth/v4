"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, LogOut, Package, AlertCircle, X, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    images: string[];
    category: string;
    inStock: boolean;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        image: "",
        images: "",
        category: "",
        inStock: true,
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check");
            const data = await res.json();
            if (data.authenticated) {
                setIsAuthenticated(true);
                fetchProducts();
            } else {
                router.push("/secure-management-portal/login");
            }
        } catch (error) {
            router.push("/admin/login");
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/products");
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/admin/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleAddProduct = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            image: "",
            images: "",
            category: "",
            inStock: true,
        });
        setEditingProduct(null);
        setShowAddModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.replace("₹", ""),
            image: product.image,
            images: product.images.join(", "),
            category: product.category,
            inStock: product.inStock,
        });
        setEditingProduct(product);
        setShowAddModal(true);
    };

    const handleSaveProduct = async () => {
        try {
            const imagesArray = formData.images
                .split(",")
                .map((img) => img.trim())
                .filter((img) => img.length > 0);
            
            const productData = {
                name: formData.name,
                description: formData.description,
                price: formData.price.startsWith("₹") ? formData.price : `₹${formData.price}`,
                image: formData.image,
                images: imagesArray.length > 0 ? imagesArray : [formData.image],
                category: formData.category,
                inStock: formData.inStock,
            };

            let res;
            if (editingProduct) {
                // Update existing product
                res = await fetch(`/api/products/${editingProduct.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData),
                });
            } else {
                // Add new product
                res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData),
                });
            }

            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                fetchProducts();
            } else {
                alert(data.message || "Failed to save product");
            }
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product");
        }
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setDeleteConfirm(null);
                fetchProducts();
            } else {
                alert(data.message || "Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    };

    const categories = ["Mechanical", "Hardware", "Enclosures", "Electronics", "Tooling", "Decoration", "3D Pens", "3D Printers"];

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-slate-400">Manage your gallery products</p>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link
                            href="/gallery"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            View Gallery
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Add Product Button */}
                <div className="mb-6">
                    <button
                        onClick={handleAddProduct}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Product
                    </button>
                </div>

                {/* Products List */}
                {isLoading ? (
                    <div className="text-white">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
                        <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No products found. Add your first product!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors"
                            >
                                <div className="relative h-48 w-full bg-slate-800">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${
                                                product.inStock
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}
                                        >
                                            {product.inStock ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold text-lg mb-1">{product.name}</h3>
                                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-blue-400 font-bold">{product.price}</span>
                                        <span className="text-slate-500 text-xs">{product.category}</span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(product.id)}
                                            className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingProduct ? "Edit Product" : "Add New Product"}
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    rows={3}
                                    placeholder="Enter product description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Price (₹)</label>
                                    <input
                                        type="text"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                        placeholder="149.99"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Main Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    placeholder="/images/product.png"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Additional Images (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.images}
                                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    placeholder="/images/img1.png, /images/img2.png"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.inStock}
                                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-300">In Stock</span>
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleSaveProduct}
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="h-5 w-5" />
                                    {editingProduct ? "Update Product" : "Add Product"}
                                </button>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-red-400" />
                            <h3 className="text-xl font-bold text-white">Delete Product</h3>
                        </div>
                        <p className="text-slate-400 mb-6">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDeleteProduct(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
