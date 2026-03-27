"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Lock, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Product } from "@/lib/products";
import { parsePrice } from "@/lib/utils";
import { redirectToCashfree } from "@/lib/cashfree";

interface BuyNowModalProps {
    product: Product;
    quantity?: number;
    selectedColor?: string | null;
    onClose: () => void;
}

export default function BuyNowModal({ product, quantity = 1, selectedColor, onClose }: BuyNowModalProps) {
    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [step, setStep] = useState<"form" | "processing">("form");
    const [error, setError] = useState<string | null>(null);

    const price = parsePrice(product.price);
    const totalAmount = price * quantity;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        const phone = form.phone.replace(/\D/g, '').slice(-10);
        if (phone.length < 10) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }
        if (!form.email.includes('@')) {
            setError("Please enter a valid email address.");
            return;
        }

        setStep("processing");

        try {
            // Step 1: Create order in Firestore as Pending
            const orderId = `BUY-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

            const orderRes = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: {
                        firstName: form.name.split(' ')[0] || form.name,
                        lastName: form.name.split(' ').slice(1).join(' ') || '',
                        email: form.email,
                        phone: form.phone,
                        address: 'To be confirmed',
                        city: '',
                        zip: ''
                    },
                    items: [{
                        name: product.name,
                        quantity,
                        price: typeof product.price === 'number'
                            ? `₹${product.price}`
                            : product.price,
                        selectedColor: selectedColor || null,
                        image: product.image
                    }],
                    total: totalAmount,
                    paymentMethod: 'cashfree'
                })
            });

            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error("Failed to create order.");

            // Step 2: Create Cashfree payment session
            const cfRes = await fetch('/api/cashfree/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    customerName: form.name,
                    email: form.email,
                    phone: form.phone,
                    orderId: orderData.orderId
                })
            });

            const cfData = await cfRes.json();
            if (!cfData.payment_session_id) {
                throw new Error(cfData.error || "Failed to initialize payment. Please try again.");
            }

            // Step 3: Redirect directly to Cashfree (same window)
            redirectToCashfree(cfData.payment_session_id);

        } catch (err: any) {
            console.error("Buy Now error:", err);
            setError(err.message || "Something went wrong. Please try again.");
            setStep("form");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.08)]"
                >
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 z-10 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all border border-slate-700"
                    >
                        <X size={16} />
                    </button>

                    {step === "processing" ? (
                        /* Processing State */
                        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                <Zap className="absolute inset-0 m-auto text-cyan-400" size={28} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">
                                Connecting to Payment
                            </h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                Setting up secure gateway...
                            </p>
                        </div>
                    ) : (
                        /* Form State */
                        <div className="p-7">
                            {/* Product mini card */}
                            <div className="flex items-center gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl mb-7">
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{product.name}</p>
                                    {selectedColor && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: selectedColor }} />
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Color Selected</span>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                        Qty: {quantity}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total</p>
                                    <p className="text-xl font-black text-cyan-400">
                                        ₹{totalAmount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-lg font-black text-white uppercase italic tracking-tight mb-1 flex items-center gap-2">
                                <Zap size={18} className="text-cyan-400" />
                                Instant Checkout
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">
                                Pay directly — no lengthy forms
                            </p>

                            <form onSubmit={handlePay} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Full Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Phone Number
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        placeholder="+91 98765 43210"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Email Address
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        placeholder="john@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                                    >
                                        ⚠️ {error}
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 uppercase tracking-widest text-sm flex items-center justify-center gap-2 mt-2 group"
                                >
                                    <Lock size={16} className="group-hover:scale-110 transition-transform" />
                                    Pay ₹{totalAmount.toLocaleString('en-IN')} Now
                                </button>
                            </form>

                            <div className="flex items-center gap-2 mt-5 justify-center">
                                <ShieldCheck size={14} className="text-slate-600" />
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                    256-bit SSL • Secured by Cashfree
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
