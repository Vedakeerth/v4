import React from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import PolicySidebar from "@/components/PolicySidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payment Policy | VAELINSA",
    description: "VAELINSA's Payment Policy — accepted payment methods, security, payment flow, and Cashfree payment gateway details.",
};

const paymentSections = [
    { id: "overview", title: "1. Overview" },
    { id: "accepted-methods", title: "2. Accepted Payment Methods" },
    { id: "payment-gateway", title: "3. Payment Gateway" },
    { id: "security", title: "4. Payment Security" },
    { id: "order-confirmation", title: "5. Order Confirmation" },
    { id: "payment-failure", title: "6. Payment Failure" },
    { id: "refunds-payment", title: "7. Refunds via Payment Gateway" },
    { id: "fraud-prevention", title: "8. Fraud Prevention" },
    { id: "contact", title: "9. Contact Us" },
];

export default function PaymentPolicyPage() {
    const lastUpdated = "October 04, 2026";

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            <div className="dynamic-container py-12">
                <div className="mb-12">
                    <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-xs font-black uppercase tracking-widest mb-6 inline-flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Payment Policy</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Last updated: {lastUpdated}</p>
                    <div className="h-1 w-20 bg-cyan-500 mt-8 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <PolicySidebar sections={paymentSections} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 prose dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300">

                        <section id="overview">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">1. Overview</h2>
                            <p className="mb-4">
                                VAELINSA is committed to providing a secure, transparent, and seamless payment experience for all customers. This Payment Policy describes how we collect, process, and secure payments for all orders placed through our website at <Link href="/" className="text-cyan-400 hover:text-cyan-300">vaelinsa.com</Link>.
                            </p>
                            <p className="mb-4">
                                All prices displayed on our website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.
                            </p>
                        </section>

                        <section id="accepted-methods">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">2. Accepted Payment Methods</h2>
                            <p className="mb-4">
                                We accept the following payment methods via our secure payment gateway:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong className="text-slate-900 dark:text-white">UPI:</strong> Google Pay, PhonePe, Paytm, BHIM, and all UPI-enabled apps</li>
                                <li><strong className="text-slate-900 dark:text-white">Credit Cards:</strong> Visa, MasterCard, RuPay, American Express</li>
                                <li><strong className="text-slate-900 dark:text-white">Debit Cards:</strong> Visa, MasterCard, RuPay, Maestro</li>
                                <li><strong className="text-slate-900 dark:text-white">Net Banking:</strong> All major Indian banks supported</li>
                                <li><strong className="text-slate-900 dark:text-white">Wallets:</strong> Paytm Wallet, Amazon Pay, and other supported wallets</li>
                                <li><strong className="text-slate-900 dark:text-white">EMI:</strong> Available on select credit cards (subject to bank terms)</li>
                            </ul>
                        </section>

                        <section id="payment-gateway">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">3. Payment Gateway</h2>
                            <p className="mb-4">
                                All payments on the VAELINSA website are processed securely via <strong className="text-slate-900 dark:text-white">Cashfree Payments</strong> — a PCI DSS-compliant payment gateway regulated by the Reserve Bank of India (RBI).
                            </p>
                            <p className="mb-4">
                                When you proceed to checkout, you will be redirected to the Cashfree secure payment page to complete your transaction. VAELINSA does not store, access, or retain any of your card or banking credentials at any point during this process.
                            </p>
                            <p className="mb-4">
                                For more information about Cashfree Payments, visit: <a href="https://cashfree.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">cashfree.com</a>
                            </p>
                        </section>

                        <section id="security">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">4. Payment Security</h2>
                            <p className="mb-4">
                                VAELINSA takes payment security seriously:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>All transactions are encrypted using industry-standard <strong className="text-slate-900 dark:text-white">TLS/SSL encryption</strong>.</li>
                                <li>Our website operates on <strong className="text-slate-900 dark:text-white">HTTPS</strong> for end-to-end secure communication.</li>
                                <li>Payment processing is handled by <strong className="text-slate-900 dark:text-white">Cashfree Payments</strong>, which is PCI DSS Level 1 certified.</li>
                                <li>We never store your card number, CVV, or banking credentials on our servers.</li>
                                <li>All webhook communications from our payment gateway are verified using HMAC-SHA256 digital signatures.</li>
                            </ul>
                        </section>

                        <section id="order-confirmation">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">5. Order Confirmation</h2>
                            <p className="mb-4">
                                Once your payment is successfully completed:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>You will receive an <strong className="text-slate-900 dark:text-white">Order Confirmation Email</strong> with your order details and a unique Order ID.</li>
                                <li>Your order will be added to our production queue and processing will begin.</li>
                                <li>You can track your order status at any time via <Link href="/track-order" className="text-cyan-400 hover:text-cyan-300">vaelinsa.com/track-order</Link>.</li>
                            </ul>
                            <p className="mb-4 text-sm text-slate-500">
                                Note: Order confirmation is subject to successful payment verification. If payment verification is pending, your order will not enter production until confirmation is received.
                            </p>
                        </section>

                        <section id="payment-failure">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">6. Payment Failure</h2>
                            <p className="mb-4">
                                In the event of a payment failure:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Your order will remain in a <strong className="text-slate-900 dark:text-white">Pending</strong> state and will not be processed.</li>
                                <li>No amount will be charged for failed transactions. If an amount was debited by your bank, it will be automatically refunded within <strong className="text-slate-900 dark:text-white">5–7 business days</strong> as per your bank&apos;s policy.</li>
                                <li>You may retry payment at any time from your order page.</li>
                                <li>If the amount was debited but you did not receive an order confirmation, please contact us immediately at <a href="mailto:support@vaelinsa.com" className="text-cyan-400 hover:text-cyan-300">support@vaelinsa.com</a>.</li>
                            </ul>
                        </section>

                        <section id="refunds-payment">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">7. Refunds via Payment Gateway</h2>
                            <p className="mb-4">
                                Approved refunds are processed back to the original payment method used at the time of purchase:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong className="text-slate-900 dark:text-white">UPI / Wallet:</strong> 1–3 business days</li>
                                <li><strong className="text-slate-900 dark:text-white">Debit Card:</strong> 5–7 business days</li>
                                <li><strong className="text-slate-900 dark:text-white">Credit Card:</strong> 5–10 business days (depending on your card issuer)</li>
                                <li><strong className="text-slate-900 dark:text-white">Net Banking:</strong> 3–5 business days</li>
                            </ul>
                            <p className="mb-4">
                                Please refer to our <Link href="/refunds" className="text-cyan-400 hover:text-cyan-300">Refund & Cancellation Policy</Link> for full eligibility criteria before requesting a refund.
                            </p>
                        </section>

                        <section id="fraud-prevention">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">8. Fraud Prevention</h2>
                            <p className="mb-4">
                                To protect our customers and business from fraudulent activity:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>We reserve the right to cancel any order that appears suspicious or fraudulent.</li>
                                <li>Orders flagged by our payment gateway for high fraud risk may be subject to additional verification.</li>
                                <li>VAELINSA will never ask you to share your OTP, CVV, card number, or banking password via phone, email, or any other channel.</li>
                                <li>If you suspect unauthorized use of your payment details, please contact your bank immediately and notify us at <a href="mailto:support@vaelinsa.com" className="text-cyan-400 hover:text-cyan-300">support@vaelinsa.com</a>.</li>
                            </ul>
                        </section>

                        <section id="contact">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">9. Contact Us</h2>
                            <p className="mb-4">
                                For any payment-related queries, disputes, or concerns, please contact us:
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
