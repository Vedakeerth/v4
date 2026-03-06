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
        <main className="min-h-screen bg-slate-950 pt-24">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {pageData?.header.title}
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                        {pageData?.header.description}
                    </p>
                </div>

                <CatalogGrid products={products} />
            </div>
            <Footer />
        </main>
    );
}
