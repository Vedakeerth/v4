"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    ChevronDown,
    MoreVertical,
    Mail,
    Phone,
    Calendar,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Eye,
    Tag,
    User,
    ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    date: string;
    totalAmount: string;
    status: "Pending" | "Processing" | "Completed" | "Cancelled";
    items: any[];
    address: string;
    notes?: string;
}

export default function OrdersTab() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<Order["status"] | "All">("All");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/orders");
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                }
            }
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: Order["status"]) => {
        switch (status) {
            case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "Processing": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
            case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
        }
    };

    const getStatusIcon = (status: Order["status"]) => {
        switch (status) {
            case "Pending": return <Clock size={14} />;
            case "Processing": return <AlertCircle size={14} />;
            case "Completed": return <CheckCircle2 size={14} />;
            case "Cancelled": return <XCircle size={14} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search orders, customers, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 scrollbar-hide">
                    {["All", "Pending", "Processing", "Completed", "Cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border",
                                statusFilter === status
                                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20"
                                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table/Grid */}
            {isLoading ? (
                <div className="py-20 flex justify-center text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
                    Scanning Orders...
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="py-20 text-center bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl">
                    <FileText className="mx-auto h-12 w-12 text-slate-700 mb-4" />
                    <h3 className="text-white font-bold mb-1">No orders found</h3>
                    <p className="text-slate-500 text-sm">Adjust your filters or search term</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-white font-bold text-lg">{order.customerName}</h3>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5",
                                                getStatusStyle(order.status)
                                            )}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Mail size={12} /> {order.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone size={12} /> {order.phone}</span>
                                            <span className="flex items-center gap-1.5 text-cyan-500/60 font-black"><Tag size={12} /> {order.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-12">
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Order Date</p>
                                        <p className="text-white font-bold text-sm">{order.date}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="text-cyan-400 font-black text-xl">{order.totalAmount}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow-sm"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <div className="relative group/menu">
                                            <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow-sm">
                                                <MoreVertical size={18} />
                                            </button>
                                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-20 overflow-hidden">
                                                <p className="px-4 py-2 text-[10px] font-black text-slate-600 border-b border-slate-800 uppercase tracking-widest">Update Status</p>
                                                <button onClick={() => updateOrderStatus(order.id, "Pending")} className="w-full text-left px-4 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-colors">Mark Pending</button>
                                                <button onClick={() => updateOrderStatus(order.id, "Processing")} className="w-full text-left px-4 py-2 text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors">Mark Processing</button>
                                                <button onClick={() => updateOrderStatus(order.id, "Completed")} className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors">Mark Completed</button>
                                                <button onClick={() => updateOrderStatus(order.id, "Cancelled")} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors text-right border-t border-slate-800">Cancel Order</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative"
                        >
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-all border border-slate-700"
                            >
                                <XCircle size={24} />
                            </button>

                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic underline decoration-cyan-500/50 decoration-4 underline-offset-8">Order Details</h2>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ml-4",
                                        getStatusStyle(selectedOrder.status)
                                    )}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Reference: <span className="text-cyan-500">{selectedOrder.id}</span></p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-6">
                                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50">
                                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                                            <User size={12} /> Customer Information
                                        </h4>
                                        <div className="space-y-3">
                                            <p className="text-white font-bold">{selectedOrder.customerName}</p>
                                            <p className="text-sm text-slate-400 flex items-center gap-2"><Mail size={14} className="text-cyan-500" /> {selectedOrder.email}</p>
                                            <p className="text-sm text-slate-400 flex items-center gap-2"><Phone size={14} className="text-cyan-500" /> {selectedOrder.phone}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50">
                                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                                            <Calendar size={12} /> Delivery Address
                                        </h4>
                                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                            {selectedOrder.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50 h-full">
                                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                                            <ShoppingBag size={12} /> Order Items
                                        </h4>
                                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0 group/item">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-white text-sm font-bold">{item.name}</p>
                                                            {item.driveFileId && (
                                                                <a
                                                                    href={`https://drive.google.com/uc?id=${item.driveFileId}&export=download`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all border border-cyan-500/20 group-hover/item:border-cyan-500/40"
                                                                    title="Download/View STL File"
                                                                >
                                                                    <Eye size={12} />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Qty: {item.quantity} {item.selectedColor && `• ${item.selectedColor}`}</p>
                                                    </div>
                                                    <p className="text-white font-black text-sm">{item.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-4 border-t-2 border-slate-800 flex justify-between items-end">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount</p>
                                            <p className="text-2xl font-black text-cyan-400 leading-none">{selectedOrder.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="mb-10 bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <AlertCircle size={12} /> Customer Notes
                                    </h4>
                                    <p className="text-amber-200/60 text-sm italic italic leading-relaxed">
                                        "{selectedOrder.notes}"
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => updateOrderStatus(selectedOrder.id, "Processing")}
                                    className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs"
                                >
                                    Start Processing
                                </button>
                                <button
                                    onClick={() => updateOrderStatus(selectedOrder.id, "Completed")}
                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs"
                                >
                                    Mark as Delivered
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
