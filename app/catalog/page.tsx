import React from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import CatalogGrid from "@/components/CatalogGrid";
import { getSEOData } from "@/lib/seo";
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const seoData = await getSEOData();
    const seo = seoData.catalog;
    return {
        title: seo?.title || "Catalog - VAELINSA",
        description: seo?.description,
        keywords: seo?.keywords,
    };
}

export default async function CatalogPage() {
    const pageData = await getPageContent('catalog');
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            <div className="dynamic-container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 uppercase tracking-tight">
                        {pageData?.header.title}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 text-lg">
                        {pageData?.header.description}
                    </p>
                    <div className="h-1.5 w-20 bg-cyan-500 mx-auto rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                </div>

                <CatalogGrid products={products} />
            </div>
            <Footer />
        </main>
    );
}
