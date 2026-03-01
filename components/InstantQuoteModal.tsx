"use client";

import React, { useState, useRef } from "react";
import { X, Download, FileText, User, Mail, Phone, Building } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { Product } from "@/lib/products";

interface InstantQuoteModalProps {
    product: Product;
    onClose: () => void;
}

export default function InstantQuoteModal({ product, onClose }: InstantQuoteModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [userDetails, setUserDetails] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
    });
    const quoteRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!userDetails.name || !userDetails.email) {
            alert("Please provide at least your name and email.");
            return;
        }

        setIsGenerating(true);
        try {
            const input = quoteRef.current;
            if (!input) return;

            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.9);
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Quotation_${product.name.replace(/\s+/g, "_")}.pdf`);
            onClose();
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-cyan-400" /> Instant Quotation
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                            placeholder="Your Name"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 outline-none"
                            value={userDetails.name}
                            onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                            placeholder="Email Address"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 outline-none"
                            value={userDetails.email}
                            onChange={e => setUserDetails({ ...userDetails, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                                placeholder="Phone"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 outline-none"
                                value={userDetails.phone}
                                onChange={e => setUserDetails({ ...userDetails, phone: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <Building className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                                placeholder="Company"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 outline-none"
                                value={userDetails.company}
                                onChange={e => setUserDetails({ ...userDetails, company: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        disabled={isGenerating}
                        onClick={handleGenerate}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                    >
                        {isGenerating ? (
                            <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Download size={18} />
                        )}
                        {isGenerating ? "Generating..." : "Download Quotation"}
                    </button>
                </div>

                {/* Hidden Quotation Template for Capture */}
                <div className="fixed left-[-9999px] top-0">
                    <div
                        ref={quoteRef}
                        className="w-[210mm] min-h-[297mm] p-12 bg-white text-slate-900 font-sans"
                        id="quotation-template"
                    >
                        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">VAELINSA</h1>
                                <p className="text-slate-500 text-sm font-semibold">ADVANCED 3D FABRICATION</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-slate-800 mb-1">Official Quotation</h2>
                                <p className="text-slate-500 text-sm">Date: {new Date().toLocaleDateString()}</p>
                                <p className="text-slate-500 text-sm">ID: VAE-{Math.floor(Math.random() * 90000) + 10000}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quotation For</h3>
                                <p className="font-bold text-lg">{userDetails.name || "Customer"}</p>
                                <p className="text-slate-600">{userDetails.company}</p>
                                <p className="text-slate-600">{userDetails.email}</p>
                                <p className="text-slate-600">{userDetails.phone}</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Product Summary</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={product.image} className="object-cover w-full h-full" alt="" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.category}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <table className="w-full mb-12 border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                                    <th className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                                    <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                                    <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-50">
                                    <td className="py-6">
                                        <p className="font-bold text-slate-800">{product.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{product.description}</p>
                                    </td>
                                    <td className="py-6 text-center font-bold">1</td>
                                    <td className="py-6 text-right font-bold">{product.price}</td>
                                    <td className="py-6 text-right font-black text-cyan-600">{product.price}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex justify-end mb-12">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-slate-500">
                                    <span className="text-sm font-semibold">Subtotal</span>
                                    <span className="font-bold">{product.price}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span className="text-sm font-semibold">Shipping</span>
                                    <span className="font-bold">Calculated at Checkout</span>
                                </div>
                                <div className="h-px bg-slate-100 my-2" />
                                <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-60">Grand Total</span>
                                    <span className="text-xl font-black">{product.price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms & Conditions</h4>
                            <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 font-medium">
                                <li>Quotation is valid for 15 days from the date of issue.</li>
                                <li>Production lead time depends on machine availability and complexity.</li>
                                <li>50% advance payment required for order confirmation.</li>
                                <li>Color accuracy may vary slightly based on material batch.</li>
                            </ul>
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Thank you for choosing Vaelinsa</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
