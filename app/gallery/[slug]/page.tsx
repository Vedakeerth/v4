import React from "react";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/content";
import { getProducts, getProductBySeoSlug } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { createSeoSlug } from "@/lib/seo-utils";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// SSG: Static generation for gallery items
export async function generateStaticParams() {
    const products = await getProducts();
    return products.map((product) => ({
        slug: createSeoSlug(product.name, product.id),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySeoSlug(slug);
    if (!product) return {};

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com';
    const canonicalUrl = `${baseUrl}/gallery/${slug}`;

    return {
        title: `${product.name} | VAELINSA Gallery`,
        description: product.description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: product.name,
            description: product.description,
            images: [product.image],
            type: "website",
        }
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProductBySeoSlug(slug);
    const pageData = await getPageContent('product-detail');

    if (!product) {
        return (
            <main className="min-h-screen bg-slate-950 pt-32 px-4 flex flex-col items-center">
                <h1 className="text-2xl text-white mb-4 uppercase font-black">Part Not Found</h1>
                <Link href="/gallery" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-bold">
                    <ArrowLeft size={20} /> Back to Gallery
                </Link>
            </main>
        );
    }

    const allProducts = await getProducts();
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
