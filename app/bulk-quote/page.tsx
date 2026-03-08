"use client";

import React, { useRef } from "react";
import { useCart, CartItem } from "@/context/CartContext";
import { FileText, Download, ArrowLeft, Printer, ShoppingBag, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { parsePrice } from "@/lib/utils";

export default function BulkQuotePage() {
    const { items, cartTotal } = useCart();
    const date = new Set().add(new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }));

    const quoteId = "VQ-" + Math.random().toString(36).substr(2, 6).toUpperCase();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-950 py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 no-print">
                    <Link href="/gallery" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">Back to Gallery</span>
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm"
                        >
                            <Printer size={18} />
                            Print Quote
                        </button>
                        <button className="flex items-center gap-2 bg-cyan-500 text-slate-950 px-6 py-3 rounded-xl hover:bg-cyan-400 transition-all font-black text-sm shadow-lg shadow-cyan-500/20">
                            <Download size={18} />
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Quotation Document */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-2xl print:shadow-none print:m-0"
                >
                    {/* Doc Header */}
                    <div className="bg-slate-900 text-white p-12 flex flex-col md:flex-row justify-between gap-12 border-b-8 border-cyan-500">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                                    <FileText className="text-slate-950" size={24} />
                                </div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter">VEDA 3D</h1>
                            </div>
                            <div className="space-y-1 text-slate-400 text-sm">
                                <p>Nandhini Store, TNP Nagar, Thudiliyar</p>
                                <p>Coimbatore, Tamil Nadu 641032</p>
                                <p>Email: sales@vaelinsa.com</p>
                                <p>Web: www.vaelinsa.com</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right space-y-2">
                            <h2 className="text-5xl font-black text-cyan-500 uppercase tracking-tighter mb-4">Quotation</h2>
                            <div className="space-y-1 text-sm">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Quote ID: <span className="text-white">{quoteId}</span></p>
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Date: <span className="text-white">{(Array.from(date)[0] as string) || new Date().toLocaleDateString('en-IN')}</span></p>
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Valid Until: <span className="text-white">30 Days from Issue</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="p-12">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-slate-100 italic">
                                        <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Description</th>
                                        <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-center">Qty</th>
                                        <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Unit Price</th>
                                        <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.map((item: CartItem) => {
                                        const price = parsePrice(item.price);
                                        const quantity = item.quantity || 1;
                                        return (
                                            <tr key={item.cartId} className="group">
                                                <td className="py-8 px-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{item.name}</p>
                                                            <p className="text-xs text-slate-400 font-medium">
                                                                {item.category} {item.selectedColor && `• Color: ${item.selectedColor}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-8 px-4 text-center font-bold text-slate-600">{quantity}</td>
                                                <td className="py-8 px-4 text-right font-bold text-slate-600">₹{price.toLocaleString('en-IN')}</td>
                                                <td className="py-8 px-4 text-right font-black text-slate-900">₹{(price * quantity).toLocaleString('en-IN')}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Section */}
                        <div className="mt-12 pt-12 border-t-2 border-slate-100 flex flex-col md:flex-row justify-between gap-12">
                            <div className="max-w-md space-y-4">
                                <h4 className="font-black uppercase tracking-widest text-xs text-slate-900 border-b border-slate-200 pb-2">Notes & Terms</h4>
                                <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                                    <li>• Standard delivery lead time is 5-7 business days from order confirmation.</li>
                                    <li>• Quote includes basic packaging. Custom crating for machine orders is extra.</li>
                                    <li>• 100% advance payment required for custom fabrication orders.</li>
                                    <li>• This is a system-generated preliminary quotation.</li>
                                </ul>
                            </div>
                            <div className="w-full md:w-80 space-y-4 bg-slate-50 p-8 rounded-2xl">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Subtotal</span>
                                    <span className="text-slate-900 font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">GST (18%)</span>
                                    <span className="text-slate-900 font-bold">₹{(cartTotal * 0.18).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Shipping</span>
                                    <span className="text-slate-900 font-bold italic">Calculated at Checkout</span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-slate-900 font-black uppercase tracking-widest text-xs">Total Amount</span>
                                    <span className="text-3xl font-black text-cyan-500">₹{(cartTotal * 1.18).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Signature Section */}
                        <div className="mt-20 pt-20 border-t border-slate-100 flex justify-between items-center text-center">
                            <div className="space-y-4">
                                <div className="w-48 border-b-2 border-slate-900 pb-2 mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Signature</p>
                            </div>
                            <div className="hidden md:block">
                                <ShoppingBag className="text-slate-100 h-24 w-24" />
                            </div>
                            <div className="space-y-4">
                                <div className="w-48 h-8 flex items-center justify-center font-black italic text-slate-200 text-2xl uppercase tracking-tighter">
                                    VQ-{quoteId.split('-')[1]}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Verification Hash</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Info */}
                <div className="mt-12 text-center space-y-4 no-print">
                    <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
                        <Mail size={16} className="text-cyan-500" />
                        Questions? Contact us at <span className="text-white font-bold">sales@vaelinsa.com</span>
                    </p>
                    <p className="text-[10px] text-slate-700 uppercase tracking-widest font-black">
                        Generated by Veda 3D Engineering Intelligence System
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .min-h-screen { min-height: auto !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    );
}
