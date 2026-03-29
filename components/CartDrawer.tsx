"use client";

import { redirectToCashfree } from "@/lib/cashfree";
import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Ticket, Zap, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart, CartItem } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type CheckoutStep = "cart";

export default function CartDrawer() {
    const router = useRouter();
    const {
        items,
        removeFromCart,
        updateQuantity,
        cartTotal,
        finalTotal,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        clearCart
    } = useCart();

    // Checkout state
    const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");
    const [couponInput, setCouponInput] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isCartOpen]);

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setIsValidating(true);
        setCouponError(null);
        const result = await applyCoupon(couponInput);
        if (!result.success) {
            setCouponError(result.message);
            setTimeout(() => setCouponError(null), 3000);
        } else {
            setCouponInput("");
        }
        setIsValidating(false);
    };

    const handleCheckoutClick = () => {
        setIsCartOpen(false);
        router.push('/checkout');
    };

    const handleClose = () => {
        setIsCartOpen(false);
        setTimeout(() => {
            setCheckoutStep("cart");
        }, 400);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                    <ShoppingBag className="w-5 h-5 text-cyan-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Your Cart</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                                        {items.length} {items.length === 1 ? 'Item' : 'Items'} Selected
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-slate-800 rounded-full transition-colors group"
                            >
                                <X className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Cart Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700/50 shadow-inner">
                                        <ShoppingBag className="w-10 h-10 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold uppercase italic">Cart is Empty</h3>
                                        <p className="text-slate-500 text-xs font-medium max-w-[200px] mx-auto mt-1">Looks like you haven't added anything to your cart yet.</p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-slate-700"
                                    >
                                        Browse Catalog
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Item List */}
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <motion.div
                                                layout
                                                key={item.cartId}
                                                className="group relative bg-slate-950/40 border border-slate-800/50 rounded-2xl p-3 flex gap-4 hover:border-cyan-500/20 transition-all duration-300 shadow-inner"
                                            >
                                                {/* Image */}
                                                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 group-hover:border-slate-700 transition-colors">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                                                            <button
                                                                onClick={() => removeFromCart(item.cartId)}
                                                                className="text-slate-600 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {item.selectedColor && (
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: item.selectedColor }} />
                                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.selectedColor}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-cyan-400 font-black italic text-sm">{item.price}</span>
                                                        
                                                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                                                            <button
                                                                onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                                                className="text-slate-500 hover:text-white p-1 transition-colors"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-xs font-bold text-white">{item.quantity || 1}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                                                className="text-slate-500 hover:text-white p-1 transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Coupon Section */}
                                    <div className="pt-4 border-t border-slate-800/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Ticket className="w-4 h-4 text-cyan-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apply Coupon Code</span>
                                        </div>
                                        
                                        {!appliedCoupon ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="ENTER CODE"
                                                    value={couponInput}
                                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-all uppercase tracking-widest"
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidating || !couponInput}
                                                    className="px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-700"
                                                >
                                                    {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-cyan-500/5 border border-cyan-500/20 rounded-xl px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                                        <Zap className="w-4 h-4 text-cyan-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Coupon Applied!</p>
                                                        <p className="text-xs font-bold text-white">{appliedCoupon.code}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={removeCoupon}
                                                    className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest underline underline-offset-4"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        {couponError && (
                                            <p className="mt-2 text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">{couponError}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer / Summary */}
                        {items.length > 0 && (
                            <div className="p-6 bg-slate-950/50 border-t border-slate-800 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    
                                    {appliedCoupon && (
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                            <span className="text-slate-500">Discount ({appliedCoupon.code})</span>
                                            <span className="text-emerald-500">-₹{discountAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-500">Shipping</span>
                                        <span className="text-emerald-500 italic">FREE</span>
                                    </div>

                                    <div className="pt-3 border-t border-slate-800">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Total Amount</span>
                                                <span className="text-3xl font-black text-cyan-400 italic leading-none">₹{finalTotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">Secure Checkout</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Lock className="w-3 h-3" />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">SSL Encrypted</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckoutClick}
                                    className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/30 uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                
                                <p className="text-center text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">
                                    By proceeding, you agree to our terms of service
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
