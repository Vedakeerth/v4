import React from "react";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPageContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import GalleryGrid from "@/components/GalleryGrid";

export default async function GalleryPage() {
    const pageData = await getPageContent('gallery');
    const allProducts = await getProducts();
    const products = allProducts;

    return (
        <main className="min-h-screen bg-slate-950 pt-24">
            <section className="py-16 bg-slate-950 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {pageData?.header.title}
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                            {pageData?.header.description}
                        </p>
                        <div className="h-1 w-20 bg-cyan-500 mx-auto mt-6 rounded-full" />
                    </div>

                    <GalleryGrid parts={products} />
                </div>
            </section>

            {/* CTA Section for Custom Parts */}
            <section className="py-20 bg-slate-950 relative overflow-hidden border-t border-slate-800">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-indigo-900/20" />
                <div className="absolute inset-0 bg-slate-950/90" />

                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                            {pageData?.cta.title}
                        </h2>
                        <p className="text-sm md:text-base text-slate-300 mb-8 max-w-2xl mx-auto">
                            {pageData?.cta.description}
                        </p>
                        <Link href={pageData?.cta.buttonLink || "/quote"}>
                            <button className="inline-flex h-12 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 text-sm font-bold transition-all duration-200 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950">
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
