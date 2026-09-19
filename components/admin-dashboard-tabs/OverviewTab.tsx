"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingBag, Package, Eye, Heart, FileText,
    TrendingUp, Activity, BarChart3, DollarSign, ArrowUpRight
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

export default function OverviewTab() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProductViews: 0,
        totalProductLikes: 0,
        totalBlogReads: 0,
        ordersByStatus: [] as { name: string; value: number; color: string }[],
        revenueByMonth: [] as { month: string; revenue: number; orders: number }[],
        topProducts: [] as { name: string; views: number; likes: number }[],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [ordersRes, productsRes, blogsRes] = await Promise.all([
                    fetch("/api/orders").then(res => res.json().catch(() => ({ success: false }))),
                    fetch("/api/products").then(res => res.json().catch(() => ({ success: false }))),
                    fetch("/api/blogs").then(res => res.json().catch(() => ({ success: false })))
                ]);

                let totalOrders = 0, totalRevenue = 0, totalProductViews = 0,
                    totalProductLikes = 0, totalBlogReads = 0;

                const statusMap: Record<string, number> = {};
                const monthMap: Record<string, { revenue: number; orders: number }> = {};

                if (ordersRes.success && Array.isArray(ordersRes.orders)) {
                    totalOrders = ordersRes.orders.length;
                    ordersRes.orders.forEach((o: any) => {
                        const status = o.status || "Unknown";
                        statusMap[status] = (statusMap[status] || 0) + 1;

                        if (status !== "Cancelled") {
                            const amt = o.totalAmount ? String(o.totalAmount).replace(/[^0-9.]/g, "") : "0";
                            totalRevenue += parseFloat(amt) || 0;
                        }

                        // group by month
                        const date = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
                        if (date) {
                            const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
                            if (!monthMap[key]) monthMap[key] = { revenue: 0, orders: 0 };
                            monthMap[key].orders += 1;
                            if (status !== "Cancelled") {
                                const amt = o.totalAmount ? String(o.totalAmount).replace(/[^0-9.]/g, "") : "0";
                                monthMap[key].revenue += parseFloat(amt) || 0;
                            }
                        }
                    });
                }

                let topProducts: { name: string; views: number; likes: number }[] = [];
                if (productsRes.success && Array.isArray(productsRes.products)) {
                    productsRes.products.forEach((p: any) => {
                        totalProductViews += (p.views || 0);
                        totalProductLikes += (p.likes || 0);
                    });
                    topProducts = [...productsRes.products]
                        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
                        .slice(0, 6)
                        .map((p: any) => ({ name: p.name?.substring(0, 18) || "—", views: p.views || 0, likes: p.likes || 0 }));
                }

                if (blogsRes.success && Array.isArray(blogsRes.blogs)) {
                    blogsRes.blogs.forEach((b: any) => { totalBlogReads += (b.reads || 0); });
                }

                const statusColors: Record<string, string> = {
                    "Delivered": "#22d3ee", "Processing": "#a78bfa", "Cancelled": "#f87171",
                    "Shipped": "#34d399", "Pending": "#fbbf24", "Unknown": "#64748b"
                };
                const ordersByStatus = Object.entries(statusMap).map(([name, value]) => ({
                    name, value, color: statusColors[name] || "#64748b"
                }));

                const revenueByMonth = Object.entries(monthMap)
                    .map(([month, d]) => ({ month, revenue: Math.round(d.revenue), orders: d.orders }))
                    .slice(-6);

                setStats({ totalOrders, totalRevenue, totalProductViews, totalProductLikes, totalBlogReads, ordersByStatus, revenueByMonth, topProducts });
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", glow: "bg-emerald-500", tab: "orders" },
        { title: "Total Orders", value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20", glow: "bg-cyan-500", tab: "orders" },
        { title: "Product Views", value: stats.totalProductViews.toLocaleString(), icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", glow: "bg-blue-500", tab: "products" },
        { title: "Product Likes", value: stats.totalProductLikes.toLocaleString(), icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/20", glow: "bg-pink-500", tab: "products" },
        { title: "Blog Reads", value: stats.totalBlogReads.toLocaleString(), icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", glow: "bg-purple-500", tab: "blogs" },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-sm">
                    <p className="font-bold text-white mb-1">{label}</p>
                    {payload.map((p: any, i: number) => (
                        <p key={i} style={{ color: p.color }} className="font-semibold text-xs">
                            {p.name}: {p.name === "revenue" ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Activity size={36} className="text-cyan-500 animate-pulse" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Compiling Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="text-cyan-500" size={28} /> Dashboard Analytics
                    </h2>
                    <p className="text-slate-500 text-base mt-1">Aggregated metrics across your platform</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {statCards.map((stat, idx) => (
                    <button
                        key={idx}
                        onClick={() => router.push(`/secure-management-portal/admin?tab=${stat.tab}`)}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group text-left hover:border-cyan-500/40 transition-all hover:-translate-y-0.5"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 ${stat.glow}`} />
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${stat.bg} ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{stat.value}</h3>
                            <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-1 ${stat.color}`}>
                                View Details <ArrowUpRight size={14} />
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Revenue + Orders Area Chart */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 uppercase tracking-widest">Revenue Over Time</h3>
                    <p className="text-slate-500 text-sm mb-6">Monthly revenue & order volume</p>
                    {stats.revenueByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={stats.revenueByMonth}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2.5} fill="url(#revGrad)" name="revenue" />
                                <Area type="monotone" dataKey="orders" stroke="#a78bfa" strokeWidth={2.5} fill="url(#ordGrad)" name="orders" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">No order data yet</div>
                    )}
                </div>

                {/* Order Status Pie */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 uppercase tracking-widest">Order Status</h3>
                    <p className="text-slate-500 text-sm mb-6">Breakdown by status</p>
                    {stats.ordersByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={stats.ordersByStatus} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                                    {stats.ordersByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [value, name]} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">No order data yet</div>
                    )}
                </div>
            </div>

            {/* Top Products Bar Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 uppercase tracking-widest">Top Products by Engagement</h3>
                <p className="text-slate-500 text-sm mb-6">Views &amp; likes per product</p>
                {stats.topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" width={130} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="views" fill="#22d3ee" radius={[0, 6, 6, 0]} name="views" />
                            <Bar dataKey="likes" fill="#f472b6" radius={[0, 6, 6, 0]} name="likes" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[240px] text-slate-400 text-sm">
                        <TrendingUp size={32} className="mr-3 opacity-30" /> No product data yet
                    </div>
                )}
            </div>
        </div>
    );
}
