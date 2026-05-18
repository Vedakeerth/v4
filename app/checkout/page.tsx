"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ArrowRight, Check } from "lucide-react";
import { useCart, CartItem } from "@/context/CartContext";
import Footer from "@/components/Footer";
import { cn, validatePhone, getColorName } from "@/lib/utils";
import { redirectToCashfree } from "@/lib/cashfree";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import Recaptcha from "@/components/Recaptcha";
import QuotationDocument from "@/components/QuotationDocument";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileText, Download, Truck, Info } from "lucide-react";
import { calculateShipping, ShippingDetails } from "@/lib/shippingCalculator";


function CheckoutContent() {
    const { 
        items, 
        cartTotal, 
        clearCart, 
        appliedCoupon, 
        discountAmount, 
        finalTotal,
        applyCoupon,
        removeCoupon 
    } = useCart();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'review' | 'payment' | 'processing' | 'success'>('shipping');
    const [orderInfo, setOrderInfo] = useState<{orderId: string, trackingId: string, paymentId?: string} | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed' | 'idle'>('idle');
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const templateRef = useRef<HTMLDivElement>(null);
    const [quoteData, setQuoteData] = useState({ id: '', date: '', dueDate: '' });
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
    const [uploadedPdfUrl, setUploadedPdfUrl] = useState("");
    const [uploadedFolderUrl, setUploadedFolderUrl] = useState("");
    const [orderSnapshot, setOrderSnapshot] = useState<{items: CartItem[], formData: any, total: number, shipping?: number, discount?: number} | null>(null);
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);

    // Coupon states
    const [useCoupon, setUseCoupon] = useState(!!appliedCoupon);
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        setCouponError("");
        try {
            const result = await applyCoupon(couponCode);
            if (result.success) {
                setCouponError("");
            } else {
                setCouponError(result.message);
            }
        } catch (error) {
            setCouponError("Failed to apply coupon");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponCode("");
        setCouponError("");
    };

    useEffect(() => {
        if (formData.state && items.length > 0) {
            const products = items.map(item => ({
                weight: item.weight || 50, // Default 50g instead of 500g
                dimensions: {
                    length: item.length || 2, // Default 2cm instead of 15cm
                    width: item.width || 2,  // Default 2cm instead of 15cm
                    height: item.height || 1  // Default 1cm instead of 10cm
                },
                quantity: item.quantity || 1
            }));
            const details = calculateShipping(products, formData.state, finalTotal, formData.pincode);
            setShippingDetails(details);
        } else {
            setShippingDetails(null);
        }
    }, [formData.state, items, finalTotal]);

    const grandTotal = finalTotal + (shippingDetails?.totalShipping || 0);

    const downloadInvoice = async (id: string) => {
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
            const pdf = jsPDF ? new jsPDF('p', 'mm', 'a4') : null;
            if (pdf) {
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                pdf.save(`INVOICE-${id}.pdf`);
            }
        } catch (err) {
            console.error("PDF download failed:", err);
        } finally {
            setIsGeneratingPdf(false);
        }
    };


    useEffect(() => {
        const tracking_id = searchParams?.get('tracking_id');
        const order_id = searchParams?.get('order_id');
        const payment_id = searchParams?.get('payment_id');
        
        if (tracking_id && order_id && verificationStatus === 'idle') {
            const verifyPayment = async () => {
                setVerificationStatus('verifying');
                setCheckoutStep('processing'); // Reuse processing step for verification UI
                
                try {
                    // Call our backend to verify with Cashfree
                    const res = await fetch(`/api/verify-payment?orderId=${tracking_id}${payment_id ? `&paymentId=${payment_id}` : ''}`);
                    const data = await res.json();
                    
                    if (data.success && (data.status?.toLowerCase() === 'paid' || data.status?.toLowerCase() === 'success')) {
                        setOrderInfo({ 
                            orderId: order_id || tracking_id || '', 
                            trackingId: tracking_id || '', 
                            paymentId: payment_id || data.paymentId || '' 
                        });
                        setVerificationStatus('success');
                        setCheckoutStep('success');
                        
                        // Read from localStorage directly to bypass hydration delays
                        const cartStr = localStorage.getItem('cart');
                        const cartItems = cartStr ? JSON.parse(cartStr) : [];
                        
                        // Store snapshot for invoice before clearing
                        setOrderSnapshot({
                            items: cartItems,
                            formData: formData,
                            total: grandTotal,
                            shipping: shippingDetails?.totalShipping || 0,
                            discount: discountAmount || 0
                        });

                        // Trigger auto-download
                        setTimeout(() => {
                            downloadInvoice(order_id || tracking_id || 'ORDER');
                        }, 1000);
                        
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
                    } else {
                        console.error("Payment verification failed:", data.message || data.error);
                        setVerificationStatus('failed');
                        setCheckoutStep('review'); // Fallback to review
                        alert("Payment verification pending or failed. Status: " + (data.status || "Unknown") + "\nIf you have already paid, please contact support with your Tracking ID: " + tracking_id);
                    }
                } catch (error) {
                    console.error("Verification Error:", error);
                    setVerificationStatus('failed');
                    setCheckoutStep('payment');
                }
            };
            
            verifyPayment();
        }
    }, [searchParams, verificationStatus, clearCart, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === "phone") {
            const digits = value.replace(/\D/g, '').slice(0, 10);
            let formatted = digits;
            if (digits.length > 5) {
                formatted = `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
            }
            setFormData(prev => ({ ...prev, phone: formatted }));
            return;
        }

        if (name === "pincode") {
            const digits = value.replace(/\D/g, '').slice(0, 6);
            setFormData(prev => ({ ...prev, pincode: digits }));
            
            // Auto-fill state and city for Indian pincodes
            if (digits.length === 6 && isIndia) {
                fetchLocationFromPincode(digits);
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [isPincodeLoading, setIsPincodeLoading] = useState(false);

    const fetchLocationFromPincode = async (pin: string) => {
        setIsPincodeLoading(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
            const data = await response.json();
            
            if (data[0].Status === "Success") {
                const postOffice = data[0].PostOffice[0];
                setFormData(prev => ({
                    ...prev,
                    city: postOffice.District,
                    state: postOffice.State
                }));
            }
        } catch (error) {
            console.error("Pincode fetch failed:", error);
        } finally {
            setIsPincodeLoading(false);
        }
    };

    const handleShippingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePhone(formData.phone)) {
            alert("Please enter a valid 10-digit phone number");
            return;
        }

        setIsSubmitting(true);

        try {
            // Fetch Sequential Tracking ID from backend
            let trackingId = activeTrackingId;
            
            if (!trackingId) {
                console.log("[Checkout] Fetching sequential ID from backend...");
                const idRes = await fetch('/api/generate-id?prefix=IN');
                const idData = await idRes.json();
                if (idData.success) {
                    trackingId = idData.trackingId;
                } else {
                    throw new Error("Failed to generate official tracking ID");
                }
            }

            const date = new Date().toLocaleDateString('en-GB');
            const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');
            
            if (!trackingId) throw new Error("Tracking ID generation failed.");
            
            setActiveTrackingId(trackingId);
            setQuoteData({ id: trackingId, date, dueDate: due });

            // Give react a moment to render the template with new data
            await new Promise(r => setTimeout(r, 500));

            let pdfUrl = "";
            let megaFolderUrl = "";

            if (templateRef.current) {
                console.log(`[Checkout] Generating PDF for ${trackingId}...`);
                const canvas = await html2canvas(templateRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                const pdfBlob = pdf.output('blob');
                const pdfFile = new File([pdfBlob], `INVOICE-${trackingId}-invoice.pdf`, { type: 'application/pdf' });

                const pdfFormData = new FormData();
                pdfFormData.append('file', pdfFile);
                pdfFormData.append('quotationID', trackingId!);
                pdfFormData.append('rootFolder', 'INVOICE');

                const uploadRes = await fetch('/api/upload-to-mega', {
                    method: 'POST',
                    body: pdfFormData
                });
                
                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json().catch(() => ({}));
                    throw new Error(errorData.error || `Server returned ${uploadRes.status}`);
                }

                const uploadData = await uploadRes.json();
                
                if (uploadData.success && uploadData.data?.url) {
                    pdfUrl = uploadData.data.url;
                    megaFolderUrl = uploadData.data.folderUrl;
                    setUploadedPdfUrl(pdfUrl);
                    setUploadedFolderUrl(megaFolderUrl);
                    console.log(`[Checkout] Invoice uploaded successfully: ${pdfUrl}`);
                } else {
                    throw new Error(uploadData.error || "MEGA upload failed without specific error message.");
                }
            } else {
                console.warn("[Checkout] templateRef.current is null, skipping PDF generation.");
            }

            setCheckoutStep('review');
        } catch (error) {
            console.error("Error during shipping transition:", error);
            alert("There was an issue preparing your order documents. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);

    const handlePaymentSubmit = async () => {
        if (!recaptchaToken && process.env.NODE_ENV === 'production') {
            alert("Please complete the reCAPTCHA verification to proceed.");
            return;
        }
        
        // In development, if token is missing, use a dummy one to satisfy the API
        const finalToken = recaptchaToken || (process.env.NODE_ENV === 'development' ? 'dev-dummy-token' : null);
        
        if (!finalToken) {
            alert("Please complete the reCAPTCHA verification to proceed.");
            return;
        }
        
        setCheckoutStep('processing');

        try {
            const trackingId = activeTrackingId;
            if (!trackingId) throw new Error("Tracking ID missing.");

            // Step 1: Create Order in our system as "Pending"
            const pdfUrl = uploadedPdfUrl;
            const megaFolderUrl = uploadedFolderUrl;
            const fullAddress = `${formData.doorNo}, ${formData.street}, ${formData.city} - ${formData.pincode}, ${formData.state}`;
            const fullPhone = `${formData.countryCode}${formData.phone.replace(/\D/g, '')}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    trackingId, 
                    customerName: formData.customerName,
                    email: formData.email,
                    phone: fullPhone,
                    address: fullAddress,
                    message: formData.message,
                    items,
                    totalAmount: grandTotal,
                    recaptchaToken: finalToken,
                    pdfUrl,
                    megaFolderUrl,
                    shipping: shippingDetails?.totalShipping || 0,
                    discount: discountAmount || 0,
                    subtotal: cartTotal || 0,
                    roundOff: grandTotal - (cartTotal - discountAmount + (shippingDetails?.totalShipping || 0))
                })
            });
            clearTimeout(timeoutId);
            
            const orderData = await orderRes.json();

            if (!orderData.success) {
                throw new Error(orderData.error || "Failed to create order record.");
            }

            // Step 2: Redirect directly to Cashfree using returning payment_session_id
            if (!orderData.payment_session_id) {
                throw new Error("Payment session missing from server response.");
            }

            setPaymentSessionId(orderData.payment_session_id);
            setActiveTrackingId(orderData.trackingId);
            console.log("Redirecting to Cashfree...");
            redirectToCashfree(orderData.payment_session_id, orderData.trackingId);
            
            // If the code reaches here, it means the modal was closed
            setCheckoutStep('review');

        } catch (error: any) {
            console.error("Payment Error:", error);
            const msg = error.name === 'AbortError' ? "Request timed out. Please check your connection and try again." : (error.message || "An error occurred during payment.");
            alert(msg);
            setCheckoutStep('review');
        }
    };

    if (checkoutStep === 'success') {
        return (
            <main className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-0 flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-6xl pb-32 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 max-w-lg mx-auto shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 uppercase italic">Order Confirmed!</h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
                            Thank you for your order. You will receive real-time notifications via email.
                            <br/><br/>
                            For any support, contact us through <span className="text-cyan-400 font-bold underline">Mail</span> or <span className="text-green-500 font-bold underline">WhatsApp</span>.
                            <br/><br/>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Tracking ID</span>
                            <span className="inline-block px-6 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-cyan-400 font-semibold text-2xl tracking-[0.2em] rounded-xl">
                                {orderInfo?.trackingId || 'LOADING...'}
                            </span>
                            {orderInfo?.paymentId && (
                                <div className="mt-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Payment ID</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-200/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700">
                                        {orderInfo.paymentId}
                                    </span>
                                </div>
                            )}
                        </p>
                        <div className="flex flex-col gap-4 mt-12">
                            <button
                                onClick={() => downloadInvoice(orderInfo?.orderId || orderInfo?.trackingId || 'ORDER')}
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
                                href={`/track-order?id=${orderInfo?.trackingId}`}
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
                    </motion.div>
                </div>
                
                {/* Hidden Template for PDF Re-generation */}
                {orderSnapshot && (
                    <div className="fixed left-[-9999px] top-[-9999px] pointer-events-none opacity-0">
                        <div ref={templateRef}>
                            <QuotationDocument
                                title="INVOICE"
                                quoteId={orderInfo?.orderId || orderInfo?.trackingId || quoteData.id}
                                date={new Date().toLocaleDateString('en-GB')}
                                dueDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
                                client={{
                                    name: orderSnapshot.formData.customerName,
                                    details: "Retail Customer",
                                    email: orderSnapshot.formData.email,
                                    phone: orderSnapshot.formData.phone,
                                    address: `${orderSnapshot.formData.doorNo}, ${orderSnapshot.formData.street}, ${orderSnapshot.formData.city} - ${orderSnapshot.formData.pincode}, ${orderSnapshot.formData.state}`
                                }}
                                items={orderSnapshot.items.map(item => ({
                                    name: item.name,
                                    id: item.id,
                                    description: item.description || "Component Part",
                                    price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
                                    quantity: item.quantity || 1,
                                    total: (typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, ''))) * (item.quantity || 1),
                                    color: item.selectedColor || "Default",
                                    colorName: item.selectedColor ? getColorName(item.selectedColor) : "Default"
                                }))}
                                totalAmount={orderSnapshot.total}
                                totalQty={orderSnapshot.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
                                shippingCost={(orderSnapshot as any).shipping || 0}
                                discount={(orderSnapshot as any).discount || 0}
                            />
                        </div>
                    </div>
                )}
            </main>
        );
    }

    if (checkoutStep === 'processing') {
        return (
            <main className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-0 flex items-center justify-center">
                <div className="text-center space-y-6 pb-32">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase italic tracking-tight">Securing Payment...</h2>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 px-4">
                            {paymentSessionId ? "Order created! Opening payment gateway..." : "Connecting to gateway & verifying transaction..."}
                        </p>
                        
                        <div className="mt-12 space-y-4">
                            {paymentSessionId && (
                                <button 
                                    onClick={() => {
                                        if (paymentSessionId && activeTrackingId) {
                                            redirectToCashfree(paymentSessionId, activeTrackingId);
                                        }
                                    }}
                                    className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-[10px] flex items-center gap-2 mx-auto"
                                >
                                    Open Payment Gateway Manually
                                </button>
                            )}
                            
                            <button 
                                onClick={() => {
                                    setCheckoutStep('review');
                                    setPaymentSessionId(null);
                                }}
                                className="text-slate-400 hover:text-cyan-500 font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto pt-4"
                            >
                                <ArrowLeft size={12} /> Cancel & Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-0">
                <div className="container mx-auto px-4 text-center py-20 pb-32">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 uppercase">Your Cart is Empty</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">Add some products to your cart to checkout.</p>
                    <Link
                        href="/gallery"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all"
                    >
                        Browse Gallery
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-0">
            <div className="container mx-auto px-4 max-w-6xl pb-32">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <Link href="/gallery" className="inline-flex items-center text-slate-500 hover:text-cyan-400 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors font-semibold text-xs uppercase tracking-widest">
                            <ArrowLeft className="mr-2 h-3 w-3" />
                            Back to Gallery
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter underline decoration-cyan-500/50 decoration-4 underline-offset-8">
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
                                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest",
                                        checkoutStep === s.step ? "text-slate-900 dark:text-white" : "text-slate-600"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < arr.length - 1 && <div className="w-6 h-[2px] bg-slate-100 dark:bg-slate-800" />}
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
                                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3 italic">
                                            <div className="w-2 h-6 bg-cyan-500" />
                                            Review Details
                                            {activeTrackingId && (
                                                <span className="ml-auto text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20 not-italic tracking-widest shadow-sm animate-pulse">
                                                    ID: {activeTrackingId}
                                                </span>
                                            )}
                                        </h2>
                                        <button
                                            onClick={() => setCheckoutStep('shipping')}
                                            className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors underline underline-offset-4"
                                        >
                                            Edit Details
                                        </button>
                                    </div>

                                    <div className="space-y-6 bg-white dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-1">Customer Name</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formData.customerName}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-1">Phone Number</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formData.countryCode} {formData.phone}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-1">Email <span className="text-cyan-400">*Order details will be sent here*</span></span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formData.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-white dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 mt-6 mb-8">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-1">Shipping Address</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                                                    {formData.doorNo}, {formData.street}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5">
                                                    {formData.city}, {formData.state} - {formData.pincode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6 flex justify-center">
                                        <Recaptcha onChange={setRecaptchaToken} />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 mt-8">
                                        <button
                                            onClick={handlePaymentSubmit}
                                            className="w-full py-5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group whitespace-nowrap"
                                        >
                                            <span>Place Order & Pay Now</span>
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Hidden Template for PDF */}
                                <div className="fixed left-[-9999px] top-[-9999px] pointer-events-none opacity-0">
                                    <div ref={templateRef}>
                                        <QuotationDocument
                                            title="INVOICE"
                                            quoteId={quoteData.id}
                                            date={quoteData.date}
                                            dueDate={quoteData.dueDate}
                                            client={{
                                                name: formData.customerName,
                                                details: "Retail Customer",
                                                email: formData.email,
                                                phone: formData.phone,
                                                address: `${formData.doorNo}, ${formData.street}, ${formData.city} - ${formData.pincode}, ${formData.state}`
                                            }}
                                            items={items.map(item => ({
                                                name: item.name,
                                                description: item.description || "Component Part",
                                                price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
                                                quantity: item.quantity || 1,
                                                total: (typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, ''))) * (item.quantity || 1),
                                                color: item.selectedColor || "Default"
                                            }))}
                                            shippingCost={shippingDetails?.totalShipping || 0}
                                            totalAmount={grandTotal}
                                            totalQty={items.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
                                            discount={discountAmount}
                                        />
                                    </div>
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
                                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 uppercase tracking-tight flex items-center gap-3 italic">
                                        <div className="w-2 h-6 bg-cyan-500" />
                                        Contact Information
                                    </h2>
                                    <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="customerName"
                                                placeholder="Enter full name"
                                                value={formData.customerName}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Phone Number</label>
                                            <div className="flex gap-2">
                                                <input
                                                    required
                                                    type="text"
                                                    name="countryCode"
                                                    value={formData.countryCode}
                                                    onChange={handleInputChange}
                                                    disabled={isIndia}
                                                    className={cn(
                                                        "w-20 px-3 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm text-center caret-cyan-500",
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
                                                    className="flex-1 px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
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
                                                    <div className="w-5 h-5 rounded border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 peer-checked:bg-cyan-500 peer-checked:border-cyan-400 transition-all flex items-center justify-center">
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
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Door No / Flat</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="doorNo"
                                                    placeholder="House / Flat No"
                                                    value={formData.doorNo}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Street / Area</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="street"
                                                    placeholder="Street name / Colony"
                                                    value={formData.street}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-2 lg:col-span-1">
                                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Pincode</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        type="text"
                                                        name="pincode"
                                                        maxLength={6}
                                                        placeholder="000 000"
                                                        value={formData.pincode}
                                                        onChange={handleInputChange}
                                                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                    />
                                                    {isPincodeLoading && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                            <div className="w-4 h-4 border-2 border-cyan-500/20 border-t-cyan-500 animate-spin rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2 lg:col-span-1">
                                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">City</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="city"
                                                    placeholder="Enter city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                            <div className="space-y-2 lg:col-span-1">
                                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">State</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="state"
                                                    placeholder="Enter state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Additional Message / Delivery Notes</label>
                                            <textarea
                                                name="message"
                                                rows={2}
                                                placeholder="Any special instructions for delivery..."
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all font-semibold text-sm placeholder:text-slate-600/50 caret-cyan-500"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                                                    Finalizing Details...
                                                </>
                                            ) : (
                                                <>
                                                    Review My Details
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {/* Right Column: Order Summary */}
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 uppercase tracking-tight flex items-center gap-3 italic">
                                <div className="w-2 h-6 bg-cyan-500" />
                                Order Summary
                            </h2>
                            <div className="space-y-6 mb-8 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                                {items.map((item: CartItem) => (
                                    <div key={item.cartId} className="flex gap-4 group">
                                        <div className="relative w-20 h-20 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800 group-hover:border-cyan-500/30 transition-colors shadow-inner">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">{item.name}</h3>
                                            <p className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Quantity: {item.quantity}</p>
                                            <p className="text-cyan-400 text-sm font-bold mt-2 italic">{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Code Section */}
                            <div className="border-t border-slate-200 dark:border-slate-800/50 pt-6 pb-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="use-coupon"
                                            checked={useCoupon}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setUseCoupon(checked);
                                                if (!checked) {
                                                    handleRemoveCoupon();
                                                }
                                            }}
                                            className="appearance-none w-4 h-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer shrink-0 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                                        />
                                        <label htmlFor="use-coupon" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                            Apply Coupon Code
                                        </label>
                                    </div>
                                    {useCoupon && (
                                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => {
                                                        setCouponCode(e.target.value.toUpperCase());
                                                        setCouponError("");
                                                    }}
                                                    placeholder="ENTER CODE"
                                                    disabled={!!appliedCoupon || isApplyingCoupon}
                                                    className={cn(
                                                        "flex-1 bg-white dark:bg-slate-950/50 border rounded-xl px-4 py-2.5 text-xs font-mono tracking-widest focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white uppercase placeholder:text-slate-600/50",
                                                        couponError 
                                                            ? "border-red-500/50" 
                                                            : (appliedCoupon 
                                                                ? "border-emerald-500/50 bg-emerald-500/5" 
                                                                : "border-slate-200 dark:border-slate-800")
                                                    )}
                                                />
                                                {appliedCoupon ? (
                                                    <button
                                                        onClick={handleRemoveCoupon}
                                                        className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black rounded-xl uppercase tracking-wider transition-all border border-red-500/20"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleApplyCoupon}
                                                        disabled={isApplyingCoupon || !couponCode}
                                                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black rounded-xl uppercase tracking-wider disabled:opacity-50 transition-all shadow-md shadow-cyan-500/10"
                                                    >
                                                        {isApplyingCoupon ? '...' : 'Apply'}
                                                    </button>
                                                )}
                                            </div>
                                            {couponError && (
                                                <p className="text-[10px] text-red-500 font-bold px-1 animate-in fade-in duration-300">
                                                    ❌ {couponError}
                                                </p>
                                            )}
                                            {appliedCoupon && (
                                                <p className="text-[10px] text-emerald-500 font-bold px-1 animate-in fade-in duration-300">
                                                    ✨ Coupon Applied: {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`} Off!
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6 space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                    <span className="text-slate-900 dark:text-white">Rs {cartTotal.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-500">
                                        <span>Coupon ({appliedCoupon.code})</span>
                                        <span>- Rs {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest relative group">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                                        {shippingDetails && !shippingDetails.isFreeShipping && (
                                            <div className="relative group/tooltip">
                                                <Info size={12} className="text-slate-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                                    <p className="text-[9px] font-black uppercase text-cyan-400 mb-1">{shippingDetails.region}</p>
                                                    <p className="text-[8px] font-medium text-slate-400 leading-relaxed">
                                                        Base: ₹{shippingDetails.baseCharge}<br/>
                                                        Weight Fee: ₹{shippingDetails.weightCharge} ({shippingDetails.chargeableWeightKg}kg)<br/>
                                                        Est. Delivery: {shippingDetails.estimatedDays}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "transition-colors",
                                        shippingDetails?.isFreeShipping ? "text-emerald-500" : "text-slate-900 dark:text-white"
                                    )}>
                                        {shippingDetails?.isFreeShipping ? "FREE" : shippingDetails ? `Rs ${shippingDetails.totalShipping.toFixed(2)}` : "Select State"}
                                    </span>
                                </div>
                                {shippingDetails && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-lg animate-in fade-in slide-in-from-top-1 duration-500">
                                        <Truck size={12} className="text-cyan-500" />
                                        <span className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                                            Delivery: {shippingDetails.estimatedDays}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-4 border-t border-slate-200 dark:border-slate-800/50">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1 italic">Total Payable</span>
                                    <span className="text-3xl font-bold text-cyan-400 leading-none">Rs {grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-cyan-500 border border-slate-200 dark:border-slate-800 text-xl shadow-inner">🔒</div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Protected</p>
                                    <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-tighter">Secure Checkout</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-emerald-500 border border-slate-200 dark:border-slate-800 text-xl shadow-inner">🚚</div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Fast Track</p>
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

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-0 flex items-center justify-center">
                <div className="relative w-12 h-12 mx-auto">
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                </div>
            </main>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
