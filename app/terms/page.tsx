import React from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import PolicySidebar from "@/components/PolicySidebar";
import { Check, Mail, Globe } from "lucide-react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    return await getPageMetadata('Terms', '/terms');
}

const termsSections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "services", title: "2. Services Description" },
    {
        id: "orders",
        title: "3. Orders and Quotations",
        subsections: [
            { id: "quote-validity", title: "3.1 Quote Validity" },
            { id: "order-acceptance", title: "3.2 Order Acceptance" },
            { id: "customer-responsibilities", title: "3.3 Customer Responsibilities" }
        ]
    },
    { id: "pricing", title: "4. Pricing and Payment" },
    {
        id: "production",
        title: "5. Production and Delivery",
        subsections: [
            { id: "production-timeline", title: "5.1 Production Timeline" },
            { id: "shipping-delivery", title: "5.2 Shipping and Delivery" }
        ]
    },
    { id: "quality", title: "6. Quality and Tolerances" },
    { id: "intellectual-property", title: "7. Intellectual Property" },
    {
        id: "warranty",
        title: "8. Warranty and Returns (7-Day Policy)",
        subsections: [
            { id: "warranty-terms", title: "8.1 Warranty" },
            { id: "returns-refunds", title: "8.2 Returns and Refunds" }
        ]
    },
    { id: "liability", title: "9. Limitation of Liability" },
    { id: "prohibited", title: "10. Prohibited Uses" },
    { id: "indemnification", title: "11. Indemnification" },
    { id: "modifications", title: "12. Modifications to Terms" },
    { id: "governing-law", title: "13. Governing Law" },
    { id: "contact", title: "14. Contact Information" }
];

export default function TermsOfServicePage() {
    const lastUpdated = "April 26, 2026";

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            <div className="dynamic-container py-12">
                <div className="mb-12">
                    <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-xs font-black uppercase tracking-widest mb-6 inline-flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Terms of Service</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Last updated: {lastUpdated}</p>
                    <div className="h-1 w-20 bg-cyan-500 mt-8 rounded-full" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <PolicySidebar sections={termsSections} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 prose dark:prose-invert max-w-none space-y-12 text-slate-700 dark:text-slate-300">
                        <section id="acceptance">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="mb-4">
                                By accessing and using VAELINSA’s website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
                            </p>
                            <p>
                                These Terms govern your use of our 3D printing, product design, and rapid prototyping services.
                            </p>
                        </section>

                        <section id="services">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Services Description</h2>
                            <p className="mb-4">
                                VAELINSA provides the following services:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium">
                                <li>FDM (Fused Deposition Modeling) 3D printing</li>
                                <li>SLA (Resin) 3D printing</li>
                                <li>SLS (Selective Laser Sintering) printing</li>
                                <li>Product design and CAD engineering</li>
                                <li>Rapid prototyping</li>
                                <li>Custom manufacturing and small-batch production</li>
                            </ul>
                            <p className="italic text-slate-500 dark:text-slate-400 text-sm">
                                We reserve the right to modify or discontinue any service at any time without prior notice.
                            </p>
                        </section>

                        <section id="orders">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">3. Orders and Quotations</h2>

                            <h3 id="quote-validity" className="text-xl font-semibold text-slate-900 dark:text-white mb-3">3.1 Quote Validity</h3>
                            <p className="mb-4">
                                All quotes are estimates based on provided information and are valid for 10 days. Final pricing may vary depending on actual production requirements.
                            </p>

                            <h3 id="order-acceptance" className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">3.2 Order Acceptance</h3>
                            <p className="mb-4">
                                Orders are subject to acceptance. We reserve the right to refuse or cancel orders due to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Technical or design limitations</li>
                                <li>Material unavailability</li>
                                <li>Suspected fraudulent activity</li>
                                <li>Legal or intellectual property violations</li>
                            </ul>

                            <h3 id="customer-responsibilities" className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-6">3.3 Customer Responsibilities</h3>
                            <p className="mb-4">
                                You are responsible for ensuring:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium">
                                <li>Files (STL, OBJ, etc.) are correct and printable</li>
                                <li>You own or have rights to the design</li>
                                <li>Designs do not violate any laws or third-party rights</li>
                            </ul>
                        </section>

                        <section id="pricing">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Pricing and Payment</h2>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium text-slate-800 dark:text-slate-200">
                                <li>All prices are in INR (₹) unless stated otherwise</li>
                                <li>Payment must be completed before production begins</li>
                                <li>Accepted methods: UPI, bank transfer, or other approved methods</li>
                                <li>Payments are non-refundable once production has started</li>
                                <li>Additional charges may apply for revisions or special requests</li>
                            </ul>
                        </section>

                        <section id="production">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">5. Production and Delivery</h2>

                            <h3 id="production-timeline" className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5.1 Production Timeline</h3>
                            <p className="mb-4">
                                Timelines are estimates and may vary due to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium">
                                <li>Order complexity</li>
                                <li>Material availability</li>
                                <li>Production queue</li>
                            </ul>

                            <h3 id="shipping-delivery" className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-8">5.2 Shipping and Delivery</h3>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Shipping costs are calculated separately unless stated</li>
                                <li>We are not responsible for courier delays</li>
                                <li>Risk transfers to the customer once shipped</li>
                                <li>Customers must report delivery issues directly with the courier</li>
                            </ul>
                        </section>

                        <section id="quality">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Quality and Tolerances</h2>
                            <p className="mb-4 text-slate-500 dark:text-slate-400 italic">Due to the nature of 3D printing:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium">
                                <li>Dimensional tolerance: ±0.1 mm to ±0.5 mm</li>
                                <li>Surface finish may vary</li>
                                <li>Color differences may occur</li>
                                <li>Minor imperfections are normal</li>
                            </ul>
                        </section>

                        <section id="intellectual-property">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Intellectual Property</h2>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium text-slate-800 dark:text-slate-200">
                                <li>You retain ownership of your designs</li>
                                <li>You grant VAELINSA permission to use files for production</li>
                                <li>We retain rights to our processes and improvements</li>
                            </ul>
                        </section>

                        <section id="warranty">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">8. Warranty and Returns (7-Day Policy)</h2>

                            <h3 id="warranty-terms" className="text-xl font-semibold text-slate-900 dark:text-white mb-3">8.1 Warranty</h3>
                            <p className="mb-4 font-bold text-cyan-600 dark:text-cyan-400">
                                We provide a 7-day warranty starting from the date the customer receives the product/package.
                            </p>
                            <p className="mb-4">This warranty covers manufacturing defects only and does not include:</p>
                            <ul className="list-disc pl-6 mb-6 space-y-2 font-medium">
                                <li>Misuse or improper handling</li>
                                <li>Design errors from customer files</li>
                                <li>Modifications after delivery</li>
                                <li>Normal wear and tear</li>
                            </ul>

                            <h3 id="returns-refunds" className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-8">8.2 Returns and Refunds</h3>
                            <p className="mb-6 italic">
                                Due to the custom nature of our products, returns are limited. However, we offer a 7-day return/replacement policy starting from the date of delivery.
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" /> Eligible Cases (within 7 days)
                                    </h4>
                                    <ul className="list-disc pl-6 space-y-2 text-sm font-medium">
                                        <li>Product is damaged or defective</li>
                                        <li>Product does not match approved specifications</li>
                                        <li>Manufacturing error from our side</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full" /> Not Eligible
                                    </h4>
                                    <ul className="list-disc pl-6 space-y-2 text-sm font-medium">
                                        <li>Change of mind</li>
                                        <li>Customer design mistakes</li>
                                        <li>Minor variations due to printing process</li>
                                    </ul>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <h4 className="text-sm font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-[0.2em] mb-4">Return Process</h4>
                                    <ul className="list-disc pl-6 space-y-2 text-xs font-bold uppercase tracking-tight text-slate-500">
                                        <li>Must be reported within 7 days of delivery</li>
                                        <li>Proof (photos/videos) required</li>
                                        <li>Approval required before return</li>
                                    </ul>
                                </div>

                                <div className="pt-4">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Resolution Options</h4>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase">Free replacement</span>
                                        <span className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase">Partial/Full refund</span>
                                        <span className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase">Store credit</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="liability">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Limitation of Liability</h2>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium">
                                <li>Liability is limited to the order value</li>
                                <li>We are not responsible for indirect or consequential damages</li>
                                <li>Products are provided “as is” except stated warranty</li>
                            </ul>
                        </section>

                        <section id="prohibited">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Prohibited Uses</h2>
                            <p className="mb-4">You agree not to use our services to create:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium text-slate-800 dark:text-slate-200">
                                <li>Illegal or harmful items</li>
                                <li>Weapons or restricted products</li>
                                <li>Copyrighted materials without permission</li>
                                <li>Content that is abusive or harmful</li>
                            </ul>
                            <p className="mt-6 italic text-slate-500 dark:text-slate-400">We reserve the right to refuse such orders.</p>
                        </section>

                        <section id="indemnification">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Indemnification</h2>
                            <p className="mb-4">You agree to indemnify VAELINSA from any claims arising from:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2 font-medium">
                                <li>Your use of services</li>
                                <li>Violation of laws or rights</li>
                                <li>Submitted designs</li>
                            </ul>
                        </section>

                        <section id="modifications">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Modifications to Terms</h2>
                            <p>
                                We may update these Terms at any time. Continued use of our services means acceptance of the updated Terms.
                            </p>
                        </section>

                        <section id="governing-law">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. Governing Law</h2>
                            <p>
                                These Terms are governed by the laws of India, and disputes will be subject to Indian jurisdiction.
                            </p>
                        </section>

                        <section id="contact">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">14. Contact Information</h2>
                            <div className="bg-white dark:bg-slate-900/80 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                                    <Check size={120} className="text-slate-400 dark:text-cyan-500" />
                                </div>
                                <div className="relative z-10">
                                    <p className="mb-4"><strong className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">VAELINSA</strong></p>
                                    <div className="space-y-3">
                                        <p className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            <span className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-cyan-600 dark:text-cyan-500"><Mail size={12} /></span> 
                                            Email: <a href="mailto:sales@vaelinsa.com" className="text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">sales@vaelinsa.com</a>
                                        </p>
                                        <p className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            <span className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-cyan-600 dark:text-cyan-500"><Globe size={12} /></span> 
                                            Website: <a href="https://www.vaelinsa.com" className="text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">www.vaelinsa.com</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
