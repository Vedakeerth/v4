import React from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import PolicySidebar from "@/components/PolicySidebar";

const termsSections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "services", title: "2. Services Description" },
    {
        id: "orders",
        title: "3. Orders and Quotes",
        subsections: [
            { id: "quote-requests", title: "3.1 Quote Requests" },
            { id: "order-acceptance", title: "3.2 Order Acceptance" },
            { id: "design-files", title: "3.3 Design Files" }
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
        title: "8. Warranty and Returns",
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
    const lastUpdated = "January 30, 2026";

    return (
        <main className="min-h-screen bg-slate-950 pt-24">
            <div className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-slate-400">Last updated: {lastUpdated}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <PolicySidebar sections={termsSections} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 prose prose-invert max-w-none space-y-8 text-slate-300">
                        <section id="acceptance">
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="mb-4">
                                By accessing and using VAELINSA&apos;s website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                            <p>
                                These Terms of Service (&quot;Terms&quot;) govern your use of our 3D printing, product design, and rapid prototyping services provided by VAELINSA (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
                            </p>
                        </section>

                        <section id="services">
                            <h2 className="text-2xl font-bold text-white mb-4">2. Services Description</h2>
                            <p className="mb-4">
                                VAELINSA provides the following services:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>FDM (Fused Deposition Modeling) 3D printing</li>
                                <li>SLA (Stereolithography) / Resin printing</li>
                                <li>SLS (Selective Laser Sintering) printing</li>
                                <li>Product design and CAD engineering</li>
                                <li>Rapid prototyping services</li>
                                <li>Custom manufacturing and small-batch production</li>
                            </ul>
                            <p>
                                We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.
                            </p>
                        </section>

                        <section id="orders">
                            <h2 className="text-2xl font-bold text-white mb-4">3. Orders and Quotes</h2>

                            <h3 id="quote-requests" className="text-xl font-semibold text-white mb-3">3.1 Quote Requests</h3>
                            <p className="mb-4">
                                Quotes provided by VAELINSA are estimates based on the information provided and are valid for 30 days from the date of issue. Final pricing may vary based on actual material usage, complexity, and production requirements.
                            </p>

                            <h3 id="order-acceptance" className="text-xl font-semibold text-white mb-3 mt-6">3.2 Order Acceptance</h3>
                            <p className="mb-4">
                                All orders are subject to acceptance by VAELINSA. We reserve the right to refuse or cancel any order for any reason, including but not limited to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Unavailability of materials or equipment</li>
                                <li>Design issues or technical limitations</li>
                                <li>Suspected fraudulent activity</li>
                                <li>Violation of intellectual property rights</li>
                                <li>Orders that may be used for illegal purposes</li>
                            </ul>

                            <h3 id="design-files" className="text-xl font-semibold text-white mb-3 mt-6">3.3 Design Files</h3>
                            <p className="mb-4">
                                You are responsible for ensuring that:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>All design files (STL, OBJ, etc.) are properly formatted and error-free</li>
                                <li>You have the legal right to use and reproduce the designs</li>
                                <li>Designs do not infringe on third-party intellectual property rights</li>
                                <li>Designs comply with applicable laws and regulations</li>
                            </ul>
                        </section>

                        <section id="pricing">
                            <h2 className="text-2xl font-bold text-white mb-4">4. Pricing and Payment</h2>
                            <p className="mb-4">
                                All prices are quoted in Indian Rupees (INR) unless otherwise stated. Prices include applicable taxes unless specified otherwise.
                            </p>
                            <p className="mb-4">
                                Payment terms:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Payment is required before production begins, unless otherwise agreed in writing</li>
                                <li>We accept payment via bank transfer, UPI, and other methods as specified</li>
                                <li>All payments are non-refundable once production has commenced</li>
                                <li>Additional charges may apply for rush orders, special materials, or design modifications</li>
                            </ul>
                        </section>

                        <section id="production">
                            <h2 className="text-2xl font-bold text-white mb-4">5. Production and Delivery</h2>

                            <h3 id="production-timeline" className="text-xl font-semibold text-white mb-3">5.1 Production Timeline</h3>
                            <p className="mb-4">
                                Estimated production times are provided as guidelines and are not guaranteed. Actual production times may vary based on:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Order complexity and quantity</li>
                                <li>Material availability</li>
                                <li>Current production queue</li>
                                <li>Design modifications or revisions</li>
                            </ul>

                            <h3 id="shipping-delivery" className="text-xl font-semibold text-white mb-3 mt-6">5.2 Shipping and Delivery</h3>
                            <p className="mb-4">
                                Shipping costs are calculated based on weight, dimensions, and destination. We are not responsible for delays caused by shipping carriers or customs.
                            </p>
                            <p className="mb-4">
                                Risk of loss and title for products pass to you upon delivery to the carrier. You are responsible for filing any claims with carriers for damaged or lost shipments.
                            </p>
                        </section>

                        <section id="quality">
                            <h2 className="text-2xl font-bold text-white mb-4">6. Quality and Tolerances</h2>
                            <p className="mb-4">
                                We strive to maintain high quality standards. However, 3D printing is an additive manufacturing process with inherent limitations:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Dimensional tolerances: ±0.1mm to ±0.5mm depending on material and process</li>
                                <li>Surface finish may require post-processing</li>
                                <li>Color matching is approximate and may vary between batches</li>
                                <li>Material properties may vary slightly from specifications</li>
                            </ul>
                            <p>
                                We will work with you to address any quality concerns, but minor variations are inherent to the manufacturing process.
                            </p>
                        </section>

                        <section id="intellectual-property">
                            <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
                            <p className="mb-4">
                                You retain all intellectual property rights to your designs and files. By submitting files to us, you grant VAELINSA a limited, non-exclusive license to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Use your designs solely for the purpose of fulfilling your order</li>
                                <li>Store and process your files as necessary for production</li>
                            </ul>
                            <p className="mb-4">
                                VAELINSA retains all rights to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Our proprietary processes, techniques, and know-how</li>
                                <li>Any improvements or modifications we make to your designs (unless otherwise agreed)</li>
                                <li>Our website content, branding, and marketing materials</li>
                            </ul>
                        </section>

                        <section id="warranty">
                            <h2 className="text-2xl font-bold text-white mb-4">8. Warranty and Returns</h2>

                            <h3 id="warranty-terms" className="text-xl font-semibold text-white mb-3">8.1 Warranty</h3>
                            <p className="mb-4">
                                We warrant that our products will be free from material defects in workmanship for 30 days from delivery. This warranty does not cover:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Normal wear and tear</li>
                                <li>Damage caused by misuse, abuse, or improper handling</li>
                                <li>Design flaws or errors in customer-provided files</li>
                                <li>Modifications made after delivery</li>
                            </ul>

                            <h3 id="returns-refunds" className="text-xl font-semibold text-white mb-3 mt-6">8.2 Returns and Refunds</h3>
                            <p className="mb-4">
                                Due to the custom nature of our products, returns are generally not accepted. However, we will work with you to resolve any legitimate quality issues:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>If a product is defective, we will replace it at no charge</li>
                                <li>If an error is our fault, we will provide a refund or reprint</li>
                                <li>Refunds are not available for customer design errors or change of mind</li>
                            </ul>
                        </section>

                        <section id="liability">
                            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
                            <p className="mb-4">
                                To the maximum extent permitted by law:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>VAELINSA&apos;s total liability shall not exceed the amount paid by you for the specific order</li>
                                <li>We are not liable for indirect, incidental, or consequential damages</li>
                                <li>We are not responsible for any loss or damage resulting from the use of our products</li>
                                <li>Products are provided &quot;as is&quot; without warranties of merchantability or fitness for a particular purpose (except as stated above)</li>
                            </ul>
                        </section>

                        <section id="prohibited">
                            <h2 className="text-2xl font-bold text-white mb-4">10. Prohibited Uses</h2>
                            <p className="mb-4">You agree not to use our services to:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Create items that violate any laws or regulations</li>
                                <li>Produce weapons, firearms, or dangerous items</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Create items that are obscene, defamatory, or harmful</li>
                                <li>Reproduce copyrighted or trademarked materials without authorization</li>
                                <li>Create items intended to cause harm or injury</li>
                            </ul>
                            <p>
                                We reserve the right to refuse service for any order that violates these prohibitions.
                            </p>
                        </section>

                        <section id="indemnification">
                            <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
                            <p>
                                You agree to indemnify and hold harmless VAELINSA, its employees, and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2 mt-4">
                                <li>Your use of our services</li>
                                <li>Your violation of these Terms</li>
                                <li>Your violation of any third-party rights</li>
                                <li>Any design files or content you provide to us</li>
                            </ul>
                        </section>

                        <section id="modifications">
                            <h2 className="text-2xl font-bold text-white mb-4">12. Modifications to Terms</h2>
                            <p className="mb-4">
                                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms.
                            </p>
                            <p>
                                It is your responsibility to review these Terms periodically for updates.
                            </p>
                        </section>

                        <section id="governing-law">
                            <h2 className="text-2xl font-bold text-white mb-4">13. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts in India.
                            </p>
                        </section>

                        <section id="contact">
                            <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
                            <p className="mb-4">
                                If you have any questions about these Terms of Service, please contact us:
                            </p>
                            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                                <p className="mb-2"><strong className="text-white">VAELINSA</strong></p>
                                <p className="mb-2">Email: <a href="mailto:sales@vaelinsa.com" className="text-blue-400 hover:text-blue-300">sales@vaelinsa.com</a></p>
                                <p>Website: <a href="https://vaelinsa.com" className="text-blue-400 hover:text-blue-300">www.vaelinsa.com</a></p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
