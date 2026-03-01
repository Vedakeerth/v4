"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Ticket, Calendar, Percent, IndianRupee, X, CheckCircle2, Pencil, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Coupon {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    expiryDate: string;
    isActive: boolean;
}

export default function CouponsTab() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formData, setFormData] = useState({
        code: "",
        type: "percentage" as "percentage" | "fixed",
        value: "",
        expiryDate: ""
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/coupons");
            const data = await res.json();
            if (data.success) setCoupons(data.coupons);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCoupon = async () => {
        try {
            const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
            const method = editingCoupon ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setEditingCoupon(null);
                setFormData({ code: "", type: "percentage", value: "", expiryDate: "" });
                fetchCoupons();
            } else {
                alert(data.message || "Failed to save coupon");
            }
        } catch (error) {
            alert("Failed to save coupon");
        }
    };

    const handleEditCoupon = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value.toString(),
            expiryDate: coupon.expiryDate.split('T')[0] // Ensure date format
        });
        setShowAddModal(true);
    };

    const handleDuplicateCoupon = (coupon: Coupon) => {
        setEditingCoupon(null);
        setFormData({
            code: `${coupon.code}_COPY`,
            type: coupon.type,
            value: coupon.value.toString(),
            expiryDate: coupon.expiryDate.split('T')[0]
        });
        setShowAddModal(true);
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchCoupons();
            }
        } catch (error) {
            alert("Failed to delete coupon");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Coupons Management</h2>
                    <p className="text-slate-400 text-sm mt-1">Create and manage discount codes for your customers</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                    <Plus size={20} /> New Coupon
                </button>
            </div>

            {isLoading ? (
                <div className="text-white opacity-50 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    Loading coupons...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(coupon => (
                        <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 group hover:border-cyan-500/30 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => handleEditCoupon(coupon)}
                                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all border border-transparent hover:border-cyan-500/20 shadow-sm"
                                    title="Edit Coupon"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDuplicateCoupon(coupon)}
                                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all border border-transparent hover:border-green-500/20 shadow-sm"
                                    title="Duplicate Coupon"
                                >
                                    <Copy size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all border border-transparent hover:border-red-500/20 shadow-sm"
                                    title="Delete Coupon"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                                    <Ticket size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-xl tracking-wider leading-none">{coupon.code}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${coupon.type === 'percentage' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {coupon.type}
                                        </span>
                                        <span className="text-xs text-slate-500 font-bold">
                                            {new Date(coupon.expiryDate) < new Date() ? (
                                                <span className="text-red-400">Expired</span>
                                            ) : (
                                                <span>Active</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Discount</span>
                                    <span className="text-lg font-black text-white">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Calendar size={14} className="text-slate-600" />
                                    <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {coupons.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl">
                            <Ticket className="mx-auto text-slate-700 mb-4" size={48} />
                            <p className="text-slate-500 font-medium">No coupons found. Create your first one!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">{editingCoupon ? "Edit Coupon" : "New Coupon"}</h2>
                                <button onClick={() => { setShowAddModal(false); setEditingCoupon(null); }} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X size={24} /></button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Coupon Code</label>
                                    <input
                                        type="text"
                                        placeholder="SUMMER20"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 uppercase font-black tracking-widest"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Value</label>
                                        <div className="relative">
                                            {formData.type === 'percentage' ? (
                                                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            ) : (
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            )}
                                            <input
                                                type="number"
                                                value={formData.value}
                                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                                placeholder="10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveCoupon}
                                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-cyan-500/20 transition-all uppercase tracking-widest mt-4"
                                >
                                    {editingCoupon ? "Save Changes" : "Create Coupon"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
