"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Footer from '@/components/Footer';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const oid = searchParams.get('order_id');
        if (!oid) {
            setStatus('error');
            return;
        }
        setOrderId(oid);

        const verifyPayment = async () => {
            try {
                const res = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: oid })
                });
                const data = await res.json();

                if (data.status === 'PAID' || data.success) {
                    setStatus('success');
                    clearCart();
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [searchParams, clearCart]);

    return (
        <main className="min-h-screen bg-slate-950 pt-32 pb-12 flex flex-col items-center">
            <div className="container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

                    {status === 'loading' && (
                        <div className="space-y-6">
                            <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto" />
                            <h1 className="text-2xl font-black text-white uppercase italic">Verifying Payment...</h1>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Please do not refresh the page</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h1 className="text-3xl font-black text-white uppercase italic">Payment Successful!</h1>
                            <p className="text-slate-400 font-medium">
                                Thank you for your order. We've received your payment and our team is already on it.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link
                                    href="/track-order"
                                    className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-sm"
                                >
                                    Track My Order
                                </Link>
                                <Link
                                    href="/catalog"
                                    className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h1 className="text-3xl font-black text-white uppercase italic">Payment Failed</h1>
                            <p className="text-slate-400 font-medium">
                                Your payment for order <span className="text-red-400 font-bold">#{orderId}</span> was not successful.
                                Please try again or contact support if the amount was deducted.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link
                                    href="/checkout"
                                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                                >
                                    Try Again
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                                <XCircle className="w-10 h-10 text-slate-400" />
                            </div>
                            <h1 className="text-2xl font-black text-white uppercase italic">An Error Occurred</h1>
                            <p className="text-slate-400 font-medium">
                                We couldn't retrieve your order details. Please check your email for confirmation or contact support.
                            </p>
                            <Link
                                href="/"
                                className="inline-block px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm"
                            >
                                Return Home
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
            <Footer />
        </main>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            </main>
        }>
            <SuccessContent />
        </Suspense>
    );
}
