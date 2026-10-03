import React from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import PolicySidebar from "@/components/PolicySidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shipping Policy | VAELINSA",
    description: "Learn about VAELINSA's shipping methods, delivery timelines, charges, and policies for 3D printing orders across India.",
};

const shippingSections = [
    { id: "overview", title: "1. Overview" },
    { id: "processing-time", title: "2. Order Processing Time" },
    { id: "delivery-timeline", title: "3. Delivery Timeline" },
    { id: "shipping-charges", title: "4. Shipping Charges" },
    { id: "carriers", title: "5. Shipping Carriers" },
    { id: "tracking", title: "6. Order Tracking" },
    { id: "failed-delivery", title: "7. Failed Delivery" },
    { id: "damaged-lost", title: "8. Damaged or Lost Shipments" },
    { id: "international", title: "9. International Shipping" },
    { id: "contact", title: "10. Contact Us" },
];

export default function ShippingPolicyPage() {
    const lastUpdated = "October 04, 2026";

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            <div className="dynamic-container py-12">
                <div className="mb-12">
                    <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-xs font-black uppercase tracking-widest mb-6 inline-flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Shipping Policy</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Last updated: {lastUpdated}</p>
                    <div className="h-1 w-20 bg-cyan-500 mt-8 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <PolicySidebar sections={shippingSections} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 prose dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300">

                        <section id="overview">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">1. Overview</h2>
                            <p className="mb-4">
                                At VAELINSA, we are committed to delivering your 3D-printed parts and products with care, speed, and reliability. All orders are shipped across India via trusted courier partners. Please read this Shipping Policy carefully to understand delivery timelines, charges, and our commitment to your order.
                            </p>
                        </section>

                        <section id="processing-time">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">2. Order Processing Time</h2>
                            <p className="mb-4">
                                After payment is confirmed, your order will enter our production queue. Processing time depends on the complexity and quantity of parts ordered:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong className="text-slate-900 dark:text-white">Standard Products (Gallery Items):</strong> 1–3 business days for production + packing.</li>
                                <li><strong className="text-slate-900 dark:text-white">Custom 3D Printed Parts:</strong> 3–7 business days depending on geometry, material, and print volume.</li>
                                <li><strong className="text-slate-900 dark:text-white">Bulk Orders (&gt;10 units):</strong> Processing time will be communicated separately via email or WhatsApp.</li>
                            </ul>
                            <p className="mb-4 text-sm text-slate-500">
                                Note: Processing time does not include shipping transit time.
                            </p>
                        </section>

                        <section id="delivery-timeline">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">3. Delivery Timeline</h2>
                            <p className="mb-4">
                                Once dispatched, estimated delivery timelines within India are as follows:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong className="text-slate-900 dark:text-white">Local (Tamil Nadu):</strong> 1–3 business days</li>
                                <li><strong className="text-slate-900 dark:text-white">Metro Cities (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata):</strong> 3–5 business days</li>
                                <li><strong className="text-slate-900 dark:text-white">Rest of India:</strong> 5–10 business days</li>
                                <li><strong className="text-slate-900 dark:text-white">Remote / Hilly Areas:</strong> 7–14 business days</li>
                            </ul>
                            <p className="mb-4">
                                Delivery timelines are estimates only and may be affected by courier delays, public holidays, weather conditions, or force majeure events beyond our control.
                            </p>
                        </section>

                        <section id="shipping-charges">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">4. Shipping Charges</h2>
                            <p className="mb-4">
                                Shipping charges are calculated at checkout based on the delivery destination and the total weight of the order. The applicable shipping charge will be clearly displayed before you complete payment.
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong className="text-slate-900 dark:text-white">Free Shipping:</strong> Available on select orders above a minimum order value as displayed during checkout.</li>
                                <li><strong className="text-slate-900 dark:text-white">Standard Shipping:</strong> Calculated based on package weight and destination pincode.</li>
                                <li><strong className="text-slate-900 dark:text-white">Expedited Shipping:</strong> Available on request for select pincodes. Contact us before placing the order.</li>
                            </ul>
                        </section>

                        <section id="carriers">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">5. Shipping Carriers</h2>
                            <p className="mb-4">
                                We partner with reliable courier services for all deliveries, including but not limited to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Delhivery</li>
                                <li>DTDC</li>
                                <li>BlueDart</li>
                                <li>India Post (for select remote pincodes)</li>
                                <li>Other regional courier partners as applicable</li>
                            </ul>
                            <p className="mb-4">
                                VAELINSA reserves the right to select the carrier best suited for your delivery location and order size.
                            </p>
                        </section>

                        <section id="tracking">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">6. Order Tracking</h2>
                            <p className="mb-4">
                                Once your order is dispatched, you will receive a tracking ID via email. You can track your order at any time using our Order Tracking page on the VAELINSA website or directly on the courier's website using the provided tracking number.
                            </p>
                            <p className="mb-4">
                                You can also track your order at: <Link href="/track-order" className="text-cyan-400 hover:text-cyan-300 underline">vaelinsa.com/track-order</Link>
                            </p>
                        </section>

                        <section id="failed-delivery">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">7. Failed Delivery</h2>
                            <p className="mb-4">
                                If a delivery attempt fails because the customer was unavailable or the address provided was incorrect:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>The courier will make up to 3 delivery attempts.</li>
                                <li>If all attempts fail, the package will be returned to VAELINSA.</li>
                                <li>Re-shipment charges will apply for re-dispatching the returned order.</li>
                                <li>VAELINSA is not responsible for failed deliveries due to incorrect or incomplete addresses provided by the customer at the time of order.</li>
                            </ul>
                        </section>

                        <section id="damaged-lost">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">8. Damaged or Lost Shipments</h2>
                            <p className="mb-4">
                                If your order arrives damaged, please:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Photograph the damaged package and product immediately upon receipt.</li>
                                <li>Contact us within <strong className="text-slate-900 dark:text-white">48 hours</strong> of delivery at <a href="mailto:support@vaelinsa.com" className="text-cyan-400 hover:text-cyan-300">support@vaelinsa.com</a> with your order ID and photos.</li>
                                <li>We will investigate with the courier and arrange a replacement or refund as appropriate.</li>
                            </ul>
                            <p className="mb-4">
                                For lost shipments (no movement for 10+ business days after dispatch), please contact us immediately and we will lodge a claim with the carrier on your behalf.
                            </p>
                        </section>

                        <section id="international">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">9. International Shipping</h2>
                            <p className="mb-4">
                                Currently, VAELINSA primarily ships within India. International shipping is available on a case-by-case basis for select orders. If you require international delivery, please contact us at <a href="mailto:support@vaelinsa.com" className="text-cyan-400 hover:text-cyan-300">support@vaelinsa.com</a> before placing your order to confirm availability, timelines, and shipping costs.
                            </p>
                            <p className="mb-4 text-sm text-slate-500">
                                Note: International customers are responsible for any applicable customs duties, taxes, or import fees charged by their country.
                            </p>
                        </section>

                        <section id="contact">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">10. Contact Us</h2>
                            <p className="mb-4">
                                For any shipping-related queries, please reach out to us:
                            </p>
                            <ul className="list-none pl-0 mb-4 space-y-2">
                                <li><strong className="text-slate-900 dark:text-white">Email:</strong> <a href="mailto:support@vaelinsa.com" className="text-cyan-400 hover:text-cyan-300">support@vaelinsa.com</a></li>
                                <li><strong className="text-slate-900 dark:text-white">Website:</strong> <Link href="/contact" className="text-cyan-400 hover:text-cyan-300">vaelinsa.com/contact</Link></li>
                                <li><strong className="text-slate-900 dark:text-white">Business Hours:</strong> Monday – Saturday, 9:00 AM – 6:00 PM IST</li>
                            </ul>
                        </section>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
