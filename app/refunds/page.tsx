import React from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import PolicySidebar from "@/components/PolicySidebar";

const refundSections = [
    { id: "overview", title: "1. Overview" },
    { id: "cancellations", title: "2. Order Cancellations" },
    { id: "refund-eligibility", title: "3. Refund Eligibility" },
    { id: "custom-orders", title: "4. Custom 3D Printing Orders" },
    { id: "digital-services", title: "5. Digital & Design Services" },
    { id: "process", title: "6. Refund Process" },
    { id: "shipping", title: "7. Shipping Costs" },
    { id: "contact", title: "8. Contact for Refunds" }
];

export default function RefundsPage() {
    const lastUpdated = "March 06, 2026";

    return (
        <main className="min-h-screen bg-slate-950 pt-24">
            <div className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block transition-colors">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Refunds & Cancellations</h1>
                    <p className="text-slate-400">Last updated: {lastUpdated}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <PolicySidebar sections={refundSections} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 prose prose-invert max-w-none space-y-8 text-slate-300">
                        <section id="overview">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">1. Overview</h2>
                            <p className="mb-4">
                                At VAELINSA, we strive to ensure complete satisfaction with our 3D printing and design services. However, due to the highly customized nature of our products, our refund and cancellation policy is structured to balance customer fairness with the specific costs involved in bespoke manufacturing.
                            </p>
                        </section>

                        <section id="cancellations">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">2. Order Cancellations</h2>
                            <p className="mb-4">
                                You can cancel your order under the following conditions:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Before Production Starts:</strong> Full refund minus a 5% processing fee if cancelled before we have begun the 3D printing or manufacturing process.</li>
                                <li><strong>After Production Starts:</strong> Once production has commenced (material is being used), cancellations are not accepted, and no refund will be issued.</li>
                                <li><strong>Pre-order Items:</strong> Can be cancelled within 24 hours of placing the order for a full refund.</li>
                            </ul>
                        </section>

                        <section id="refund-eligibility">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">3. Refund Eligibility</h2>
                            <p className="mb-4">
                                Refunds are only considered in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>The product received is significantly different from the design specifications agreed upon.</li>
                                <li>The product has major functional defects not inherent to the 3D printing process.</li>
                                <li>The order was not delivered within 30 days of the estimated delivery date due to our internal errors.</li>
                            </ul>
                        </section>

                        <section id="custom-orders">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">4. Custom 3D Printing Orders</h2>
                            <p className="mb-4">
                                Please note that 3D printing is an additive process:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Minor surface imperfections or layer lines are inherent to the process and do not qualify for refunds.</li>
                                <li>Small dimensional variations (±0.5mm) are standard and not considered defects.</li>
                                <li>Refunds are not provided for errors in customer-provided STL or CAD files.</li>
                            </ul>
                        </section>

                        <section id="digital-services">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">5. Digital & Design Services</h2>
                            <p className="mb-4">
                                Fees for design consulting, CAD modeling, and engineering services are non-refundable once the work has been initiated, as these costs represent labor hours already expended.
                            </p>
                        </section>

                        <section id="process">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">6. Refund Process</h2>
                            <p className="mb-4">
                                To request a refund:
                            </p>
                            <ol className="list-decimal pl-6 mb-4 space-y-2">
                                <li>Email <a href="mailto:sales@vaelinsa.com" className="text-cyan-400">sales@vaelinsa.com</a> with your Order ID and photos of the issue.</li>
                                <li>Our team will review the request within 3-5 business days.</li>
                                <li>If approved, the refund will be processed to your original payment method within 7-10 working days.</li>
                            </ol>
                        </section>

                        <section id="shipping">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">7. Shipping Costs</h2>
                            <p className="mb-4">
                                Shipping costs are non-refundable. If you receive a refund, the cost of initial shipping will be deducted from your refund amount.
                            </p>
                        </section>

                        <section id="contact">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">8. Contact Information</h2>
                            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                                <p className="mb-2"><strong className="text-white">VAELINSA Customer Support</strong></p>
                                <p className="mb-2 text-slate-300">Email: <a href="mailto:sales@vaelinsa.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">sales@vaelinsa.com</a></p>
                                <p className="text-slate-300 text-sm italic">We aim to respond to all concerns within 24-48 business hours.</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
