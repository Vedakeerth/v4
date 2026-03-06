"use client";

import React, { useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, FileText, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart, CartItem } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export default function CartDrawer() {
    const {
        items,
        removeFromCart,
        updateQuantity,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        finalTotal
    } = useCart();

    const [couponInput, setCouponInput] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setIsValidating(true);
        setCouponError(null);

        const result = await applyCoupon(couponInput);
        if (!result.success) {
            setCouponError(result.message);
            // Clear error after 3 seconds
            setTimeout(() => setCouponError(null), 3000);
        } else {
            setCouponInput("");
        }
        setIsValidating(false);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm shadow-2xl"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-[201] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-cyan-400" size={24} />
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Quote Cart</h2>
                                <span className="bg-slate-800 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700">
                                    {items.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                    <ShoppingBag size={48} className="text-slate-700" />
                                    <p className="text-slate-400 font-medium">Your cart is empty</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-cyan-400 text-sm font-bold hover:underline"
                                    >
                                        Start browsing
                                    </button>
                                </div>
                            ) : (
                                items.map((item: CartItem) => (
                                    <div key={item.cartId} className="flex gap-4 group">
                                        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-white font-bold text-sm truncate pr-2 group-hover:text-cyan-400 transition-colors">
                                                    {item.name}
                                                </h3>
                                                <button
                                                    onClick={() => removeFromCart(item.cartId)}
                                                    className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p className="text-slate-500 text-[10px] mb-3 uppercase font-bold tracking-widest">
                                                {item.category} {item.selectedColor && `• ${item.selectedColor}`}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-slate-950/50 rounded-lg p-1 border border-slate-800">
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                                        className="p-1 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                                        className="p-1 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <span className="text-sm font-black text-white">
                                                    {typeof item.price === 'number'
                                                        ? `₹${item.price.toLocaleString('en-IN')}`
                                                        : item.price.startsWith('₹') ? item.price : `₹${item.price}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 bg-slate-950/50 border-t border-slate-800 space-y-5">
                                {/* Coupon Section */}
                                {!appliedCoupon ? (
                                    <div className="flex gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800 group focus-within:border-cyan-500/50 transition-all">
                                        <input
                                            type="text"
                                            placeholder="COUPON CODE"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            className="bg-transparent text-[10px] font-black tracking-widest text-white outline-none flex-1 placeholder:text-slate-600 px-1"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={isValidating || !couponInput}
                                            className="text-[10px] font-black uppercase text-cyan-400 hover:text-cyan-300 disabled:opacity-30 transition-all px-2"
                                        >
                                            {isValidating ? "..." : "Apply"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-cyan-500/20 rounded flex items-center justify-center text-cyan-400">
                                                <Ticket size={12} />
                                            </div>
                                            <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase">{appliedCoupon.code}</span>
                                        </div>
                                        <button
                                            onClick={removeCoupon}
                                            className="text-[10px] font-black text-slate-500 hover:text-red-400 uppercase transition-all"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                                {couponError && (
                                    <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider text-center animate-shake">
                                        {couponError}
                                    </p>
                                )}

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest">Subtotal</span>
                                        <span className="text-white font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-cyan-400/80 font-bold uppercase tracking-widest">Discount</span>
                                            <span className="text-cyan-400 font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Estimated Total</span>
                                        <span className="text-xl font-black text-cyan-400">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-xs uppercase group"
                                    >
                                        Purchase Now
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
