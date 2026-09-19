import React from "react";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params;
    const pageData = await getPageContent('product-detail');
    const allProducts = await getProducts();
    const product = allProducts.find(p => p.id === id);

    if (!product) {
        notFound();
    }

    const similarProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            <ProductDetailClient
                product={product}
                similarProducts={similarProducts}
                pageData={pageData}
            />
            <Footer />
        </main>
    );
}
