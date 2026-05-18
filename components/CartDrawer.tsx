"use client";

import { redirectToCashfree } from "@/lib/cashfree";
import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Ticket, Zap, Lock, ShieldCheck, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart, CartItem } from "@/context/CartContext";
import { cn, formatINR } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createSeoSlug } from "@/lib/seo-utils";

type CheckoutStep = "cart";

const getColorName = (color: string) => {
    const colorMap: Record<string, string> = {
        '#2563eb': 'Blue',
        '#ef4444': 'Red',
        '#22c55e': 'Green',
        '#eab308': 'Yellow',
        '#ffffff': 'White',
        '#000000': 'Black'
    };
    return colorMap[color.toLowerCase()] || color;
};

export default function CartDrawer() {
    const router = useRouter();
    const {
        items,
        removeFromCart,
        updateQuantity,
        updateItemColor,
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
    const [showCouponInput, setShowCouponInput] = useState(false);
    const [openColorDropdownId, setOpenColorDropdownId] = useState<string | null>(null);

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
                        className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-md bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                    <ShoppingBag className="w-5 h-5 text-cyan-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Your Cart</h2>
                                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                                        {items.length} {items.length === 1 ? 'Item' : 'Items'} Selected
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-full transition-colors group"
                            >
                                <X className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Cart Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700/50 shadow-inner">
                                        <ShoppingBag className="w-10 h-10 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 dark:text-white font-bold uppercase italic">Cart is Empty</h3>
                                        <p className="text-slate-500 text-xs font-medium max-w-[200px] mx-auto mt-1">Looks like you haven't added anything to your cart yet.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleClose();
                                            router.push('/gallery');
                                        }}
                                        className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-slate-300 dark:border-slate-700"
                                    >
                                        Browse Gallery
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
                                                className="group relative bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-3 flex gap-4 hover:border-cyan-500/20 transition-all duration-300 shadow-inner"
                                            >
                                                {/* Image */}
                                                <Link 
                                                    href={`/gallery/${createSeoSlug(item.name, item.id)}`}
                                                    onClick={() => setIsCartOpen(false)}
                                                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0 group-hover:border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                                                >
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </Link>

                                                {/* Info */}
                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <Link 
                                                                href={`/gallery/${createSeoSlug(item.name, item.id)}`}
                                                                onClick={() => setIsCartOpen(false)}
                                                                className="cursor-pointer"
                                                            >
                                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                                                            </Link>
                                                            <button
                                                                onClick={() => removeFromCart(item.cartId)}
                                                                className="text-slate-600 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {(() => {
                                                            const availableColors = ['#2563eb', '#ef4444', '#22c55e', '#eab308', '#ffffff', '#000000'];
                                                            const displayColors = item.colors && item.colors.length > 0 ? item.colors : availableColors;
                                                            const fallbackColor = (displayColors.includes('#000000') && item.name.toLowerCase().includes('plant')) ? '#000000' : (displayColors[0] || '#2563eb');
                                                            const displayColor = item.selectedColor || item.defaultColor || fallbackColor;
                                                            
                                                            return (
                                                                <div className="mt-1.5">
                                                                    {displayColors.length > 1 ? (
                                                                        <div className="relative">
                                                                            <button
                                                                                onClick={() => setOpenColorDropdownId(openColorDropdownId === item.cartId ? null : item.cartId)}
                                                                                className={cn(
                                                                                    "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all w-fit group/color",
                                                                                    openColorDropdownId === item.cartId
                                                                                        ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                                                                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-slate-400 dark:hover:border-slate-600"
                                                                                )}
                                                                            >
                                                                                <div className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: displayColor }} />
                                                                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.15em]">{getColorName(displayColor)}</span>
                                                                                <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-300", openColorDropdownId === item.cartId && "rotate-180 text-cyan-500")} />
                                                                            </button>
                                                                            
                                                                            <AnimatePresence>
                                                                                {openColorDropdownId === item.cartId && (
                                                                                    <>
                                                                                        {/* Backdrop to close */}
                                                                                        <motion.div 
                                                                                            initial={{ opacity: 0 }}
                                                                                            animate={{ opacity: 1 }}
                                                                                            exit={{ opacity: 0 }}
                                                                                            className="fixed inset-0 z-[60]" 
                                                                                            onClick={() => setOpenColorDropdownId(null)} 
                                                                                        />
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                                                            className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[70] py-2 min-w-[120px] overflow-hidden backdrop-blur-xl"
                                                                                        >
                                                                                            {displayColors.map(color => (
                                                                                                <button
                                                                                                    key={color}
                                                                                                    onClick={() => {
                                                                                                        updateItemColor(item.cartId, color);
                                                                                                        setOpenColorDropdownId(null);
                                                                                                    }}
                                                                                                    className={cn(
                                                                                                        "w-full text-left px-3 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center gap-3",
                                                                                                        displayColor === color ? "text-cyan-500 bg-cyan-500/5" : "text-slate-600 dark:text-slate-400"
                                                                                                    )}
                                                                                                >
                                                                                                    <div className="w-2 h-2 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: color }} />
                                                                                                    {getColorName(color)}
                                                                                                    {displayColor === color && <div className="ml-auto w-1 h-1 rounded-full bg-cyan-500" />}
                                                                                                </button>
                                                                                            ))}
                                                                                        </motion.div>
                                                                                    </>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-transparent bg-slate-100/50 dark:bg-slate-800/30 w-fit">
                                                                            <div className="w-1.5 h-1.5 rounded-full shrink-0 opacity-60" style={{ backgroundColor: displayColor }} />
                                                                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em]">{getColorName(displayColor)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-cyan-400 font-black italic text-sm">{formatINR(item.price)}</span>
                                                        
                                                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1">
                                                            <button
                                                                onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                                                className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 transition-colors"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity || 1}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                                                className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer / Summary */}
                        {items.length > 0 && (
                            <div className="p-4 md:p-6 bg-white dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                                {/* Coupon Section */}
                                <div className="pb-4 border-b border-slate-200 dark:border-slate-800/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <label className="relative flex items-center cursor-pointer group">
                                            <input 
                                                type="checkbox"
                                                checked={showCouponInput}
                                                onChange={(e) => setShowCouponInput(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 peer-checked:bg-cyan-500 peer-checked:border-cyan-400 transition-all flex items-center justify-center">
                                                <AnimatePresence>
                                                    {showCouponInput && (
                                                        <motion.div
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0.5, opacity: 0 }}
                                                        >
                                                            <X className="w-2.5 h-2.5 text-slate-950" strokeWidth={4} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-3.5 h-3.5 text-cyan-500" />
                                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">I HAVE A COUPON CODE</span>
                                        </div>
                                    </div>
                                    
                                    {showCouponInput && !appliedCoupon && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="flex gap-2 overflow-hidden mt-3"
                                        >
                                            <input
                                                type="text"
                                                placeholder="ENTER CODE"
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all uppercase tracking-widest"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={isValidating || !couponInput}
                                                className="px-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                                            >
                                                {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                            </button>
                                        </motion.div>
                                    )}
                                    {appliedCoupon && (
                                        <div className="flex items-center justify-between bg-cyan-500/5 border border-cyan-500/20 rounded-xl px-4 py-2.5 mt-2">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-3.5 h-3.5 text-cyan-500" />
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{appliedCoupon.code}</p>
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
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                        <span className="text-slate-900 dark:text-white">{formatINR(cartTotal)}</span>
                                    </div>
                                    
                                    {appliedCoupon && (
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                            <span className="text-slate-600 dark:text-slate-400">Discount ({appliedCoupon.code})</span>
                                            <span className="text-emerald-500">-{formatINR(discountAmount)}</span>
                                        </div>
                                    )}
                                    


                                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-1 italic">Total Amount</span>
                                                <span className="text-2xl md:text-3xl font-black text-cyan-400 italic leading-none">{formatINR(finalTotal)}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1 text-emerald-500">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Secure Checkout</span>
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
