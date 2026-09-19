"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield as ShieldIcon,
    User as UserIcon,
    Mail as MailIcon,
    Phone as PhoneIcon,
    MapPin as MapPinIcon,
    FileText as FileTextIcon,
    Eye as EyeIcon,
    TrendingUp as TrendingUpIcon,
    ChevronDown as ChevronDownIcon,
    Clock as ClockIcon,
    AlertCircle as AlertCircleIcon,
    CheckCircle2 as CheckCircle2Icon,
    Truck as TruckIcon,
    CreditCard as CreditCardIcon,
    Zap as ZapIcon,
    X as XIcon,
    ExternalLink as ExternalLinkIcon,
    FileSearch as FileSearchIcon,
    Folder as FolderIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    trackingId?: string;
    customerName: string;
    email: string;
    phone: string;
    totalAmount: string | number;
    status: string;
    items: any[];
    address: string;
    notes?: string;
    quotationId?: string;
    pdfUrl?: string;
    megaFolderUrl?: string;
    paymentId?: string;
    paymentStatus?: string;
    material?: string;
    infillPercent?: number;
    infillPattern?: string;
    shippingPartner?: string;
    carrierTrackingId?: string;
}

interface OrderDetailModalProps {
    isOpen: boolean;
    order: Order | null;
    onClose: () => void;
    status: string;
    onStatusChange: (status: any) => void;
    onUpdateStatus: (id: string, status: any, shippingDetails?: { partner: string, trackingId: string }) => void;
}

const parseAmt = (val: any) => {
    if (val === undefined || val === null) return 0;
    const stripped = String(val).replace(/[^0-9.]/g, "");
    const num = parseFloat(stripped);
    return isNaN(num) ? 0 : num;
};

const getColorName = (hex: string) => {
    if (!hex) return "N/A";
    const colors: Record<string, string> = {
        "#000000": "Black",
        "#ffffff": "White",
        "#ff0000": "Red",
        "#00ff00": "Green",
        "#0000ff": "Blue",
        "#ffff00": "Yellow",
        "#ff00ff": "Magenta",
        "#00ffff": "Cyan",
        "#808080": "Gray",
        "#ffa500": "Orange",
        "#800080": "Purple",
        "#a52a2a": "Brown"
    };
    return colors[hex.toLowerCase()] || hex;
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case "Waiting": return "border-slate-500 text-slate-500 bg-slate-500/5";
        case "Confirmed":
        case "Order Taken":
        case "Pending": return "border-amber-500 text-amber-500 bg-amber-500/5";
        case "Processing": return "border-cyan-500 text-cyan-500 bg-cyan-500/5";
        case "Ready to Delivery": return "border-blue-500 text-blue-500 bg-blue-500/5";
        case "Delivered":
        case "Completed": return "border-emerald-500 text-emerald-500 bg-emerald-500/5";
        case "Cancelled": return "border-red-500 text-red-500 bg-red-500/5";
        default: return "border-slate-500 text-slate-500 bg-slate-500/5";
    }
};

const STATUS_OPTIONS = ["Waiting", "Confirmed", "Order Taken", "Processing", "Ready to Delivery", "Delivered", "Completed", "Cancelled"];

const SHIPPING_PARTNERS = [
    "Blue Dart",
    "DTDC",
    "India Post",
    "ST Courier",
    "The Professional Couriers",
    "Delhivery",
    "Xpressbees",
    "Ekart Logistics",
    "Ecom Express",
    "Shadowfax",
    "FedEx India",
    "DHL Express India",
    "UPS India",
    "Shiprocket"
];

export default function OrderDetailModal({ isOpen, order, onClose, status, onStatusChange, onUpdateStatus }: OrderDetailModalProps) {
    const [mounted, setMounted] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Shipping details state
    const [shippingPartner, setShippingPartner] = useState("");
    const [carrierTrackingId, setCarrierTrackingId] = useState("");

    useEffect(() => {
        if (order) {
            setShippingPartner(order.shippingPartner || "");
            setCarrierTrackingId(order.carrierTrackingId || "");
        }
    }, [order]);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && order && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-auto">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl"
                    />

                    {/* Modal Container */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.9, opacity: 0 }} 
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_0_120px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col z-[10001]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Area */}
                        <div className="shrink-0 p-4 sm:px-6 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
                            
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-inner">
                                    <ShieldIcon className="text-cyan-500" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1.5">Operational <span className="text-cyan-500">Trace</span></h2>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ShieldIcon size={10} className="text-cyan-500" /> SECURE ID: <span className="text-slate-900 dark:text-white">{order.trackingId || order.id}</span>
                                        </p>
                                        {order.paymentId && (
                                            <div className="flex items-center gap-2">
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <CreditCardIcon size={10} /> PAYMENT ID: <span className="text-emerald-600 dark:text-emerald-400 font-mono tracking-tighter">{order.paymentId}</span>
                                                </p>
                                                {order.paymentStatus === 'PAID' && (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase border border-emerald-500/20">PAID</span>
                                                )}
                                            </div>
                                        )}
                                        {!order.paymentId && order.paymentStatus === 'unpaid' && (
                                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ClockIcon size={10} /> PAYMENT STATUS: <span className="text-amber-600 dark:text-amber-400">UNPAID / PENDING</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <div className={cn("px-4 py-1.5 rounded-lg border-2 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-sm", getStatusStyle(order.status))}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                    {order.status}
                                </div>
                                <button onClick={onClose} className="p-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all border border-slate-200 dark:border-white/10 group">
                                    <XIcon size={18} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area - FIXED HEIGHT / NO GLOBAL SCROLL */}
                        <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
                            {/* Left Column: Client, Logistics & TOTAL (4 cols) */}
                            <div className="lg:w-1/3 xl:w-1/4 space-y-4 overflow-y-auto scrollbar-hide">
                                    {/* Client Entity */}
                                    <section className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 relative overflow-hidden group shadow-inner">
                                        <div className="absolute top-[-10%] right-[-10%] opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                                            <UserIcon size={120} />
                                        </div>
                                        <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <span className="w-4 h-px bg-cyan-500" /> Client Entity
                                        </h3>
                                        <div className="space-y-4 relative z-10">
                                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none italic">{order.customerName}</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold text-[11px] tracking-wider">
                                                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm"><MailIcon size={12} className="text-cyan-500" /></div>
                                                    <span className="font-medium truncate">{order.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold text-[11px] tracking-wider">
                                                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm"><PhoneIcon size={12} className="text-cyan-500" /></div>
                                                    <span className="font-medium">{order.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Logistics Node */}
                                    <section className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 relative overflow-hidden group shadow-inner">
                                        <div className="absolute bottom-[-10%] left-[-10%] opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                                            <MapPinIcon size={120} />
                                        </div>
                                        <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <span className="w-4 h-px bg-purple-500" /> Logistics Node
                                        </h3>
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm shrink-0"><TruckIcon size={14} className="text-purple-500" /></div>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium text-[12px] leading-relaxed italic">{order.address}</p>
                                        </div>
                                    </section>

                                    {/* Technical Specs (Custom Orders) */}
                                    {(order.material || order.infillPercent) && (
                                        <section className="p-5 rounded-2xl bg-cyan-500/[0.03] dark:bg-cyan-500/[0.05] border border-cyan-500/20 relative shadow-inner overflow-hidden">
                                            <div className="absolute top-[-10%] right-[-10%] opacity-[0.03] text-cyan-500"><ZapIcon size={80} /></div>
                                            <h3 className="text-[8px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                                <span className="w-4 h-px bg-cyan-500" /> Technical Specs
                                            </h3>
                                            <div className="space-y-3 relative z-10">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Material</span>
                                                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{order.material || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Infill</span>
                                                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{order.infillPercent}% • {order.infillPattern}</span>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {/* Total Aggregated Net */}
                                    <section className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group shadow-2xl">
                                        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                <CreditCardIcon size={14} className="text-cyan-500" />
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] italic">Total Aggregated Net</p>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-lg font-black text-slate-600 italic">RS</span>
                                                <p className="text-3xl font-black text-white italic tracking-tighter leading-none">
                                                    {parseAmt(order.totalAmount).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[8px] uppercase tracking-[0.2em]">
                                                <ZapIcon size={12} className="fill-emerald-500 animate-pulse" />
                                                Network Secured
                                            </div>
                                        </div>
                                    </section>

                                    {/* Quotation & Invoice Assets */}
                                    {(order.quotationId || order.pdfUrl || order.megaFolderUrl || (order.trackingId && order.trackingId.startsWith("VQ"))) && (
                                        <section className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 relative overflow-hidden group shadow-inner space-y-3">
                                            <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                                <span className="w-4 h-px bg-cyan-500" /> Linked Documentation
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 gap-2">
                                                {/* PDF Invoice Link */}
                                                {order.pdfUrl && (
                                                    <a 
                                                        href={order.pdfUrl} 
                                                        target="_blank" 
                                                        className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                                <FileSearchIcon size={16} className="text-emerald-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">View Invoice</p>
                                                                <p className="text-[7px] font-bold uppercase tracking-widest opacity-60 text-slate-500">Official PDF Document</p>
                                                            </div>
                                                        </div>
                                                        <ExternalLinkIcon size={12} className="text-emerald-500 opacity-50 group-hover:opacity-100" />
                                                    </a>
                                                )}
                                            </div>
                                        </section>
                                    )}

                                    {/* Command Memo */}
                                    {order.notes && (
                                        <section className="p-5 rounded-2xl bg-amber-500/[0.03] dark:bg-amber-500/[0.05] border border-amber-500/20 relative shadow-inner">
                                            <h3 className="text-[8px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.3em] mb-2">Command Memo</h3>
                                            <p className="text-amber-800 dark:text-amber-200/80 text-[12px] font-medium italic leading-relaxed">"{order.notes}"</p>
                                        </section>
                                    )}

                                </div>

                            {/* Right Column: Manifest (Fixed height scroll) */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col shadow-inner">
                                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/30 dark:bg-white/[0.01]">
                                        <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <span className="w-4 h-px bg-cyan-500" /> Payload Manifest
                                        </h3>
                                        <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[8px] font-black uppercase tracking-widest border border-cyan-500/20">
                                            {order.items.length} Elements Linked
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-5 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl hover:shadow-lg transition-all group/item shadow-sm">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 group-hover/item:text-cyan-500 transition-colors shrink-0 shadow-inner relative overflow-hidden">
                                                        <FileTextIcon size={24} className="relative z-10" />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <p className="text-slate-900 dark:text-white text-base font-black tracking-tight italic truncate uppercase">{item.name}</p>
                                                                {(item.fileUrl || item.driveFileId) && (
                                                                    <a 
                                                                        href={item.fileUrl || `https://drive.google.com/uc?id=${item.driveFileId}&export=download`} 
                                                                        target="_blank" 
                                                                        rel="noreferrer" 
                                                                        className="w-7 h-7 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-white border border-cyan-500/20 flex items-center justify-center transition-all shadow-sm"
                                                                    >
                                                                        <EyeIcon size={14} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Q: {item.quantity}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.selectedColor }} />
                                                                    {getColorName(item.selectedColor)}
                                                                </span>
                                                                {item.dimensions && (
                                                                    <>
                                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                            {Math.round(item.dimensions.x)}x{Math.round(item.dimensions.y)}x{Math.round(item.dimensions.z)}mm
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-right shrink-0">
                                                            <p className="text-cyan-500 font-black text-2xl italic tracking-tighter leading-none mb-0.5">
                                                                <span className="text-[9px] mr-1.5 not-italic uppercase font-bold text-slate-500">Rs</span>
                                                                {(parseAmt(item.totalPrice) || parseAmt(item.price) || 0).toLocaleString('en-IN')}
                                                            </p>
                                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Sub-Payload Value</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </div>

                                    <div className="mt-2 p-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between bg-white/30 dark:bg-white/[0.01] rounded-b-2xl">
                                        <div className="flex items-center gap-2 text-slate-500 font-black text-[9px] uppercase tracking-[0.1em]">
                                            <TrendingUpIcon size={12} className="text-cyan-500" />
                                            Active Session Data Stream
                                        </div>
                                        <div className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                                            Manifest Locked
                                        </div>
                                    </div>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="shrink-0 p-4 sm:px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-3xl flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
                            <div className="flex-1">
                                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-3 italic">
                                    <TrendingUpIcon size={12} className="text-cyan-500" /> State Modulation Interface
                                </h4>
                                
                                {/* Status Dropdown Bar */}
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={cn(
                                            "w-full max-w-sm px-5 py-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-between transition-all",
                                            isDropdownOpen ? "border-cyan-500 shadow-xl shadow-cyan-500/10" : "hover:border-slate-300 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-2 h-2 rounded-full animate-pulse", status === "Cancelled" ? "bg-red-500" : "bg-cyan-500")} />
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">{status}</span>
                                        </div>
                                        <ChevronDownIcon size={16} className={cn("text-slate-400 transition-transform duration-300", isDropdownOpen && "rotate-180 text-cyan-500")} />
                                    </button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: -8, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute bottom-full left-0 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl mb-4"
                                            >
                                                <div className="p-1 space-y-0.5">
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <button 
                                                            key={s} 
                                                            onClick={() => { onStatusChange(s); setIsDropdownOpen(false); }}
                                                            className={cn(
                                                                "w-full text-left px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between group",
                                                                status === s 
                                                                    ? "bg-cyan-500/10 text-cyan-500" 
                                                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                                                            )}
                                                        >
                                                            <span>{s}</span>
                                                            {status === s && <CheckCircle2Icon size={12} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Shipping Details Input (Only for Delivered) */}
                            {status === "Delivered" && (
                                <div className="flex-1 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Shipping Partner</label>
                                            <select 
                                                value={shippingPartner}
                                                onChange={(e) => setShippingPartner(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-900 dark:text-white focus:border-cyan-500 outline-none transition-all shadow-sm appearance-none"
                                            >
                                                <option value="" disabled>Select Partner</option>
                                                {SHIPPING_PARTNERS.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Tracking ID</label>
                                            <input 
                                                type="text"
                                                placeholder="Enter ID..."
                                                value={carrierTrackingId}
                                                onChange={(e) => setCarrierTrackingId(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-900 dark:text-white focus:border-cyan-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 min-w-[300px]">
                                <button 
                                    onClick={onClose} 
                                    className="flex-1 px-5 py-3.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-black rounded-xl transition-all uppercase tracking-[0.2em] text-[9px] border border-slate-200 dark:border-white/10"
                                >
                                    Abort
                                </button>
                                <button 
                                    disabled={status === "Delivered" && (!shippingPartner.trim() || !carrierTrackingId.trim())}
                                    onClick={() => { 
                                        const details = status === "Delivered" ? { partner: shippingPartner, trackingId: carrierTrackingId } : undefined;
                                        onUpdateStatus(order!.id, status, details); 
                                        onClose(); 
                                    }} 
                                    className={cn(
                                        "flex-[1.5] px-5 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all uppercase tracking-[0.2em] text-[9px] shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-3",
                                        status === "Delivered" && (!shippingPartner.trim() || !carrierTrackingId.trim()) && "opacity-30 cursor-not-allowed grayscale"
                                    )}
                                >
                                    <CheckCircle2Icon size={16} />
                                    Commit Sync
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
