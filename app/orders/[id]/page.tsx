import React from "react";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, CreditCard, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string }>;
}

// SSR: Private page, noindexing
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Order Details | VAELINSA",
    robots: "noindex, nofollow",
};

const STATUS_STEPS = [
    { label: "Pending", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Processing", icon: Package, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Shipped", icon: MapPin, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Delivered", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

async function getOrder(id: string) {
    const adminDb = await getAdminDb();
    
    // Support both document ID and tracking ID
    const doc = await adminDb.collection("orders").doc(id).get();
    if (doc.exists) return { id: doc.id, ...doc.data() };
    
    const snapshot = await adminDb.collection("orders").where("trackingId", "==", id).limit(1).get();
    if (!snapshot.empty) {
        const d = snapshot.docs[0];
        return { id: d.id, ...d.data() };
    }
    
    return null;
}

export default async function OrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    const order: any = await getOrder(id);

    if (!order) notFound();

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.label === order.status);

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 text-white pt-24 pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <Link href="/gallery" className="inline-flex items-center gap-2 text-cyan-400 font-bold mb-8 hover:text-cyan-300 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Shop
                    </Link>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:row justify-between items-start md:items-center gap-6 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Order Summary</p>
                                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">{order.trackingId || order.id}</h1>
                                
                                { (order.megaFolderUrl || order.pdfUrl) && (
                                    <a 
                                        href={order.megaFolderUrl || order.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-lg shadow-cyan-500/10"
                                    >
                                        <FileText size={14} />
                                        Preview Official Quotation
                                    </a>
                                )}
                            </div>
                            <div className={`px-5 py-2 rounded-full ${STATUS_STEPS[currentStepIndex > -1 ? currentStepIndex : 0].bg} ${STATUS_STEPS[currentStepIndex > -1 ? currentStepIndex : 0].color} font-black text-xs uppercase tracking-widest border border-current/20`}>
                                {order.status}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-8 bg-white dark:bg-slate-950/20">
                            <div className="flex flex-col md:flex-row justify-between relative gap-8 md:gap-0">
                                {STATUS_STEPS.map((step, idx) => {
                                    const isActive = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;
                                    const Icon = step.icon;
                                    return (
                                        <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 relative">
                                            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                isCurrent ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-110" : 
                                                isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-50 dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800"
                                            }`}>
                                                <Icon size={isCurrent ? 24 : 20} className={isCurrent ? "text-slate-950" : ""} />
                                            </div>
                                            <div className="flex flex-col md:items-center">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-white" : "text-slate-600"}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-200 dark:border-slate-800">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Order Date</span>
                                </div>
                                <p className="text-white font-bold">{order.date || new Date(order.createdAt?._seconds * 1000).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <CreditCard size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                                </div>
                                <p className="text-cyan-400 font-black text-xl">{order.totalAmount}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <MapPin size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Customer</span>
                                </div>
                                <p className="text-white font-bold">{order.customerName}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="p-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Ordered Items</h3>
                            <div className="space-y-4">
                                {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl transition-all hover:border-cyan-500/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-200 dark:border-slate-800">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
