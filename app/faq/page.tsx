import React from "react";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('FAQ', '/faq', {
    title: "Frequently Asked Questions (FAQ) | VAELINSA 3D Printing",
    description: "Get answers to all your 3D printing, material, design, pricing, shipping, and turnaround questions at VAELINSA.",
  });
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-20">
      <FAQSection />

      {/* Still have questions? Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 to-blue-900/10 opacity-30" />
        <div className="dynamic-container relative z-10 text-center px-4">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 text-cyan-400 rounded-3xl mb-6 border border-cyan-500/20">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
              Still Have Questions?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-base md:text-lg leading-relaxed">
              If you couldn't find the answers you were looking for, please don't hesitate to reach out. Our engineering support team is available Mon-Sat to assist you.
            </p>
            <Link href="/contact">
              <button className="inline-flex h-14 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-10 text-base font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] focus:outline-none focus:ring-2 focus:ring-cyan-500">
                Contact Our Engineers
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
