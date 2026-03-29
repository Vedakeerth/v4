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
    Trash2
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
    CartesianGrid
} from "recharts";

interface Order {
    id: string; // docRef.id
    trackingId?: string; // VXXXXXX
    customerName: string;
    email: string;
    phone: string;
    date?: string; // Legacy
    createdAt?: any;
    totalAmount: string | number;
    status: "Waiting" | "Order Taken" | "Processing" | "Ready to Delivery" | "Delivered" | "Cancelled" | "Pending" | "Completed";
    items: any[];
    address: string;
    notes?: string;
}

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

export default function OrdersTab() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [graphFilter, setGraphFilter] = useState<"14D" | "1M" | "3M" | "6M" | "ALL">("14D");
    const [revenueType, setRevenueType] = useState<"All" | "Product" | "Custom">("All");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalStatus, setModalStatus] = useState<Order["status"]>("Waiting");
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    
    // View mode for the lists: Active (Running), Completed (Fulfilled), Cancelled (Voided)
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
                // In-memory sort fallback for legacy orders without createdAt
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

    const updateOrderStatus = async (orderId: string, newStatus: Order["status"], e?: React.MouseEvent) => {
        if(e) { e.stopPropagation(); e.preventDefault(); }
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
            } else {
                alert(`Error: ${data.message || "Failed to update"}`);
            }
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const deleteOrder = async (orderId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure you want to PERMANENTLY delete this order? This action cannot be undone.")) return;
        
        try {
            const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                if (selectedOrder?.id === orderId) setSelectedOrder(null);
            } else {
                alert(`Error: ${data.message || "Failed to delete"}`);
            }
        } catch (error) {
            alert("Failed to delete order");
        }
    };

    const getStatusStyle = (status: Order["status"]) => {
        switch (status) {
            case "Waiting": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
            case "Order Taken":
            case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "Processing": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
            case "Ready to Delivery": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "Delivered":
            case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const getStatusIcon = (status: Order["status"]) => {
        switch (status) {
            case "Waiting": return <Clock size={14} />;
            case "Order Taken":
            case "Pending": return <Tag size={14} />;
            case "Processing": return <AlertCircle size={14} />;
            case "Ready to Delivery": return <Printer size={14} />;
            case "Delivered":
            case "Completed": return <CheckCircle2 size={14} />;
            case "Cancelled": return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const getDisplayId = (order: Order) => order.trackingId || order.id;

    const renderOrderCard = (order: Order) => {
        const isCustom = order.items?.some(item => 
            !!item.driveFileId || 
            String(item.name || "").toLowerCase().includes("quote") || 
            String(item.name || "").toLowerCase().includes("instant")
        );

        return (
            <div
                key={order.id}
                onClick={() => { setSelectedOrder(order); setModalStatus(order.status); }}
                className="bg-slate-900/40 cursor-pointer border border-slate-800/80 rounded-[2rem] p-7 h-full hover:border-cyan-500/50 transition-all group relative flex flex-col lg:flex-row gap-6 shadow-sm hover:shadow-2xl hover:shadow-cyan-950/10"
            >
                <div className={cn(
                    "absolute top-0 bottom-0 left-0 w-1 transition-opacity opacity-0 group-hover:opacity-100 rounded-l-[2rem]",
                    isCustom ? "bg-purple-500" : "bg-cyan-500"
                )} />

                {/* Details Section: 2 Columns for internal content */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-11 h-11 rounded-2xl bg-slate-950 border flex items-center justify-center transition-all shadow-inner",
                                isCustom ? "text-purple-400 border-purple-500/30 group-hover:border-purple-500" : "text-cyan-400 border-slate-800 group-hover:border-cyan-500"
                            )}>
                                {isCustom ? <Zap size={20} /> : <ShoppingBag size={20} />}
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xl italic tracking-tighter leading-none mb-1.5">{getDisplayId(order)}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                                        getStatusStyle(order.status)
                                    )}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 pl-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Client Name:</span>
                                <p className="text-slate-200 font-bold text-sm tracking-tight">{order.customerName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Email ID:</span>
                                <p className="text-slate-400 text-xs font-semibold truncate max-w-[180px]">{order.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-1">
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 shadow-inner group-hover:border-slate-700/50 transition-colors">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Shipping Address</span>
                            <span className="text-slate-300 text-xs leading-relaxed font-bold line-clamp-2 italic" title={order.address}>{order.address}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Phone Number:</span>
                            <span className="text-slate-300 text-xs font-black tracking-tight">{order.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Metadata & Actions */}
                <div className="lg:w-48 flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 lg:border-l border-slate-800/30 pt-4 lg:pt-0 lg:pl-6">
                    <div className="text-right">
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-end">
                            <Calendar size={10}/> {safeDateStr(order)}
                        </p>
                        <p className="font-black text-3xl italic tracking-tighter text-white">
                            <span className="text-xs mr-1 opacity-50 not-italic uppercase">Rs</span>
                            {parseAmt(order.totalAmount).toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                e.preventDefault();
                                setActiveActionMenu(activeActionMenu === order.id ? null : order.id);
                            }} 
                            className={cn(
                                "w-12 h-12 flex items-center justify-center rounded-2xl transition-all border shadow-inner group/btn z-10",
                                activeActionMenu === order.id 
                                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" 
                                    : "bg-slate-800/30 hover:bg-slate-800 border-slate-700/50 text-slate-400 hover:text-cyan-400"
                            )}
                        >
                            <MoreVertical size={20} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <div className={cn(
                            "absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl transition-all z-[110] overflow-hidden origin-top-right",
                            activeActionMenu === order.id 
                                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        )}>
                            <p className="px-4 py-3 text-[9px] font-black text-slate-500 bg-slate-950 border-b border-slate-800/50 uppercase tracking-[0.2em]">Lifecycle Directives</p>
                            <div className="p-1">
                                <button onClick={(e) => updateOrderStatus(order.id, "Waiting", e)} className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-400 hover:bg-slate-800 rounded-lg transition-colors border-l-2 border-transparent hover:border-slate-500 pl-4">Waiting</button>
                                <button onClick={(e) => updateOrderStatus(order.id, "Order Taken", e)} className="w-full text-left px-3 py-2 text-[11px] font-bold text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors border-l-2 border-transparent hover:border-amber-500 pl-4">Order Taken</button>
                                <button onClick={(e) => updateOrderStatus(order.id, "Processing", e)} className="w-full text-left px-3 py-2 text-[11px] font-bold text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors border-l-2 border-transparent hover:border-cyan-500 pl-4">Processing</button>
                                <button onClick={(e) => updateOrderStatus(order.id, "Ready to Delivery", e)} className="w-full text-left px-3 py-2 text-[11px] font-bold text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors border-l-2 border-transparent hover:border-blue-500 pl-4">Ready to Delivery</button>
                                <button onClick={(e) => updateOrderStatus(order.id, "Completed", e)} className="w-full text-left px-3 py-2 text-[11px] font-bold text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors border-l-2 border-transparent hover:border-emerald-500 pl-4">Completed</button>
                                <button onClick={(e) => updateOrderStatus(order.id, "Cancelled", e)} className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border-l-2 border-transparent hover:border-red-500 pl-4">Cancelled</button>
                                <div className="border-t border-slate-800/50 mt-1 pt-1">
                                    <button onClick={(e) => deleteOrder(order.id, e)} className="w-full text-left px-3 py-2 text-[11px] font-black text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 pl-4">
                                        <Trash2 size={12} /> Delete Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const filteredOrders = orders.filter(order => {
        const tId = getDisplayId(order);
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

        // Group actual orders by date (without time)
        const grouped: Record<string, { standard: number, instantQuote: number }> = {};
        orders.forEach(o => {
            if (o.status === "Cancelled") return;
            // Extract only the date part from safeDateStr
            const fullLabel = safeDateStr(o);
            if (fullLabel === "Unknown Date") return;
            const dateLabel = fullLabel.split(' — ')[0];
            
            if (!grouped[dateLabel]) grouped[dateLabel] = { standard: 0, instantQuote: 0 };
            const amt = parseAmt(o.totalAmount);
            const isInstantQuote = o.items?.some(item => 
                !!item.driveFileId || 
                String(item.name || "").toLowerCase().includes("quote") || 
                String(item.name || "").toLowerCase().includes("instant")
            );
            if (isInstantQuote) grouped[dateLabel].instantQuote += amt;
            else grouped[dateLabel].standard += amt;
        });

        // Generate the sequence of days and fill with either grouping or 0
        for (let i = daysLimit - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateLabel = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            const dayData: any = { date: dateLabel };
            if (revenueType === "All" || revenueType === "Product") dayData.standard = grouped[dateLabel]?.standard || 0;
            if (revenueType === "All" || revenueType === "Custom") dayData.instantQuote = grouped[dateLabel]?.instantQuote || 0;
            data.push(dayData);
        }
        
        return data;
    }, [orders, graphFilter, revenueType]);

    const globalTotalRevenue = useMemo(() => {
        return orders.filter(o => o.status !== "Cancelled").reduce((acc, curr) => acc + parseAmt(curr.totalAmount), 0);
    }, [orders]);

    return (
        <div className="space-y-10">
            {!isLoading && orders.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 shadow-inner relative overflow-hidden flex flex-col gap-10">
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 z-20">
                        <div>
                            <div className="flex items-center gap-2 text-slate-500 mb-2">
                                <BarChart3 size={16} />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">Total Growth Trajectory</h3>
                            </div>
                            <p className="text-5xl font-black text-white italic tracking-tighter">
                                <span className="text-cyan-500 mr-2">Rs</span>
                                {globalTotalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {["14D", "1M", "3M", "6M", "ALL"].map(f => (
                                <button key={f} onClick={() => setGraphFilter(f as any)} 
                                    className={cn("px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all", 
                                        graphFilter === f ? "bg-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/20 scale-105" : "bg-slate-800 text-slate-400 border border-slate-700/50 hover:border-slate-500")}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center bg-slate-950/40 p-1 rounded-2xl border border-slate-800/30 w-fit backdrop-blur-md">
                        {[
                            { id: "All", label: "Composite Growth", icon: <TrendingUp size={10} /> },
                            { id: "Product", label: "Catalog Units", icon: <ShoppingBag size={10} /> },
                            { id: "Custom", label: "Custom Assets", icon: <Zap size={10} /> },
                        ].map((t) => (
                            <button key={t.id} onClick={() => setRevenueType(t.id as any)} 
                                className={cn("flex items-center gap-2.5 px-6 py-2.5 rounded-[1.1rem] text-[9px] font-black uppercase tracking-widest transition-all",
                                    revenueType === t.id ? "bg-slate-800 text-white shadow-xl ring-1 ring-slate-700/50" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/30")}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-full h-[350px] z-10 mt-6 xl:-ml-6">
                        {chartData.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs italic opacity-50 font-black uppercase tracking-[0.4em]">Zero Trajectory Detected</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeOpacity={0.5} />
                                    <XAxis dataKey="date" axisLine={{ stroke: '#334155' }} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} dy={15} tickFormatter={(val) => val.slice(0, 5)} />
                                    <YAxis 
                                        domain={[0, 'auto']}
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} 
                                        tickFormatter={(val) => {
                                            if (val === 0) return "Rs 0";
                                            if (val < 1000) return `Rs ${val}`;
                                            return `Rs ${val / 1000}k`;
                                        }} 
                                        width={60} 
                                    />
                                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '20px', color: '#fff', border: '1px solid rgba(6,182,212,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} itemStyle={{ fontWeight: '900', fontSize: '13px', paddingTop: '4px' }} formatter={(value: number, name: string) => [`Rs ${value.toLocaleString('en-IN')}`, name]} labelStyle={{ color: '#64748b', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', paddingTop: '30px', opacity: 0.8 }} iconType="cross" />
                                    <Line name="Ready Stock" type="monotone" dataKey="standard" stroke="#22d3ee" strokeWidth={5} dot={{ r: 5, fill: '#020617', stroke: '#22d3ee', strokeWidth: 3 }} activeDot={{ r: 10, fill: '#22d3ee', stroke: '#020617', strokeWidth: 4 }} animationDuration={2500} connectNulls={true} />
                                    <Line name="Custom Prints" type="monotone" dataKey="instantQuote" stroke="#a855f7" strokeWidth={5} dot={{ r: 5, fill: '#020617', stroke: '#a855f7', strokeWidth: 3 }} activeDot={{ r: 10, fill: '#a855f7', stroke: '#020617', strokeWidth: 4 }} animationDuration={2500} connectNulls={true} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <div className="relative z-10 flex flex-col xl:flex-row items-center gap-6">
                    {/* Search Field */}
                    <div className="flex-1 w-full">
                        <div className="relative group flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5 group-focus-within:text-cyan-500 transition-colors z-10" />
                                <input 
                                    type="text" 
                                    placeholder="Trace ID, Client name, or Secure mail..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="w-full h-[64px] bg-slate-950/50 border-2 border-slate-800/80 rounded-[1.25rem] pl-20 pr-8 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-8 focus:ring-cyan-500/5 transition-all text-[12px] font-black uppercase tracking-[0.2em] placeholder:text-slate-600/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md caret-cyan-500" 
                                />
                            </div>
                            <button 
                                className="h-[64px] px-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-[1.25rem] text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-3 whitespace-nowrap"
                            >
                                <Zap size={16} className="fill-slate-950" />
                                Trace
                            </button>
                        </div>
                    </div>

                    {/* Inline Filters */}
                    <div className="shrink-0">
                        <div className="inline-flex p-1.5 bg-slate-950 rounded-2xl border border-slate-800/80 shadow-2xl shadow-cyan-950/5">
                            {[
                                { id: "Active", icon: <Clock size={14} />, label: "ACTIVE" },
                                { id: "Completed", icon: <CheckCircle2 size={14} />, label: "COMPLETED" },
                                { id: "Cancelled", icon: <XCircle size={14} />, label: "VOIDED" }
                            ].map((mode) => (
                                <button 
                                    key={mode.id} 
                                    onClick={() => setViewMode(mode.id as any)}
                                    className={cn(
                                        "flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative group whitespace-nowrap",
                                        viewMode === mode.id 
                                            ? "bg-slate-800 text-white shadow-xl ring-1 ring-slate-700/50" 
                                            : "text-slate-600 hover:text-slate-400 hover:bg-slate-900/50"
                                    )}
                                >
                                    {mode.icon}
                                    <span className="hidden sm:inline">{mode.label}</span>
                                    {viewMode === mode.id && (
                                        <motion.div layoutId="activeTabIndicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 text-slate-800 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">
                    <div className="w-16 h-16 border-[6px] border-slate-900 border-t-cyan-500 rounded-full animate-spin" />
                    Initializing Data Flow...
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex items-center gap-5 px-6">
                        <div className={cn("w-3 h-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]", viewMode === "Active" ? "bg-cyan-500 animate-pulse" : viewMode === "Completed" ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20")} />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                            {viewMode === "Active" ? "Live Trajectory Pipeline" : viewMode === "Completed" ? "Permanent Record Archive" : "Nullified Operational Log"}
                        </h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-slate-800 via-slate-800/50 to-transparent ml-6" />
                    </div>
                    
                    <div className="grid gap-8">
                        {(viewMode === "Active" ? activeOrders : viewMode === "Completed" ? completedOrders : cancelledOrders).map(order => renderOrderCard(order))}
                        {(viewMode === "Active" ? activeOrders : viewMode === "Completed" ? completedOrders : cancelledOrders).length === 0 && (
                            <div className="py-32 text-center bg-slate-900/10 border-2 border-slate-800/30 border-dashed rounded-[3rem]">
                                <FileText className="mx-auto h-14 w-14 text-slate-800/50 mb-6" />
                                <p className="text-slate-700 text-[11px] font-black uppercase tracking-[0.4em]">Sequence Empty at This Node</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedOrder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-xl" onClick={() => setSelectedOrder(null)}>
                        <motion.div initial={{ scale: 0.98, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-slate-800/50 w-full max-w-4xl rounded-[4rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] max-h-[92vh] overflow-y-auto custom-scrollbar relative">
                            <button onClick={() => setSelectedOrder(null)} className="absolute top-10 right-10 p-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all border border-slate-700 shadow-2xl group">
                                <XCircle size={28} className="group-hover:rotate-90 transition-transform" />
                            </button>

                            <div className="mb-14 text-left border-b border-slate-800 pb-10">
                                <div className="flex items-center gap-6 mb-4">
                                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic underline decoration-cyan-500 decoration-[12px] underline-offset-[12px]">Operational Detail</h2>
                                    {selectedOrder.notes && (
                                        <div className="relative group/note cursor-help">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-amber-500/10 text-amber-500 flex items-center justify-center animate-pulse border border-amber-500/30 shadow-xl shadow-amber-500/5">
                                                <span className="font-black text-2xl">!</span>
                                            </div>
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-6 opacity-0 group-hover/note:opacity-100 transition-all bg-slate-950 border border-amber-500/50 text-amber-100 text-[12px] font-black px-8 py-6 rounded-[2rem] pointer-events-none z-[200] w-80 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] translate-y-2 group-hover/note:translate-y-0">
                                                <p className="border-b border-amber-500/30 pb-3 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Node Logic Memo</p>
                                                <p className="italic leading-[1.6]">"{selectedOrder.notes}"</p>
                                                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-slate-950 border-r border-b border-amber-500/50 rotate-45" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                        <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em]">Trace: {getDisplayId(selectedOrder)}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Ref: {selectedOrder.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14 text-left">
                                <div className="space-y-10">
                                    <div className="bg-slate-950/80 p-10 rounded-[3rem] border border-slate-800 relative overflow-hidden group/card shadow-2xl">
                                        <div className="absolute -right-8 -top-8 text-slate-900 opacity-30 group-hover/card:text-cyan-500/10 transition-colors"><User size={150} /></div>
                                        <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 italic relative z-10 border-b border-slate-900 pb-4">Client Identification</h4>
                                        <div className="space-y-6 relative z-10">
                                            <p className="text-white font-black text-2xl italic tracking-tight uppercase">{selectedOrder.customerName}</p>
                                            <div className="space-y-3">
                                                <p className="text-xs text-slate-400 flex items-center gap-4 font-black tracking-wider hover:text-cyan-400 transition-colors cursor-pointer"><Mail size={16} className="text-cyan-500" /> {selectedOrder.email}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-4 font-black tracking-wider"><Phone size={16} className="text-cyan-500" /> {selectedOrder.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/80 p-10 rounded-[3rem] border border-slate-800 relative overflow-hidden group/card shadow-2xl">
                                        <div className="absolute -right-8 -bottom-8 text-slate-900 opacity-30 group-hover/card:text-blue-500/10 transition-colors"><MapPin size={150} /></div>
                                        <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 italic relative z-10 border-b border-slate-900 pb-4">Destination Coordinates</h4>
                                        <p className="text-sm text-slate-300 leading-[1.8] font-black italic relative z-10 decoration-slate-800 underline underline-offset-[12px] decoration-4">{selectedOrder.address}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col bg-slate-950/80 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
                                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 italic border-b border-slate-900 pb-4">Inventory Manifest</h4>
                                    <div className="space-y-6 overflow-y-auto pr-3 custom-scrollbar flex-1 mb-8">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start py-6 border-b border-slate-900/50 last:border-0 group/item transition-colors hover:bg-slate-900/20 px-4 rounded-2xl">
                                                <div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-white text-base font-black italic tracking-tight">{item.name}</p>
                                                        {item.driveFileId && (
                                                            <a href={`https://drive.google.com/uc?id=${item.driveFileId}&export=download`} target="_blank" rel="noreferrer" className="p-2.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-xl transition-all border border-purple-500/20 shadow-lg" title="Capture Asset"><Eye size={14} /></a>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-4 mt-3">
                                                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.1em]">QTY: {item.quantity}</span>
                                                        {item.selectedColor && <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.1em]">NODE: {item.selectedColor}</span>}
                                                    </div>
                                                </div>
                                                <p className="text-cyan-400 font-black text-lg italic tracking-tighter">₹{parseAmt(item.price).toLocaleString('en-IN')}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-8 border-t-4 border-slate-800 flex justify-between items-end">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Gross Payload</p>
                                        <div className="text-right">
                                            <p className="text-emerald-400 font-black text-5xl tracking-tighter italic">RS {parseAmt(selectedOrder.totalAmount).toLocaleString('en-IN')}</p>
                                            <p className="text-[9px] font-black text-slate-700 uppercase mt-2 tracking-widest">Inclusive of all network taxes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-10 rounded-[3rem] border-2 border-slate-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
                                <div className="w-full xl:w-auto z-10">
                                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5 italic border-l-4 border-cyan-500 pl-4">Lifecycle State Override</h4>
                                    <div className="relative">
                                        <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value as Order["status"])} className={cn("w-full xl:w-80 px-8 py-5 pr-14 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.4em] border-2 cursor-pointer focus:outline-none appearance-none transition-all shadow-2xl", getStatusStyle(modalStatus))}>
                                            {["Waiting", "Order Taken", "Processing", "Ready to Delivery", "Delivered", "Completed", "Cancelled"].map(s => (
                                                <option key={s} value={s} className="bg-slate-950 font-black py-4">{s}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={22} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                                    </div>
                                </div>
                                
                                <div className="flex gap-5 w-full xl:w-auto z-10">
                                    <button onClick={() => setSelectedOrder(null)} className="flex-1 xl:w-44 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-[1.5rem] transition-all uppercase tracking-[0.2em] text-[11px] border border-slate-700 shadow-xl">Close Trace</button>
                                    <button onClick={(e) => { if (modalStatus !== selectedOrder.status) updateOrderStatus(selectedOrder.id, modalStatus, e); setSelectedOrder(null); }} className="flex-1 xl:w-44 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[1.5rem] transition-all uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50">Commit Shift</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
