"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, LogOut, Package, AlertCircle, X, Save, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db, storage, auth } from "@/lib/firebase";
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  getDocs, query, orderBy, serverTimestamp, Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAdminAuth } from "@/lib/adminAuth";
import { signOut } from "firebase/auth";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  createdAt: any;
}

interface Order {
  id: string;
  trackingId: string;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    stock: "",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push("/admin/login");
      } else {
        fetchProducts();
        fetchOrders();
      }
    }
  }, [authLoading, isAdmin, router]);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) return alert("Please upload an image");
    
    setIsSaving(true);
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: formData.image,
        createdAt: editingProduct ? editingProduct.createdAt : serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      
      setShowAddModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setDeleteConfirm(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status");
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());

  if (authLoading || (isLoading && products.length === 0)) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage products and customer orders</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-bold transition-all border-b-2 ${
              activeTab === "products" 
                ? "text-blue-400 border-blue-500 bg-blue-500/5" 
                : "text-slate-500 border-transparent hover:text-white"
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-bold transition-all border-b-2 ${
              activeTab === "orders" 
                ? "text-cyan-400 border-cyan-500 bg-cyan-500/5" 
                : "text-slate-500 border-transparent hover:text-white"
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {activeTab === "products" ? (
          <>
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({ name: "", price: "", image: "", stock: "" });
                setShowAddModal(true);
              }}
              className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Plus className="h-5 w-5" />
              Add New Product
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group">
                  <div className="relative h-48 w-full bg-slate-800">
                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-bold text-xl mb-1">{product.name}</h3>
                    <p className="text-blue-400 font-black text-lg mb-4">₹{product.price}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({ 
                            name: product.name, 
                            price: product.price.toString(), 
                            image: product.image, 
                            stock: product.stock.toString() 
                          });
                          setShowAddModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                {["all", "pending", "confirmed", "processing", "shipped", "delivered"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      statusFilter === filter 
                        ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" 
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Payment</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-white font-black text-sm">{order.trackingId}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">ID: {order.id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-white font-bold text-sm">{order.customerName}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">{order.phone}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-cyan-400 font-black text-sm">₹{order.totalAmount}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-500/50 transition-all ${
                            order.status === 'Delivered' ? 'text-emerald-400' : 
                            order.status === 'Shipped' ? 'text-purple-400' :
                            order.status === 'Processing' ? 'text-blue-400' : 'text-amber-400'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No orders found for this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveProduct} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Mechanical Keyboard"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Product Image</label>
                <div className="mt-1 flex items-center gap-4">
                  {formData.image && (
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-700">
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer bg-slate-800 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-4 transition-all text-center">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon className={`h-6 w-6 ${uploadingImage ? "animate-pulse" : "text-slate-400"}`} />
                      <span className="text-xs text-slate-400">
                        {uploadingImage ? "Uploading..." : "Click to upload image"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving || uploadingImage}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                {editingProduct ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertCircle className="h-8 w-8" />
              <h3 className="text-xl font-bold">Delete Product?</h3>
            </div>
            <p className="text-slate-400 mb-8">This action is permanent and cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
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
