"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
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
    ShoppingBag,
    MapPin,
    TrendingUp,
    BarChart3,
    Zap,
    Printer,
    Trash2,
    Layers,
    Cpu,
    Filter,
    ArrowUpRight,
    Activity,
    Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    AreaChart,
    Area
} from "recharts";
import OrderDetailModal from "./OrderDetailModal";

interface Order {
    id: string; 
    trackingId?: string; 
    customerName: string;
    email: string;
    phone: string;
    date?: string; 
    createdAt?: any;
    totalAmount: string | number;
    status: "Waiting" | "Confirmed" | "Order Taken" | "Processing" | "Ready to Delivery" | "Delivered" | "Cancelled" | "Pending" | "Completed";
    items: any[];
    address: string;
    notes?: string;
    quotationId?: string;
    pdfUrl?: string;
    megaFolderUrl?: string;
    paymentId?: string;
    paymentStatus?: string;
    shippingPartner?: string;
    carrierTrackingId?: string;
}

const STATUS_OPTIONS = [
    "Waiting",
    "Confirmed",
    "Order Taken",
    "Processing",
    "Ready to Delivery",
    "Delivered",
    "Completed",
    "Cancelled"
];

const parseAmt = (val: any) => {
    if (!val) return 0;
    const stripped = String(val).replace(/[^0-9.]/g, "");
    const num = parseFloat(stripped);
    return isNaN(num) ? 0 : num;
};

const safeDateStr = (order: Order) => {
    if (order.createdAt && typeof order.createdAt._seconds === 'number') {
        const d = new Date(order.createdAt._seconds * 1000);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
               " — " + 
               d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return order.date || "Unknown Date";
};

export default function OrdersManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [graphFilter, setGraphFilter] = useState<"14D" | "1M" | "3M" | "6M" | "ALL">("14D");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState<Order["status"]>("Waiting");
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"Active" | "Completed" | "Cancelled">("Active");

    useEffect(() => {
        const handleClickOutside = () => setActiveActionMenu(null);
        if (activeActionMenu) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [activeActionMenu]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/orders");
            const data = await res.json();
            if (data.success) {
                const sorted = data.orders.sort((a: any, b: any) => {
                    const timeA = a.createdAt?._seconds || 0;
                    const timeB = b.createdAt?._seconds || 0;
                    return timeB - timeA;
                });
                setOrders(sorted);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: Order["status"], shippingDetails?: { partner: string, trackingId: string }, e?: React.MouseEvent) => {
        if(e) { e.stopPropagation(); e.preventDefault(); }
        try {
            const body: any = { status: newStatus };
            if (shippingDetails) {
                body.shippingPartner = shippingDetails.partner;
                body.carrierTrackingId = shippingDetails.trackingId;
            }

            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { 
                    ...o, 
                    status: newStatus,
                    shippingPartner: shippingDetails?.partner || o.shippingPartner,
                    carrierTrackingId: shippingDetails?.trackingId || o.carrierTrackingId
                } : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => prev ? { 
                        ...prev, 
                        status: newStatus,
                        shippingPartner: shippingDetails?.partner || (prev as any).shippingPartner,
                        carrierTrackingId: shippingDetails?.trackingId || (prev as any).carrierTrackingId
                    } : null);
                    setModalStatus(newStatus);
                }
            } else {
                alert(`Error: ${data.message || "Failed to update"}`);
            }
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const deleteOrder = async (orderId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure?")) return;
        
        try {
            const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(null);
                    setIsModalOpen(false);
                }
            } else {
                alert(`Error: ${data.message || "Failed to delete"}`);
            }
        } catch (error) {
            alert("Failed to delete order");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Waiting": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
            case "Confirmed":
            case "Pending":
            case "Order Taken": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "Processing": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
            case "Ready to Delivery": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Delivered":
            case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const openModal = (order: Order) => {
        setSelectedOrder(order);
        setModalStatus(order.status);
        setIsModalOpen(true);
    };

    const filteredOrders = orders.filter(order => {
        const tId = order.trackingId || order.id;
        return (
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone.includes(searchTerm)
        );
    });

    const activeOrders = filteredOrders.filter(o => !["Delivered", "Cancelled", "Completed"].includes(o.status));
    const completedOrders = filteredOrders.filter(o => ["Delivered", "Completed"].includes(o.status));
    const cancelledOrders = filteredOrders.filter(o => o.status === "Cancelled");

    const chartData = useMemo(() => {
        const data: any[] = [];
        const now = new Date();
        let daysLimit = 14;
        if (graphFilter === "1M") daysLimit = 30;
        if (graphFilter === "3M") daysLimit = 90;
        if (graphFilter === "6M") daysLimit = 180;
        if (graphFilter === "ALL") daysLimit = 365;

        const grouped: Record<string, { standard: number, instantQuote: number }> = {};
        orders.forEach(o => {
            if (o.status === "Cancelled") return;
            const fullLabel = safeDateStr(o);
            if (fullLabel === "Unknown Date") return;
            const dateLabel = fullLabel.split(' — ')[0];
            
            if (!grouped[dateLabel]) grouped[dateLabel] = { standard: 0, instantQuote: 0 };
            const amt = parseAmt(o.totalAmount);
            const isInstantQuote = (o.trackingId || o.id).startsWith("VQ") || o.items?.some(item => 
                !!item.driveFileId || !!item.fileUrl
            );
            if (isInstantQuote) grouped[dateLabel].instantQuote += amt;
            else grouped[dateLabel].standard += amt;
        });

        for (let i = daysLimit - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateLabel = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            const dayData: any = { date: dateLabel };
            dayData.standard = grouped[dateLabel]?.standard || 0;
            dayData.instantQuote = grouped[dateLabel]?.instantQuote || 0;
            data.push(dayData);
        }
        return data;
    }, [orders, graphFilter]);

    const globalTotalRevenue = useMemo(() => {
        return orders.filter(o => o.status !== "Cancelled").reduce((acc, curr) => acc + parseAmt(curr.totalAmount), 0);
    }, [orders]);

    return (
        <div className="w-full space-y-8 bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] transition-all border border-slate-200 dark:border-white/5 shadow-sm">
            {/* Header Analytics Dashboard */}
            {!isLoading && orders.length > 0 && (
                <div className="bg-white dark:bg-black rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-slate-200 dark:border-white/5 relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-cyan-500/5 dark:from-cyan-500/10 to-transparent blur-3xl rounded-full opacity-50 pointer-events-none" />
                    
                    <div className="flex flex-col xl:flex-row gap-10 relative z-10">
                        {/* Summary Stats */}
                        <div className="xl:w-1/3 flex flex-col justify-between py-2">
                            <div>
                                <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400 mb-6">
                                    <Activity size={18} className="animate-pulse" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Network Growth Metrics</h3>
                                </div>
                                <p className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none mb-4">
                                    <span className="text-xl text-cyan-500/40 mr-2 not-italic">RS</span>
                                    {globalTotalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ArrowUpRight size={14} className="text-emerald-500" /> 
                                    Aggregated Value Across {orders.length} Nodes
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm">
                                    <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Active Pulse</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{activeOrders.length}</p>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm">
                                    <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Finalized</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{completedOrders.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Chart */}
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="flex justify-between items-center bg-slate-100/50 dark:bg-black/40 backdrop-blur-xl p-1.5 rounded-xl border border-slate-200 dark:border-white/10 self-end shadow-sm">
                                {["14D", "1M", "3M", "6M", "ALL"].map(f => (
                                    <button key={f} onClick={() => setGraphFilter(f as any)} 
                                        className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", 
                                            graphFilter === f 
                                                ? "bg-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/20" 
                                                : "text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
                                        {f}
                                    </button>
                                ))}
                            </div>

                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 8, fontWeight: '900' }} className="text-slate-400 dark:text-white/40" dy={10} tickFormatter={(v) => v.slice(0, 5)} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 8, fontWeight: '900' }} className="text-slate-400 dark:text-white/40" tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                            cursor={{ stroke: 'currentColor', strokeWidth: 1 }}
                                        />
                                        <Area type="monotone" dataKey="standard" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorCyan)" />
                                        <Area type="monotone" dataKey="instantQuote" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPurple)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 z-10 transition-colors group-focus-within:text-cyan-500" />
                    <input 
                        type="text" 
                        placeholder="TRACKING ID, CLIENT SIGNATURE..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl pl-16 pr-6 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all text-[10px] font-black uppercase tracking-[0.2em] placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm" 
                    />
                </div>

                <div className="flex p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shrink-0 shadow-sm">
                    {[
                        { id: "Active", label: "ACTIVE" },
                        { id: "Completed", label: "ARCHIVED" },
                        { id: "Cancelled", label: "VOIDED" }
                    ].map(mode => (
                        <button key={mode.id} onClick={() => setViewMode(mode.id as any)}
                            className={cn("px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                viewMode === mode.id 
                                    ? "bg-slate-50 dark:bg-slate-800 text-cyan-500 shadow-lg border border-slate-100 dark:border-white/10" 
                                    : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}>
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Section */}
            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.4em] animate-pulse">Syncing Network Nodes...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 px-4">
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", viewMode === "Active" ? "bg-cyan-500" : viewMode === "Completed" ? "bg-emerald-500" : "bg-red-500")} />
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic flex items-center gap-3">
                            {viewMode === "Active" ? "Operational Pipeline" : viewMode === "Completed" ? "Cold Storage Logs" : "Interrupted Sessions"}
                            <span className="w-10 h-px bg-slate-200 dark:bg-white/10" />
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {(viewMode === "Active" ? activeOrders : viewMode === "Completed" ? completedOrders : cancelledOrders).map(order => {
                            const tId = order.trackingId || order.id;
                            const isCustom = tId.startsWith("VQ") || order.items?.some(i => !!i.driveFileId || !!i.fileUrl);

                            return (
                                <motion.div 
                                    layout
                                    key={order.id}
                                    onClick={() => openModal(order)}
                                    className={cn(
                                        "group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 flex flex-col lg:flex-row items-center gap-8 cursor-pointer hover:shadow-2xl hover:border-cyan-500/30 transition-all hover:-translate-y-1",
                                        activeActionMenu === order.id ? "z-[60]" : "z-10"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/[0.02] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    {/* ID & Status */}
                                    <div className="lg:w-56 shrink-0 flex items-center gap-5 relative z-10">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all shadow-inner", isCustom ? "bg-purple-500/10 border-purple-500/20 text-purple-500" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-500")}>
                                            {isCustom ? <Zap size={20} /> : <ShoppingBag size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-1">{tId}</h4>
                                            <div className={cn("px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-2", getStatusStyle(order.status))}>
                                                <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client Details */}
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left border-l border-slate-100 dark:border-white/5 pl-0 lg:pl-8 relative z-10">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <User size={10} className="text-cyan-500" /> Subject Identifier
                                            </p>
                                            <p className="text-slate-900 dark:text-white font-black text-xs uppercase mb-0.5">{order.customerName}</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold truncate max-w-[180px]">{order.email}</p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <MapPin size={10} className="text-purple-500" /> Logistic Node
                                            </p>
                                            <p className="text-slate-700 dark:text-slate-400 text-[10px] font-semibold italic line-clamp-2">{order.address}</p>
                                        </div>
                                    </div>

                                    {/* Totals & Metadata */}
                                    <div className="lg:w-64 flex items-center justify-between lg:justify-end gap-8 border-l border-slate-100 dark:border-white/5 pl-0 lg:pl-8 text-right w-full lg:w-auto relative z-10">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2 justify-end">
                                                <Calendar size={10} className="text-cyan-500" /> Operational Timestamp
                                            </p>
                                            <p className="text-slate-900 dark:text-white font-black text-[10px] uppercase mb-2">{safeDateStr(order)}</p>
                                            <div className="flex items-center gap-4 justify-end">
                                                <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                                                    <span className="text-[10px] mr-1 opacity-40 not-italic uppercase font-bold text-slate-500">Rs</span>
                                                    {parseAmt(order.totalAmount).toLocaleString('en-IN')}
                                                </p>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === order.id ? null : order.id); }}
                                                    className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 transition-all shadow-inner"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Dropdown */}
                                    <AnimatePresence>
                                        {activeActionMenu === order.id && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-8 top-full mt-4 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[50] overflow-hidden backdrop-blur-xl"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="p-1.5 space-y-0.5">
                                                    {STATUS_OPTIONS.map(s => (
                                                        <button 
                                                            key={s} 
                                                            onClick={(e) => updateOrderStatus(order.id, s as any, undefined, e)}
                                                            className="w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-cyan-500 transition-all flex items-center gap-3"
                                                        >
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", getStatusStyle(s as any))} />
                                                            {s}
                                                        </button>
                                                    ))}
                                                    <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-1.5" />
                                                    <button 
                                                        onClick={(e) => deleteOrder(order.id, e)}
                                                        className="w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-all flex items-center gap-3"
                                                    >
                                                        <Trash2 size={12} /> Delete Permanent
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            <OrderDetailModal 
                isOpen={isModalOpen}
                order={selectedOrder}
                onClose={() => setIsModalOpen(false)}
                status={modalStatus}
                onStatusChange={(s) => setModalStatus(s)}
                onUpdateStatus={(id, s, details) => updateOrderStatus(id, s, details)}
            />
        </div>
    );
}
