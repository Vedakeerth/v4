"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowRight, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'loading'>('verifying');
    const [orderDetails, setOrderDetails] = useState<{trackingId: string, paymentId?: string} | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const orderId = searchParams.get('order_id');
        
        if (!orderId) {
            setStatus('failed');
            setError("No Order ID found in the URL.");
            return;
        }

        const verifyOrder = async () => {
            try {
                // Call our verification API
                const res = await fetch(`/api/verify-payment?orderId=${orderId}`);
                const data = await res.json();

                if (data.success && data.status === 'paid') {
                    setStatus('success');
                    setOrderDetails({
                        trackingId: orderId,
                        paymentId: data.paymentId
                    });
                    // Clear the cart on successful payment
                    clearCart();
                } else {
                    setStatus('failed');
                    setError(data.message || `Payment status: ${data.status || 'Unknown'}`);
                }
            } catch (err: any) {
                console.error("Verification error:", err);
                setStatus('failed');
                setError("Failed to connect to the verification server.");
            }
        };

        verifyOrder();
    }, [searchParams, clearCart]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
                <div className="container mx-auto px-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {status === 'verifying' && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="text-center space-y-6"
                            >
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Verifying Payment...</h2>
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Connecting to secure gateway</p>
                                </div>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full max-w-xl"
                            >
                                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
                                    
                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                                    </div>

                                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase italic tracking-tighter">Order Confirmed!</h1>
                                    <p className="text-slate-600 dark:text-slate-400 mb-10 font-medium leading-relaxed">
                                        Your payment was successful. We have received your order and are processing it now. A confirmation email has been sent to your inbox.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Tracking ID</span>
                                            <span className="text-lg font-black text-cyan-400 tracking-wider font-mono">
                                                {orderDetails?.trackingId}
                                            </span>
                                        </div>
                                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Payment ID</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                                                {orderDetails?.paymentId || 'CF_ORDER_' + Math.random().toString(36).substr(2, 9).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link 
                                            href={`/track-order?orderId=${orderDetails?.trackingId}`} 
                                            className="flex-1 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                        >
                                            Track Order <ArrowRight size={16} />
                                        </Link>
                                        <Link 
                                            href="/" 
                                            className="flex-1 px-8 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black rounded-2xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                        >
                                            <Home size={16} /> Back Home
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    {status === 'failed' && (
                        <motion.div
                            key="failed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-xl"
                        >
                            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center shadow-2xl backdrop-blur-xl">
                                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-rose-500/20">
                                    <XCircle className="w-10 h-10 text-rose-500" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase italic tracking-tighter">Payment Failed</h1>
                                <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium italic">
                                    {error || "We couldn't verify your payment. If the amount was deducted, please contact our support team."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link 
                                        href="/checkout" 
                                        className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                                    >
                                        Try Again
                                    </Link>
                                    <Link 
                                        href="/contact" 
                                        className="px-10 py-4 border border-slate-300 dark:border-slate-700 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                                    >
                                        Contact Support
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            </main>
        </>
    );
}

export default function PaymentSuccessPage() {
    return (
        <>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                    <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                </div>
            }>
                <PaymentSuccessContent />
            </Suspense>
            <Footer />
        </>
    );
}
