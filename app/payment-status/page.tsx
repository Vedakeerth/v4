"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, Zap, ArrowRight, ShieldCheck, ShoppingBag, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import QuotationDocument from "@/components/QuotationDocument";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { formatINR, getColorName } from "@/lib/utils";

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    
    const orderId = searchParams.get("order_id");
    const [status, setStatus] = useState<"verifying" | "paid" | "failed" | "pending">("verifying");
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const templateRef = useRef<HTMLDivElement>(null);

    const downloadInvoice = async (id: string, autoUpload: boolean = false) => {
        if (!templateRef.current) return;
        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(templateRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            
            // Save locally
            pdf.save(`INVOICE-${id}.pdf`);

            // Auto-upload to MEGA if requested
            if (autoUpload) {
                setIsUploading(true);
                try {
                    const pdfBase64 = pdf.output('datauristring');
                    console.log(`[MEGA] Prepared PDF data URI (length: ${pdfBase64.length})`);
                    
                    const response = await fetch('/api/orders/upload-invoice', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: id,
                            pdfBase64,
                            fileName: `INVOICE-${id}.pdf`
                        })
                    });
                    
                    const uploadResult = await response.json();
                    if (uploadResult.success) {
                        console.log("[MEGA] Auto-upload successful:", uploadResult.url);
                    } else {
                        console.error("[MEGA] Auto-upload failed server-side:", uploadResult.error);
                    }
                } catch (err) {
                    console.error("[MEGA] Auto-upload failed network-side:", err);
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (err) {
            console.error("PDF download failed:", err);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    useEffect(() => {
        if (!orderId) {
            setStatus("failed");
            setError("No Order ID found in URL.");
            return;
        }

        const verifyPayment = async () => {
            try {
                // Call the verify API
                const res = await fetch("/api/cashfree/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId })
                });

                const data = await res.json();

                if (data.success && data.status === "PAID") {
                    setStatus("paid");
                    clearCart(); // Success - clear the cart
                    
                    // Fetch order details for the invoice
                    try {
                        const orderRes = await fetch(`/api/orders/public?id=${orderId}`);
                        const orderData = await orderRes.json();
                        if (orderData.success) {
                            setOrderDetails(orderData.order);
                            // Auto-download AND Auto-upload after a short delay
                            setTimeout(() => {
                                downloadInvoice(orderId || 'ORDER', true);
                            }, 1500);
                        }
                    } catch (fetchErr) {
                        console.error("Failed to fetch order details:", fetchErr);
                    }
                } else if (data.status === "PENDING" || data.status === "ACTIVE") {
                    setStatus("pending");
                } else {
                    setStatus("failed");
                    setError(data.message || "Payment verification failed.");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus("failed");
                setError("Network error while verifying payment.");
            }
        };

        // Add a slight delay for better UX (feels more thorough)
        const timer = setTimeout(verifyPayment, 1500);
        return () => clearTimeout(timer);
    }, [orderId, clearCart]);

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-20 flex items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 max-w-xl relative z-10">
                <AnimatePresence mode="wait">
                    {status === "verifying" && (
                        <motion.div
                            key="verifying"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                                <Clock className="absolute inset-0 m-auto text-cyan-400" size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4 underline decoration-cyan-500/30 decoration-4 underline-offset-8">
                                Verifying Transaction
                            </h1>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                                Securely synchronizing with payment gateway...
                            </p>
                        </motion.div>
                    )}

                    {status === "paid" && (
                        <motion.div
                            key="paid"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                            
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>

                            <div className="text-center">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tight">Payment Success</h1>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">Transmission Received & Confirmed</p>
                                
                                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 mb-8 text-left">
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Identifier</span>
                                        <span className="text-cyan-400 font-bold text-sm tracking-widest">{orderId || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification Status</span>
                                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
                                            <ShieldCheck size={10} /> Verified Paid
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => downloadInvoice(orderId || 'ORDER')}
                                        disabled={isGeneratingPdf}
                                        className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/25 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                    >
                                        {isGeneratingPdf ? (
                                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                                        ) : (
                                            <Download size={18} />
                                        )}
                                        {isGeneratingPdf ? "Generating..." : "Download Invoice"}
                                    </button>

                                    <Link
                                        href={`/track-order?id=${orderDetails?.trackingId || orderId}`}
                                        className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/25 uppercase tracking-widest text-sm flex items-center justify-center gap-2 group"
                                    >
                                        Track Your Product
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link
                                        href="/gallery"
                                        className="w-full py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black rounded-2xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={18} />
                                        Back to Gallery
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === "failed" && (
                        <motion.div
                            key="failed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
                            
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tight">Payment Failed</h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">Transaction Nullified</p>

                            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 mb-8">
                                <p className="text-red-400 text-xs font-bold uppercase tracking-tight leading-relaxed">
                                    {error || "The payment could not be processed at this time. Please check your bank and try again."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Link
                                    href="/checkout"
                                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    Retry Checkout
                                </Link>
                                <Link
                                    href="/"
                                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    Return Home
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {status === "pending" && (
                        <motion.div
                            key="pending"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
                            
                            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
                                <Clock className="w-10 h-10 text-amber-500" />
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tight">Status Pending</h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">Waiting for Gateway Response</p>

                            <p className="text-slate-600 dark:text-slate-400 text-xs font-bold leading-relaxed mb-8 px-4">
                                Your payment is currently being processed by your bank. We will update your order status automatically once confirmed.
                            </p>

                            <Link
                                href="/order-tracking"
                                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                            >
                                Track Status
                                <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden Template for PDF Re-generation */}
            {orderDetails && (
                <div className="fixed left-[-9999px] top-[-9999px] pointer-events-none opacity-0">
                    <div ref={templateRef}>
                        <QuotationDocument
                            title="INVOICE"
                            quoteId={orderDetails.trackingId || orderId || 'ORDER'}
                            date={(() => {
                                const d = orderDetails.createdAt;
                                if (!d) return new Date().toLocaleDateString('en-GB');
                                // Handle Firestore Timestamp (seconds/nanoseconds)
                                if (typeof d === 'object' && d.seconds) return new Date(d.seconds * 1000).toLocaleDateString('en-GB');
                                // Handle string or Date
                                const dateObj = new Date(d);
                                return isNaN(dateObj.getTime()) ? new Date().toLocaleDateString('en-GB') : dateObj.toLocaleDateString('en-GB');
                            })()}
                            dueDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
                            client={{
                                name: orderDetails.customerName,
                                details: "Retail Customer",
                                email: orderDetails.email,
                                phone: orderDetails.phone,
                                address: orderDetails.address || `${orderDetails.doorNo}, ${orderDetails.street}, ${orderDetails.city} - ${orderDetails.pincode}, ${orderDetails.state}`
                            }}
                            items={(orderDetails.items || []).map((item: any) => ({
                                name: item.name,
                                id: item.id,
                                description: item.description || "Component Part",
                                price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
                                quantity: item.quantity || 1,
                                total: (typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, ''))) * (item.quantity || 1),
                                color: item.selectedColor || "Default",
                                colorName: item.selectedColor ? getColorName(item.selectedColor) : "Default"
                            }))}
                            totalAmount={orderDetails.totalAmount}
                            totalQty={(orderDetails.items || []).reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0)}
                            shippingCost={orderDetails.shipping || 0}
                            discount={orderDetails.discount || 0}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        }>
            <PaymentStatusContent />
        </Suspense>
    );
}
