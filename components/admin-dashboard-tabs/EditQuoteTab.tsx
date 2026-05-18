"use client";

import React, { useState } from "react";
import { Search, Save, User, Mail, Phone, MapPin, IndianRupee, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    trackingId?: string;
    customerName: string;
    email: string;
    phone: string;
    totalAmount: string | number;
    status: string;
    address: string;
    notes?: string;
    items?: any[];
}

export default function EditQuoteTab() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form states
    const [formData, setFormData] = useState<Partial<Order>>({});

    const fetchOrder = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setError("");
        setOrder(null);
        setSaveSuccess(false);

        try {
            // First we need to fetch all orders since there's no single fetch by tracking ID yet,
            // or we could assume the searchTerm is the document ID. Let's fetch all and filter for robustness.
            const res = await fetch("/api/orders");
            const data = await res.json();
            
            if (data.success) {
                const found = data.orders.find((o: Order) => 
                    o.id === searchTerm.trim() || 
                    (o.trackingId && o.trackingId.toLowerCase() === searchTerm.trim().toLowerCase())
                );

                if (found) {
                    setOrder(found);
                    setFormData({
                        customerName: found.customerName,
                        email: found.email,
                        phone: found.phone,
                        address: found.address,
                        totalAmount: found.totalAmount,
                        notes: found.notes || "",
                        items: found.items ? JSON.parse(JSON.stringify(found.items)) : []
                    });
                } else {
                    setError("Quotation/Order not found with that ID.");
                }
            } else {
                setError("Failed to fetch orders.");
            }
        } catch (err) {
            setError("An error occurred while fetching.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!order) return;
        setIsSaving(true);
        setSaveSuccess(false);
        setError("");

        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.success) {
                setSaveSuccess(true);
                setOrder({ ...order, ...formData } as Order);
            } else {
                setError(data.message || "Failed to update quotation.");
            }
        } catch (err) {
            setError("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: string, value: string | number) => {
        setFormData(prev => {
            if (!prev.items) return prev;
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            
            // Auto recalculate total amount if prices/quantities change
            let newTotal = 0;
            newItems.forEach(item => {
                const p = parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
                const q = parseInt(String(item.quantity)) || 1;
                newTotal += p * q; // Note: this is an approximation if they want it to auto-sum
            });
            
            // We only auto-update total if it was a price/qty change, but let's let them explicitly set total if needed.
            // Actually, best to just let them manually update the total to avoid overriding coupon discounts.
            return { ...prev, items: newItems };
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900/40 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">Edit Quotation / Order</h2>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Enter Trace ID or Document ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchOrder()}
                            className="w-full h-14 bg-white dark:bg-slate-950/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pl-16 pr-6 text-sm font-bold focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <button
                        onClick={fetchOrder}
                        disabled={isLoading}
                        className="h-14 px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Fetching..." : "Fetch"}
                    </button>
                </div>

                {error && (
                    <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-sm">
                        {error}
                    </div>
                )}

                {saveSuccess && (
                    <div className="p-4 mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-bold text-sm">
                        Quotation updated successfully!
                    </div>
                )}

                {order && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Client Details */}
                        <div className="space-y-6 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">Client Details</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2 mb-1">
                                        <User size={12} /> Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName || ""}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2 mb-1">
                                        <Mail size={12} /> Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ""}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2 mb-1">
                                        <Phone size={12} /> Phone
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone || ""}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2 mb-1">
                                        <MapPin size={12} /> Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address || ""}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Details & Items */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Quotation Items</h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.items && formData.items.length > 0 ? (
                                        formData.items.map((item, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase text-slate-500 mb-1 block">Model Name</label>
                                                    <input
                                                        type="text"
                                                        value={item.name || ""}
                                                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-500"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold uppercase text-slate-500 mb-1 block">Unit Price (₹)</label>
                                                        <input
                                                            type="text"
                                                            value={item.price || ""}
                                                            onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-500 text-cyan-500"
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <label className="text-[9px] font-bold uppercase text-slate-500 mb-1 block">Quantity</label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity || 1}
                                                            onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 italic">No items found for this order.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Financials & Notes</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2 mb-1">
                                            <IndianRupee size={12} /> Total Amount (₹)
                                        </label>
                                        <input
                                            type="text"
                                            name="totalAmount"
                                            value={formData.totalAmount || ""}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-lg font-black text-cyan-500 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2 mb-1">
                                            <FileText size={12} /> Admin Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes || ""}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Add private notes here..."
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-500 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                            >
                                <Save size={18} />
                                {isSaving ? "Saving Changes..." : "Save Quotation"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
