"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ArrowRight, Check } from "lucide-react";
import { useCart, CartItem } from "@/context/CartContext";
import Footer from "@/components/Footer";
import { cn, validatePhone } from "@/lib/utils";
import { redirectToCashfree } from "@/lib/cashfree";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart, appliedCoupon, discountAmount, finalTotal } = useCart();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'review' | 'payment' | 'processing' | 'success'>('shipping');
    const [orderInfo, setOrderInfo] = useState<{orderId: string, trackingId: string} | null>(null);
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        email: "",
        phone: "",
        countryCode: "+91",
        doorNo: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        address: "", // legacy support
        message: "",
    });
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isIndia, setIsIndia] = useState(true);

    useEffect(() => {
        const tracking_id = searchParams?.get('tracking_id');
        const order_id = searchParams?.get('order_id');
        if (tracking_id && order_id && checkoutStep !== 'success') {
            setOrderInfo({ orderId: order_id, trackingId: tracking_id });
            setCheckoutStep('success');
            
            // Read from localStorage directly to bypass hydration delays
            const cartStr = localStorage.getItem('cart');
            const cartItems = cartStr ? JSON.parse(cartStr) : [];
            
            if (cartItems.length > 0) {
                const purchasedItems = cartItems.map((item: any) => ({...item, date: new Date().toISOString()}));
                const existing = localStorage.getItem('recentlyPurchased');
                const recent = existing ? JSON.parse(existing) : [];
                localStorage.setItem('recentlyPurchased', JSON.stringify([...recent, ...purchasedItems]));
            }
            
            // Clear cart
            clearCart();
            
            // Clean URL
            router.replace('/checkout', { scroll: false });
        }
    }, [searchParams, checkoutStep, clearCart, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === "phone") {
            // Only allow numbers and one space
            const digits = value.replace(/\D/g, '').slice(0, 10);
            let formatted = digits;
            if (digits.length > 5) {
                formatted = `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
            }
            setFormData(prev => ({ ...prev, phone: formatted }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePhone(formData.phone)) {
            alert("Please enter a valid 10-digit phone number");
            return;
        }
        setCheckoutStep('review');
    };

    const handlePaymentSubmit = async () => {
        setCheckoutStep('processing');

        try {
            // Step 1: Create Order in our system as "Pending"
            const fullAddress = `${formData.doorNo}, ${formData.street}, ${formData.city} - ${formData.pincode}, ${formData.state}`;
            const fullPhone = `${formData.countryCode}${formData.phone.replace(/\D/g, '')}`;

            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: formData.customerName,
                    email: formData.email,
                    phone: fullPhone,
                    address: fullAddress,
                    message: formData.message,
                    items,
                    totalAmount: finalTotal,
                })
            });
            const orderData = await orderRes.json();

            if (!orderData.success) {
                throw new Error("Failed to create order record: " + (orderData.error || "Unknown error"));
            }

            // Step 2: Redirect directly to Cashfree using returning payment_session_id
            if (!orderData.payment_session_id) {
                throw new Error("Payment session missing from server response.");
            }

            redirectToCashfree(orderData.payment_session_id);

        } catch (error: any) {
            console.error("Payment Error:", error);
            alert(error.message || "An error occurred during payment. Please try again.");
            setCheckoutStep('payment');
        }
    };

    if (checkoutStep === 'success') {
        return (
            <main className="min-h-screen bg-slate-950 pt-24 pb-0 flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-6xl pb-32 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-12 max-w-lg mx-auto shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4 uppercase italic">Order Confirmed!</h1>
                        <p className="text-slate-400 mb-6 font-medium">
                            Thank you for your order. You will receive real-time notifications via email.
                            <br/><br/>
                            For any support, contact us through <span className="text-cyan-400 font-bold underline">Mail</span> or <span className="text-green-500 font-bold underline">WhatsApp</span>.
                            <br/><br/>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Tracking ID</span>
                            <span className="inline-block px-6 py-2 bg-slate-950 border border-slate-800 text-cyan-400 font-semibold text-2xl tracking-[0.2em] rounded-xl">
                                {orderInfo?.trackingId || 'LOADING...'}
                            </span>
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-block px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-sm"
                        >
                            Continue Shopping
                        </Link>
                    </motion.div>
                </div>
            </main>
        );
    }

    if (checkoutStep === 'processing') {
        return (
            <main className="min-h-screen bg-slate-950 pt-24 pb-0 flex items-center justify-center">
                <div className="text-center space-y-6 pb-32">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase italic tracking-tight">Securing Payment...</h2>
                        <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest mt-2 px-4">Connecting to gateway & verifying transaction</p>
                    </div>
                </div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-slate-950 pt-24 pb-0">
                <div className="container mx-auto px-4 text-center py-20 pb-32">
                    <h1 className="text-3xl font-bold text-white mb-4 uppercase">Your Cart is Empty</h1>
                    <p className="text-slate-400 mb-8">Add some products to your cart to checkout.</p>
                    <Link
                        href="/catalog"
                        className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors"
                    >
                        Browse Catalog
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-0">
            <div className="container mx-auto px-4 max-w-6xl pb-32">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <Link href="/catalog" className="inline-flex items-center text-slate-500 hover:text-white mb-4 transition-colors font-semibold text-xs uppercase tracking-widest">
                            <ArrowLeft className="mr-2 h-3 w-3" />
                            Back to Catalog
                        </Link>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter underline decoration-cyan-500/50 decoration-4 underline-offset-8">
                            Checkout
                        </h1>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-4">
                        {[
                            { step: 'shipping', label: 'Shipping' },
                            { step: 'review', label: 'Review' }
                        ].map((s, idx, arr) => (
                            <React.Fragment key={s.step}>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all",
                                        checkoutStep === s.step
                                            ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                                            : "bg-slate-900 border-slate-800 text-slate-500"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest",
                                        checkoutStep === s.step ? "text-white" : "text-slate-600"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < arr.length - 1 && <div className="w-6 h-[2px] bg-slate-800" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Forms */}
                    <AnimatePresence mode="wait">
                        {checkoutStep === 'review' ? (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                        <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3 italic">
                                            <div className="w-2 h-6 bg-cyan-500" />
                                            Review Details
                                        </h2>
                                        <button
                                            onClick={() => setCheckoutStep('shipping')}
                                            className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors underline underline-offset-4"
                                        >
                                            Edit Details
                                        </button>
                                    </div>

                                    <div className="space-y-6 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Customer Name</span>
                                                <span className="text-sm font-semibold text-white">{formData.customerName}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Phone Number</span>
                                                <span className="text-sm font-semibold text-white">{formData.countryCode} {formData.phone}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Email <span className="text-cyan-400">*Order details will be sent here*</span></span>
                                                <span className="text-sm font-semibold text-white">{formData.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 mt-6 mb-8">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Shipping Address</span>
                                                <span className="text-sm font-semibold text-white block">
                                                    {formData.doorNo}, {formData.street}
                                                </span>
                                                <span className="text-sm font-semibold text-white block mt-0.5">
                                                    {formData.city}, {formData.state} - {formData.pincode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handlePaymentSubmit}
                                        className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                                    >
                                        Place Order & Pay Now
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : checkoutStep === 'shipping' ? (
                            <motion.div
                                key="shipping"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-slate-800 pb-4 uppercase tracking-tight flex items-center gap-3 italic">
                                        <div className="w-2 h-6 bg-cyan-500" />
                                        Contact Information
                                    </h2>
                                    <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="customerName"
                                                placeholder="Enter full name"
                                                value={formData.customerName}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                                            <div className="flex gap-2">
                                                <input
                                                    required
                                                    type="text"
                                                    name="countryCode"
                                                    value={formData.countryCode}
                                                    onChange={handleInputChange}
                                                    disabled={isIndia}
                                                    className={cn(
                                                        "w-20 px-3 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm text-center caret-cyan-500",
                                                        isIndia ? "opacity-50 cursor-not-allowed" : "opacity-100"
                                                    )}
                                                />
                                                <input
                                                    required
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="XXXXX XXXXX"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="flex-1 px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                            <div className="flex items-start gap-4 px-1 pt-2">
                                                <label className="relative flex items-center cursor-pointer group mt-1">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isIndia}
                                                        onChange={(e) => {
                                                            setIsIndia(e.target.checked);
                                                            if (e.target.checked) setFormData(prev => ({ ...prev, countryCode: "+91" }));
                                                        }}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-5 h-5 rounded border-2 border-slate-800 bg-slate-950 peer-checked:bg-cyan-500 peer-checked:border-cyan-400 transition-all flex items-center justify-center">
                                                        <AnimatePresence>
                                                            {isIndia && (
                                                                <motion.div
                                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    exit={{ scale: 0.5, opacity: 0 }}
                                                                >
                                                                    <Check className="w-3.5 h-3.5 text-slate-950" strokeWidth={4.5} />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </label>
                                                <div className="flex-1 cursor-pointer" onClick={() => {
                                                    const newValue = !isIndia;
                                                    setIsIndia(newValue);
                                                    if (newValue) setFormData(prev => ({ ...prev, countryCode: "+91" }));
                                                }}>
                                                    <div className={cn("text-[10px] font-black tracking-widest uppercase transition-colors", isIndia ? "text-cyan-400" : "text-slate-500")}>
                                                        Local Order <span className="opacity-70">(India Standard +91)</span>
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1 opacity-80 italic">
                                                        Uncheck this box if you are ordering from outside India
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Door No / Flat</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="doorNo"
                                                    placeholder="House / Flat No"
                                                    value={formData.doorNo}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Street / Area</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="street"
                                                    placeholder="Street name / Colony"
                                                    value={formData.street}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-2 lg:col-span-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pincode</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="pincode"
                                                    maxLength={6}
                                                    placeholder="000 000"
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                            <div className="space-y-2 lg:col-span-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">City</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="city"
                                                    placeholder="Enter city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                            <div className="space-y-2 lg:col-span-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">State</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="state"
                                                    placeholder="Enter state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Additional Message / Delivery Notes</label>
                                            <textarea
                                                name="message"
                                                rows={2}
                                                placeholder="Any special instructions for delivery..."
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                                        >
                                            Review My Details
                                            <ArrowRight size={18} />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {/* Right Column: Order Summary */}
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-8 border-b border-slate-800 pb-4 uppercase tracking-tight flex items-center gap-3 italic">
                                <div className="w-2 h-6 bg-cyan-500" />
                                Order Summary
                            </h2>
                            <div className="space-y-6 mb-8 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                                {items.map((item: CartItem) => (
                                    <div key={item.cartId} className="flex gap-4 group">
                                        <div className="relative w-20 h-20 bg-slate-950 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-800 group-hover:border-cyan-500/30 transition-colors shadow-inner">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h3 className="text-white font-semibold text-sm mb-1">{item.name}</h3>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Quantity: {item.quantity}</p>
                                            <p className="text-cyan-400 text-sm font-bold mt-2 italic">{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-slate-800 pt-6 space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="text-white">Rs {cartTotal.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-500">
                                        <span>Coupon ({appliedCoupon.code})</span>
                                        <span>- Rs {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="text-emerald-500">Free</span>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-slate-800/50">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Total Payable</span>
                                    <span className="text-3xl font-bold text-cyan-400 leading-none">Rs {finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-cyan-500 border border-slate-800 text-xl shadow-inner">🔒</div>
                                <div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Protected</p>
                                    <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-tighter">Secure Checkout</p>
                                </div>
                            </div>
                            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-emerald-500 border border-slate-800 text-xl shadow-inner">🚚</div>
                                <div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Fast Track</p>
                                    <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-tighter">Priority Delivery</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
