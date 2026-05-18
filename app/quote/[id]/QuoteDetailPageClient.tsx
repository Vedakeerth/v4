"use client";

import React, { useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import dynamicComponent from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";
import QuotationDocument from "@/components/QuotationDocument";

const QuoteCalculator = dynamicComponent(() => import("@/components/QuoteCalculator"), {
    loading: () => (
        <div className="dynamic-container py-12">
            <Skeleton variant="rounded" height={600} />
        </div>
    ),
    ssr: false,
});

interface QuoteDetailPageClientProps {
    id: string;
}

export default function QuoteDetailPageClient({ id }: QuoteDetailPageClientProps) {
    const [orderData, setOrderData] = React.useState<any>(null);
    const [loadingOrder, setLoadingOrder] = React.useState(id.startsWith('VQ') || id.startsWith('IN'));

    useEffect(() => {
        // Detect if the page was reloaded/refreshed
        if (typeof window !== 'undefined') {
            const navEntries = performance.getEntriesByType('navigation') as any[];
            if (navEntries.length > 0 && navEntries[0].type === 'reload') {
                // Perform a hard redirect to /quote to generate a fresh ID and reset navigation state
                window.location.href = '/quote';
            }
        }

        if (id.startsWith('VQ') || id.startsWith('IN')) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            // Use a specific public fetch endpoint for quotations
            const res = await fetch(`/api/orders/${id}/public`);
            const data = await res.json();
            if (data.success) {
                setOrderData(data.order);
            }
        } catch (error) {
            console.error("Failed to fetch order:", error);
        } finally {
            setLoadingOrder(false);
        }
    };

    if (loadingOrder) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-4 pt-24">
                <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold uppercase tracking-widest text-xs animate-pulse text-slate-500">Retrieving Quotation Data...</p>
            </div>
        );
    }

    if (orderData) {
        return (
            <main className="min-h-screen bg-slate-100 dark:bg-slate-950 pt-24 pb-12">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 mt-8">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-8 shadow-2xl overflow-x-auto">
                        <QuotationDocument 
                            quoteId={orderData.trackingId}
                            date={new Date(orderData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            dueDate={new Date(new Date(orderData.createdAt).getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            client={{
                                name: orderData.customerName,
                                details: 'Gallery Purchase',
                                address: orderData.address,
                                email: orderData.email,
                                phone: orderData.phone
                            }}
                            items={orderData.items.map((item: any) => ({
                                name: item.name,
                                description: item.description || `Gallery Product • ${item.id}`,
                                price: item.price,
                                quantity: item.quantity,
                                total: item.price * item.quantity,
                                color: item.selectedColor || '#000000'
                            }))}
                            totalAmount={orderData.totalAmount}
                            totalQty={orderData.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                            shippingCost={orderData.shipping || 0}
                            discount={orderData.discount || 0}
                        />
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            <Navbar />
            <div className="dynamic-container py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase text-slate-900 dark:text-white mb-4 tracking-tighter">
                        AI <span className="text-cyan-400">Quote</span> Engine
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        Personalized Session ID: <span className="text-cyan-500/80 font-mono text-sm">{id}</span>
                    </p>
                </div>
                
                <QuoteCalculator sessionId={id} />
            </div>
            <Footer />
        </main>
    );
}
