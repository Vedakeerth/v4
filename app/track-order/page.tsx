"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, ArrowRight, MapPin, Calendar, CreditCard } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

// Metadata moved to layout or parent for App Router compatibility in "use client" files

const STATUS_STEPS = [
    { label: "Pending", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Processing", icon: Package, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Shipped", icon: MapPin, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Delivered", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [contact, setContact] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch(`/api/orders/track?trackingId=${orderId}&phone=${encodeURIComponent(contact)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to find order");
            }

            setOrder(data);
        } catch (err: any) {
            setError(err.message);
            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    };

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.label === order?.status);

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* Top accent */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 z-[100]" />

            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                        >
                            <Package size={12} />
                            Order Tracking
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4"
                        >
                            Track Your <span className="text-cyan-400">Order</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 font-medium max-w-md mx-auto"
                        >
                            Enter your Order ID and the email or phone number used during checkout.
                        </motion.p>
                    </div>

                    {/* Search Form */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 mb-12 shadow-[0_0_50px_rgba(0,0,0,0.3)]"
                    >
                        <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    Tracking ID
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                        <Package size={18} />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        placeholder="VK123456"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    Registered Phone Number
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                        <Search size={18} />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        placeholder="10-digit Phone"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50 group"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Track Order
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold"
                            >
                                <AlertCircle size={20} />
                                {error}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Tracking Results */}
                    <AnimatePresence mode="wait">
                        {order && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="space-y-8"
                            >
                                {/* Order Status Card */}
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                                    <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Order Summary</p>
                                            <h2 className="text-2xl font-black text-white italic tracking-tight">{order.trackingId}</h2>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-5 py-2 rounded-full ${STATUS_STEPS[currentStepIndex > -1 ? currentStepIndex : 0].bg} ${STATUS_STEPS[currentStepIndex > -1 ? currentStepIndex : 0].color} font-black text-xs uppercase tracking-widest border border-current/20`}>
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="p-8 bg-slate-950/40">
                                        <div className="relative">
                                            {/* Progress Bar Background */}
                                            <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-800 hidden md:block" />
                                            
                                            {/* Active Progress Bar */}
                                            {currentStepIndex > 0 && (
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                                                    className="absolute top-5 left-6 h-0.5 bg-cyan-500 hidden md:block"
                                                />
                                            )}

                                            <div className="flex flex-col md:flex-row justify-between relative gap-8 md:gap-0">
                                                {STATUS_STEPS.map((step, idx) => {
                                                    const isActive = idx <= currentStepIndex;
                                                    const isCurrent = idx === currentStepIndex;
                                                    const Icon = step.icon;

                                                    return (
                                                        <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1">
                                                            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                                isCurrent ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-110" : 
                                                                isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-900 text-slate-600 border border-slate-800"
                                                            }`}>
                                                                <Icon size={isCurrent ? 24 : 20} className={isCurrent ? "text-slate-950" : ""} />
                                                            </div>
                                                            <div className="flex flex-col md:items-center">
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-white" : "text-slate-600"}`}>
                                                                    {step.label}
                                                                </span>
                                                                {isActive && idx < currentStepIndex && (
                                                                    <span className="text-[10px] text-cyan-500 font-bold uppercase mt-1">Completed</span>
                                                                )}
                                                                {isCurrent && (
                                                                    <span className="text-[10px] text-cyan-400 font-bold uppercase mt-1">Current Status</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details Grid */}
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <Calendar size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Expected Delivery</span>
                                            </div>
                                            <p className="text-white font-bold ml-7">{order.estimatedDelivery}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <CreditCard size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                                            </div>
                                            <p className="text-cyan-400 font-black text-xl ml-7">{order.totalAmount}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <MapPin size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Customer</span>
                                            </div>
                                            <p className="text-white font-bold ml-7">{order.customerName}</p>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="p-8 border-t border-slate-800">
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Ordered Items</h3>
                                        <div className="space-y-4">
                                            {order.items?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-800">
                                                            <Package size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-sm">{item.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Quantity: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Support Info */}
                                <div className="text-center text-slate-500 p-8 rounded-3xl border border-dashed border-slate-800">
                                    <p className="text-xs font-medium mb-4 italic">Need help with your order?</p>
                                    <a 
                                        href="https://wa.me/919876543210" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-cyan-400 font-bold hover:text-cyan-300 transition-colors uppercase tracking-widest text-[10px]"
                                    >
                                        Contact support on WhatsApp
                                        <ArrowRight size={14} />
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <Footer />
        </main>
    );
}
