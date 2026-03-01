import React from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import PolicySidebar from "@/components/PolicySidebar";

interface Section {
    id: string;
    title: string;
    subsections?: { id: string; title: string }[];
}

const privacySections: Section[] = [
    { id: "introduction", title: "1. Introduction" },
    { id: "definitions", title: "2. Definitions" },
    {
        id: "information-collect",
        title: "3. Information We Collect",
        subsections: [
            { id: "voluntary-info", title: "3.1 Information You Voluntarily Provide" },
            { id: "automatic-info", title: "3.2 Automatically Collected Information" }
        ]
    },
    { id: "legal-basis", title: "4. Legal Basis for Processing (GDPR)" },
    { id: "purpose", title: "5. Purpose of Data Processing" },
    {
        id: "data-sharing",
        title: "6. Data Sharing and Disclosure",
        subsections: [
            { id: "service-providers", title: "6.1 Service Providers" },
            { id: "legal-compliance", title: "6.2 Legal Compliance" },
            { id: "business-transfers", title: "6.3 Business Transfers" },
            { id: "user-consent", title: "6.4 With User Consent" }
        ]
    },
    {
        id: "design-files",
        title: "7. Design Files, Uploaded Models & Intellectual Property",
        subsections: [
            { id: "file-deletion", title: "7.1 File Deletion Policy" }
        ]
    },
    { id: "data-retention", title: "8. Data Retention Policy" },
    { id: "data-security", title: "9. Data Security Measures" },
    { id: "shipping-disclaimer", title: "10. Shipping & Delivery Disclaimer" },
    {
        id: "your-rights",
        title: "11. Your Rights",
        subsections: [
            { id: "gdpr-rights", title: "11.1 GDPR Rights" },
            { id: "indian-rights", title: "11.2 Rights Under Indian Law" }
        ]
    },
    { id: "cookies", title: "12. Cookies and Tracking Technologies" },
    { id: "children-privacy", title: "13. Children's Privacy" },
    { id: "international-transfers", title: "14. International Data Transfers" },
    { id: "policy-updates", title: "15. Policy Updates" },
    { id: "contact", title: "16. Contact Information" }
];

export default function PrivacyPolicyPage() {
    const lastUpdated = "January 30, 2026";

    return (
        <main className="min-h-screen bg-slate-950 pt-24">
            <div className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-slate-400">Last updated: {lastUpdated}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <PolicySidebar sections={privacySections} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 prose prose-invert max-w-none space-y-8 text-slate-300">
                        <section id="introduction">
                            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                            <p className="mb-4">
                                VAELINSA ("Company", "we", "our", or "us") is committed to protecting the privacy, confidentiality, and security of personal information entrusted to us. This Privacy Policy explains how we collect, use, store, process, disclose, and safeguard personal data when you access our website or use our 3D printing, prototyping, and product development services.
                            </p>
                            <p className="mb-4">
                                This Privacy Policy is formulated in accordance with:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>The Information Technology Act, 2000 (India)</li>
                                <li>The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
                                <li>The General Data Protection Regulation (EU) 2016/679 (GDPR)</li>
                            </ul>
                            <p>
                                By using our website or services, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
                            </p>
                        </section>

                        <section id="definitions">
                            <h2 className="text-2xl font-bold text-white mb-4">2. Definitions</h2>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong className="text-white">"Personal Data"</strong>: Any information capable of identifying an individual.</li>
                                <li><strong className="text-white">"Sensitive Personal Data"</strong>: Financial or payment-related information as defined under applicable law.</li>
                                <li><strong className="text-white">"Processing"</strong>: Any operation performed on personal data, including collection, storage, use, or deletion.</li>
                                <li><strong className="text-white">"User" / "You"</strong>: Any individual or entity accessing our services.</li>
                            </ul>
                        </section>

                        <section id="information-collect">
                            <h2 className="text-2xl font-bold text-white mb-4">3. Information We Collect</h2>

                            <h3 id="voluntary-info" className="text-xl font-semibold text-white mb-3">3.1 Information You Voluntarily Provide</h3>
                            <p className="mb-4">
                                We collect personal information when you:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Request quotations or technical consultations</li>
                                <li>Place orders for 3D printing or manufacturing services</li>
                                <li>Upload STL, CAD, or other design files</li>
                                <li>Contact us via email, forms, or phone</li>
                                <li>Subscribe to newsletters or updates</li>
                            </ul>
                            <p className="mb-4">
                                This information may include:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Full name</li>
                                <li>Email address and phone number</li>
                                <li>Shipping and billing address</li>
                                <li>Company name (if applicable)</li>
                                <li>Uploaded STL/CAD/design files</li>
                                <li>Payment details (processed securely via third-party payment gateways)</li>
                            </ul>

                            <h3 id="automatic-info" className="text-xl font-semibold text-white mb-3 mt-6">3.2 Automatically Collected Information</h3>
                            <p className="mb-4">
                                When you visit our website, we may automatically collect:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>IP address</li>
                                <li>Browser type and version</li>
                                <li>Device and operating system details</li>
                                <li>Pages visited, session duration, and interaction data</li>
                                <li>Referring URLs</li>
                            </ul>
                            <p>
                                This information is used for analytics, security monitoring, and service improvement.
                            </p>
                        </section>

                        <section id="legal-basis">
                            <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing (GDPR)</h2>
                            <p className="mb-4">We process personal data based on:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong className="text-white">Contractual necessity</strong> – to provide services and fulfill orders</li>
                                <li><strong className="text-white">Consent</strong> – for marketing and optional communications</li>
                                <li><strong className="text-white">Legal obligation</strong> – compliance with applicable laws</li>
                                <li><strong className="text-white">Legitimate interests</strong> – security, fraud prevention, and service enhancement</li>
                            </ul>
                        </section>

                        <section id="purpose">
                            <h2 className="text-2xl font-bold text-white mb-4">5. Purpose of Data Processing</h2>
                            <p className="mb-4">We use personal data to:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Manufacture, process, and deliver 3D printed products</li>
                                <li>Communicate order status, quotations, and technical clarifications</li>
                                <li>Provide customer support and after-sales service</li>
                                <li>Improve website functionality and user experience</li>
                                <li>Send promotional communications (with consent)</li>
                                <li>Prevent fraud and ensure platform security</li>
                                <li>Meet legal and regulatory requirements</li>
                            </ul>
                        </section>

                        <section id="data-sharing">
                            <h2 className="text-2xl font-bold text-white mb-4">6. Data Sharing and Disclosure</h2>
                            <p className="mb-4">
                                We do not sell or trade personal data.
                            </p>
                            <p className="mb-4">
                                Information may be shared only under the following conditions:
                            </p>

                            <h3 id="service-providers" className="text-xl font-semibold text-white mb-3">6.1 Service Providers</h3>
                            <p className="mb-4">
                                With trusted third parties assisting in:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Payment processing</li>
                                <li>Shipping and logistics</li>
                                <li>Website hosting and analytics</li>
                            </ul>
                            <p className="mb-4">
                                All providers are contractually bound to maintain confidentiality and data security.
                            </p>

                            <h3 id="legal-compliance" className="text-xl font-semibold text-white mb-3 mt-6">6.2 Legal Compliance</h3>
                            <p className="mb-4">
                                Where disclosure is required by law, regulation, or court order.
                            </p>

                            <h3 id="business-transfers" className="text-xl font-semibold text-white mb-3 mt-6">6.3 Business Transfers</h3>
                            <p className="mb-4">
                                In the event of a merger, acquisition, or asset sale, personal data may be transferred as part of the transaction.
                            </p>

                            <h3 id="user-consent" className="text-xl font-semibold text-white mb-3 mt-6">6.4 With User Consent</h3>
                            <p>
                                When explicit permission is provided by the user.
                            </p>
                        </section>

                        <section id="design-files">
                            <h2 className="text-2xl font-bold text-white mb-4">7. Design Files, Uploaded Models & Intellectual Property</h2>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>All STL, CAD, or design files uploaded by users remain confidential</li>
                                <li>VAELINSA does not claim ownership of user-submitted designs</li>
                                <li>Files are used strictly for manufacturing, quality control, and support purposes</li>
                                <li>Design files are not shared with third parties without explicit consent</li>
                            </ul>

                            <h3 id="file-deletion" className="text-xl font-semibold text-white mb-3 mt-6">7.1 File Deletion Policy</h3>
                            <p className="mb-4">
                                Uploaded design files and models are automatically deleted within 10 to 20 days after successful delivery of the printed part, unless:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Extended retention is legally required, or</li>
                                <li>The user explicitly requests longer storage in writing</li>
                            </ul>
                        </section>

                        <section id="data-retention">
                            <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention Policy</h2>
                            <p className="mb-4">We retain personal data only for as long as necessary:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong className="text-white">Order and transaction records:</strong> Up to 2 years</li>
                                <li><strong className="text-white">Design files and uploaded models:</strong> 10–20 days after delivery</li>
                                <li><strong className="text-white">Marketing data:</strong> Until consent is withdrawn</li>
                            </ul>
                            <p>
                                Retention periods may be extended if required by law.
                            </p>
                        </section>

                        <section id="data-security">
                            <h2 className="text-2xl font-bold text-white mb-4">9. Data Security Measures</h2>
                            <p className="mb-4">
                                We implement reasonable and appropriate safeguards, including:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Secure servers and controlled access</li>
                                <li>Encryption where applicable</li>
                                <li>Restricted access to personal and design data</li>
                                <li>Regular system monitoring</li>
                            </ul>
                            <p>
                                Despite these measures, no system can guarantee absolute security.
                            </p>
                        </section>

                        <section id="shipping-disclaimer">
                            <h2 className="text-2xl font-bold text-white mb-4">10. Shipping & Delivery Disclaimer</h2>
                            <p className="mb-4">
                                VAELINSA ensures products are properly packed and dispatched through third-party logistics providers.
                            </p>
                            <p className="mb-4">
                                Once the product is handed over to the delivery partner, the risk of damage during transit lies with the carrier.
                            </p>
                            <p className="mb-4">
                                VAELINSA does not accept responsibility for physical damage caused during shipping or delivery.
                            </p>
                            <p>
                                Any claims related to transit damage must be raised directly with the respective delivery service provider.
                            </p>
                        </section>

                        <section id="your-rights">
                            <h2 className="text-2xl font-bold text-white mb-4">11. Your Rights</h2>

                            <h3 id="gdpr-rights" className="text-xl font-semibold text-white mb-3">11.1 GDPR Rights</h3>
                            <p className="mb-4">You have the right to:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request data deletion</li>
                                <li>Restrict or object to processing</li>
                                <li>Data portability</li>
                                <li>Withdraw consent at any time</li>
                            </ul>

                            <h3 id="indian-rights" className="text-xl font-semibold text-white mb-3 mt-6">11.2 Rights Under Indian Law</h3>
                            <p className="mb-4">You may:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Review personal information provided</li>
                                <li>Request corrections</li>
                                <li>Withdraw consent (subject to contractual obligations)</li>
                            </ul>
                            <p>
                                Requests can be sent to <a href="mailto:sales@vaelinsa.com" className="text-blue-400 hover:text-blue-300">sales@vaelinsa.com</a>.
                            </p>
                        </section>

                        <section id="cookies">
                            <h2 className="text-2xl font-bold text-white mb-4">12. Cookies and Tracking Technologies</h2>
                            <p className="mb-4">
                                We use cookies for:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Essential website functionality</li>
                                <li>Performance analytics</li>
                                <li>User preferences</li>
                            </ul>
                            <p>
                                Cookies can be managed through browser settings. Disabling cookies may affect functionality.
                            </p>
                        </section>

                        <section id="children-privacy">
                            <h2 className="text-2xl font-bold text-white mb-4">13. Children's Privacy</h2>
                            <p>
                                Our services are not intended for individuals under 18 years of age. We do not knowingly collect data from minors.
                            </p>
                        </section>

                        <section id="international-transfers">
                            <h2 className="text-2xl font-bold text-white mb-4">14. International Data Transfers</h2>
                            <p>
                                Where applicable, data may be processed or stored outside India or the EU with appropriate legal safeguards in place.
                            </p>
                        </section>

                        <section id="policy-updates">
                            <h2 className="text-2xl font-bold text-white mb-4">15. Policy Updates</h2>
                            <p>
                                This Privacy Policy may be updated periodically. Changes will be posted on this page with a revised "Last Updated" date.
                            </p>
                        </section>

                        <section id="contact">
                            <h2 className="text-2xl font-bold text-white mb-4">16. Contact Information</h2>
                            <p className="mb-4">
                                For privacy-related questions or requests:
                            </p>
                            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                                <p className="mb-2"><strong className="text-white">VAELINSA</strong></p>
                                <p className="mb-2">📧 Email: <a href="mailto:sales@vaelinsa.com" className="text-blue-400 hover:text-blue-300">sales@vaelinsa.com</a></p>
                                <p>🌐 Website: <a href="https://vaelinsa.com" className="text-blue-400 hover:text-blue-300">www.vaelinsa.com</a></p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
