import React from "react";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPageContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import GalleryGrid from "@/components/GalleryGrid";
import { getPageMetadata } from "@/lib/seo";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return await getPageMetadata('Gallery');
}

export default async function GalleryPage() {
    const pageData = await getPageContent('gallery');
    const allProducts = await getProducts();
    const products = allProducts;

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-20">
            <section className="pt-8 pb-16 bg-white dark:bg-slate-950 relative overflow-hidden z-40">
                <div className="dynamic-container">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
                            {pageData?.header.title}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-lg">
                            {pageData?.header.description}
                        </p>
                        <div className="h-1.5 w-20 bg-cyan-500 mx-auto mt-8 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                    </div>

                    <GalleryGrid parts={products} />
                </div>
            </section>

            {/* CTA Section for Custom Parts */}
            <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden border-t border-slate-900">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-indigo-900/20" />
                <div className="absolute inset-0 bg-white dark:bg-slate-950/90" />

                <div className="dynamic-container relative z-10 text-center">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                            {pageData?.cta.title}
                        </h2>
                        <p className="text-base md:text-xl text-slate-700 dark:text-slate-300 mb-10 max-w-2xl mx-auto items-center justify-center flex">
                            {pageData?.cta.description}
                        </p>
                        <Link href={pageData?.cta.buttonLink || "/quote"}>
                            <button className="inline-flex h-14 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-10 text-lg font-bold transition-all duration-200 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950">
                                {pageData?.cta.buttonText}
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
