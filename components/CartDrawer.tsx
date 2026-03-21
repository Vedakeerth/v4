"use client";

import React, { useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Ticket, Zap, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart, CartItem } from "@/context/CartContext";
import { cn } from "@/lib/utils";

type CheckoutStep = "cart" | "form" | "processing";

export default function CartDrawer() {
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

    const [couponInput, setCouponInput] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Checkout state
    const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");
    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [payError, setPayError] = useState<string | null>(null);

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

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPayError(null);
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePurchaseNow = async (e: React.FormEvent) => {
        e.preventDefault();
        setPayError(null);

        const phone = form.phone.replace(/\D/g, '').slice(-10);
        if (phone.length < 10) {
            setPayError("Please enter a valid 10-digit phone number.");
            return;
        }
        if (!form.email.includes('@')) {
            setPayError("Please enter a valid email address.");
            return;
        }

        setCheckoutStep("processing");

        try {
            // Step 1: Save order as Pending in Firestore
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
                    items: items.map(item => ({
                        name: item.name,
                        quantity: item.quantity || 1,
                        price: typeof item.price === 'number' ? `₹${item.price}` : item.price,
                        selectedColor: item.selectedColor || null,
                        image: item.image
                    })),
                    total: finalTotal,
                    paymentMethod: 'cashfree'
                })
            });

            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error("Failed to create order. Please try again.");

            // Step 2: Create Cashfree payment session
            const cfRes = await fetch('/api/cashfree/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: finalTotal,
                    customerName: form.name,
                    email: form.email,
                    phone: form.phone,
                    orderId: orderData.orderId
                })
            });

            const cfData = await cfRes.json();
            if (!cfData.payment_session_id) {
                throw new Error(cfData.error || "Payment gateway error. Please try again.");
            }

            // Step 3: Launch Cashfree SDK — redirects to payment page
            const { load } = await import('@cashfreepayments/cashfree-js');
            const cashfree = await load({
                mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox'
            });

            await cashfree.checkout({
                paymentSessionId: cfData.payment_session_id,
                redirectTarget: "_self"
            });

        } catch (err: any) {
            console.error("Cart checkout error:", err);
            setPayError(err.message || "Something went wrong. Please try again.");
            setCheckoutStep("form");
        }
    };

    // Reset checkout step when cart closes
    const handleClose = () => {
        setIsCartOpen(false);
        setTimeout(() => {
            setCheckoutStep("cart");
            setPayError(null);
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
                        className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-[201] shadow-2xl flex flex-col"
                    >
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

                        {/* ─── CART VIEW ─── */}
                        <AnimatePresence mode="wait">
                            {checkoutStep === "cart" && (
                                <motion.div
                                    key="cart"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    className="flex flex-col h-full"
                                >
                                    {/* Header */}
                                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <ShoppingBag className="text-cyan-400" size={22} />
                                            <h2 className="text-lg font-black text-white uppercase tracking-wider">
                                                Cart
                                            </h2>
                                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-500/20">
                                                {items.length}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleClose}
                                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Items */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                                        {items.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                                <ShoppingBag size={48} className="text-slate-700" />
                                                <p className="text-slate-400 font-medium">Your cart is empty</p>
                                                <button
                                                    onClick={handleClose}
                                                    className="text-cyan-400 text-sm font-bold hover:underline"
                                                >
                                                    Browse gallery
                                                </button>
                                            </div>
                                        ) : (
                                            items.map((item: CartItem) => (
                                                <div key={item.cartId} className="flex gap-4 group p-3 bg-slate-950/30 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all">
                                                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
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
                                                                className="p-1 text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                        {item.selectedColor && (
                                                            <div className="flex items-center gap-1.5 mb-2">
                                                                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.selectedColor }} />
                                                                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Color</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 gap-1">
                                                                <button
                                                                    onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                                                >
                                                                    <Minus size={11} />
                                                                </button>
                                                                <span className="w-7 text-center text-xs font-bold text-white">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                                                >
                                                                    <Plus size={11} />
                                                                </button>
                                                            </div>
                                                            <span className="text-sm font-black text-white">
                                                                {typeof item.price === 'number'
                                                                    ? `₹${(item.price * (item.quantity || 1)).toLocaleString('en-IN')}`
                                                                    : item.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {items.length > 0 && (
                                        <div className="p-5 bg-slate-950/60 border-t border-slate-800 space-y-4">
                                            {/* Coupon */}
                                            {!appliedCoupon ? (
                                                <div className="flex gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800 focus-within:border-cyan-500/50 transition-all">
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
                                                        <Ticket size={12} className="text-cyan-400" />
                                                        <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase">{appliedCoupon.code}</span>
                                                    </div>
                                                    <button onClick={removeCoupon} className="text-[10px] font-black text-slate-500 hover:text-red-400 uppercase transition-all">
                                                        Remove
                                                    </button>
                                                </div>
                                            )}

                                            {couponError && (
                                                <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider text-center">{couponError}</p>
                                            )}

                                            {/* Totals */}
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest">Subtotal</span>
                                                    <span className="text-white font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                                                </div>
                                                {appliedCoupon && (
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-cyan-400/80 font-bold uppercase tracking-widest">Discount</span>
                                                        <span className="text-cyan-400 font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                                                    <span className="text-slate-300 font-bold uppercase tracking-widest text-sm">Total</span>
                                                    <span className="text-2xl font-black text-cyan-400">
                                                        ₹{finalTotal.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Purchase Now → slides to form */}
                                            <button
                                                onClick={() => setCheckoutStep("form")}
                                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm uppercase tracking-widest group"
                                            >
                                                <Zap size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                                                Purchase Now
                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ─── FORM VIEW ─── */}
                            {checkoutStep === "form" && (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    className="flex flex-col h-full"
                                >
                                    {/* Header */}
                                    <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                                        <button
                                            onClick={() => setCheckoutStep("cart")}
                                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all"
                                        >
                                            <ArrowRight size={16} className="rotate-180" />
                                        </button>
                                        <div>
                                            <h2 className="text-lg font-black text-white uppercase tracking-wider">
                                                Quick Pay
                                            </h2>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {items.length} item{items.length > 1 ? 's' : ''} · ₹{finalTotal.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleClose}
                                            className="ml-auto p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Items mini summary */}
                                    <div className="px-5 pt-4 pb-2 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        {items.map(item => (
                                            <div key={item.cartId} className="flex items-center gap-3 text-xs">
                                                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                </div>
                                                <span className="text-slate-300 font-medium truncate flex-1">{item.name}</span>
                                                <span className="text-slate-500 font-bold flex-shrink-0">×{item.quantity || 1}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handlePurchaseNow} className="flex flex-col flex-1 p-5 pt-3">
                                        <div className="space-y-3 flex-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2 pb-1 border-t border-slate-800">
                                                Your details
                                            </p>

                                            {[
                                                { name: "name", type: "text", placeholder: "Full Name" },
                                                { name: "phone", type: "tel", placeholder: "Phone Number (+91...)" },
                                                { name: "email", type: "email", placeholder: "Email Address" }
                                            ].map(field => (
                                                <input
                                                    key={field.name}
                                                    required
                                                    type={field.type}
                                                    name={field.name}
                                                    placeholder={field.placeholder}
                                                    value={form[field.name as keyof typeof form]}
                                                    onChange={handleFormChange}
                                                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                                                />
                                            ))}

                                            {payError && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                                                >
                                                    ⚠️ {payError}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="pt-4 space-y-3">
                                            <button
                                                type="submit"
                                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm uppercase tracking-widest group"
                                            >
                                                <Lock size={15} className="group-hover:scale-110 transition-transform" />
                                                Pay ₹{finalTotal.toLocaleString('en-IN')} Now
                                            </button>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <ShieldCheck size={12} className="text-slate-600" />
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                                    256-bit SSL · Cashfree Secured
                                                </p>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* ─── PROCESSING VIEW ─── */}
                            {checkoutStep === "processing" && (
                                <motion.div
                                    key="processing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col h-full items-center justify-center text-center p-8 space-y-6"
                                >
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                        <Zap className="absolute inset-0 m-auto text-cyan-400" size={30} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">
                                            Connecting to Gateway
                                        </h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                            Setting up secure payment...
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
