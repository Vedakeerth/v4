import React from "react";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params;
    const pageData = await getPageContent('product-detail');
    const allProducts = await getProducts();
    const product = allProducts.find(p => p.id === id);

    if (!product) {
        return (
            <main className="min-h-screen bg-slate-950 pt-32 px-4 flex flex-col items-center">
                <h1 className="text-2xl text-white mb-4">Product Not Found</h1>
                <Link href="/gallery" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Gallery
                </Link>
            </main>
        );
    }

    const similarProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <main className="min-h-screen bg-slate-950 pt-24">
            <ProductDetailClient
                product={product}
                similarProducts={similarProducts}
                pageData={pageData}
            />
            <Footer />
        </main>
    );
}
