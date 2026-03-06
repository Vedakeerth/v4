"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { useCart, CartItem } from "@/context/CartContext";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zip: "",
    });
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutStep('payment');
    };

    const handlePaymentSubmit = async () => {
        setCheckoutStep('processing');

        try {
            // Step 1: Create Order in our system as "Pending"
            const orderRes = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: formData,
                    items,
                    total: cartTotal,
                    paymentMethod: 'cashfree' // Unified for real gateway
                })
            });
            const orderData = await orderRes.json();

            if (!orderData.success) {
                throw new Error("Failed to create order record.");
            }

            // Step 2: Create Cashfree Payment Session
            const cashfreeRes = await fetch('/api/cashfree/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: cartTotal,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    orderId: orderData.orderId
                })
            });
            const cashfreeData = await cashfreeRes.json();

            if (!cashfreeData.payment_session_id) {
                throw new Error("Failed to initialize payment session.");
            }

            // Step 3: Load and Trigger Cashfree SDK
            const { load } = await import('@cashfreepayments/cashfree-js');
            const cashfree = await load({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox' });

            const checkoutOptions = {
                paymentSessionId: cashfreeData.payment_session_id,
                redirectTarget: "_self", // Or "_modal" for overlay
            };

            await cashfree.checkout(checkoutOptions);

            // Note: After redirection/completion, we should ideally verify.
            // But since it's a redirect flow, the page will reload or redirect to return_url.
            // If it's a modal, we can handle the result here.

        } catch (error: any) {
            console.error("Payment Error:", error);
            alert(error.message || "An error occurred during payment. Please try again.");
            setCheckoutStep('payment');
        }
    };

    if (checkoutStep === 'success') {
        return (
            <main className="min-h-screen bg-slate-950 pt-24 pb-12 flex items-center justify-center">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-12 max-w-lg mx-auto shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-4 uppercase italic">Order Confirmed!</h1>
                        <p className="text-slate-400 mb-8 font-medium">
                            Thank you for your order. We have sent a confirmation email to <span className="text-cyan-400 font-bold">{formData.email}</span>.
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
            <main className="min-h-screen bg-slate-950 pt-24 pb-12 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Securing Payment...</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 px-4">Connecting to gateway & verifying transaction</p>
                    </div>
                </div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-slate-950 pt-24 pb-12">
                <div className="container mx-auto px-4 text-center py-20">
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
        <main className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <Link href="/catalog" className="inline-flex items-center text-slate-500 hover:text-white mb-4 transition-colors font-bold text-xs uppercase tracking-widest">
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
                            { step: 'payment', label: 'Payment' }
                        ].map((s, idx) => (
                            <React.Fragment key={s.step}>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border transition-all",
                                        checkoutStep === s.step
                                            ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                                            : "bg-slate-900 border-slate-800 text-slate-500"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        checkoutStep === s.step ? "text-white" : "text-slate-600"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx === 0 && <div className="w-8 h-[2px] bg-slate-800" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Forms */}
                    <AnimatePresence mode="wait">
                        {checkoutStep === 'shipping' ? (
                            <motion.div
                                key="shipping"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
                                    <h2 className="text-xl font-black text-white mb-8 border-b border-slate-800 pb-4 uppercase tracking-tight flex items-center gap-3 italic">
                                        <div className="w-2 h-6 bg-cyan-500" />
                                        Contact Information
                                    </h2>
                                    <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">First Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="firstName"
                                                    placeholder="John"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="lastName"
                                                    placeholder="Doe"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="+91 XXXXX XXXXX"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-800">
                                            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3 italic">
                                                <div className="w-2 h-6 bg-cyan-500" />
                                                Shipping Address
                                            </h2>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Address</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        name="address"
                                                        placeholder="Building, street and area..."
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">City</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            name="city"
                                                            placeholder="Indore"
                                                            value={formData.city}
                                                            onChange={handleInputChange}
                                                            className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Postal Code</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            name="zip"
                                                            placeholder="452001"
                                                            value={formData.zip}
                                                            onChange={handleInputChange}
                                                            className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                                        >
                                            Continue to Payment
                                            <ArrowRight size={18} />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 italic">
                                            <div className="w-2 h-6 bg-cyan-500" />
                                            Confirm Order
                                        </h2>
                                        <button
                                            onClick={() => setCheckoutStep('shipping')}
                                            className="text-[10px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors underline underline-offset-4"
                                        >
                                            Edit Details
                                        </button>
                                    </div>

                                    <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800 mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Payment Provider</span>
                                            <span className="text-sm font-black text-white tracking-widest italic">CASHFREE PAYMENTS</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Click the button below to proceed to our secure payment gateway. You can pay via <span className="text-white font-bold">UPI, Cards, Net Banking, or Wallets</span>.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handlePaymentSubmit}
                                        className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                                    >
                                        Place Order & Pay Now
                                        <ArrowRight size={18} />
                                    </button>
                                    <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6 italic">Secure 256-Bit SSL Encrypted Transaction</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right Column: Order Summary */}
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-xl font-black text-white mb-8 border-b border-slate-800 pb-4 uppercase tracking-tight flex items-center gap-3 italic">
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
                                            <h3 className="text-white font-bold text-sm mb-1">{item.name}</h3>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Quantity: {item.quantity}</p>
                                            <p className="text-cyan-400 text-sm font-black mt-2 italic">{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-slate-800 pt-6 space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="text-emerald-500">Free</span>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-slate-800/50">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Payable</span>
                                    <span className="text-3xl font-black text-cyan-400 leading-none">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-cyan-500 border border-slate-800 text-xl shadow-inner">🔒</div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Protected</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Secure Checkout</p>
                                </div>
                            </div>
                            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-emerald-500 border border-slate-800 text-xl shadow-inner">🚚</div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Fast Track</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Priority Delivery</p>
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
