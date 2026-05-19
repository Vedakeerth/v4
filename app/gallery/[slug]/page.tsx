import React from "react";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/content";
import { getProducts, getProductBySeoSlug } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import type { Metadata } from "next";
import { createSeoSlug } from "@/lib/seo-utils";
import { ProductSchema, BreadcrumbSchema } from "@/components/StructuredData";

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
            <main className="min-h-screen bg-white dark:bg-slate-950 pt-32 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800">
                    <X className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Component Not Found</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mb-10 text-lg">
                    The engineering part you are looking for does not exist in our current catalogue or has been relocated.
                </p>
                <Link href="/gallery" className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/20">
                    <ArrowLeft size={20} /> Return to Gallery
                </Link>
            </main>
        );
    }

    const allProducts = await getProducts();
    let similarProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id);

    // If less than 4 similar products, fill with other products
    if (similarProducts.length < 4) {
        const others = allProducts
            .filter(p => p.category !== product.category && p.id !== product.id)
            .sort(() => 0.5 - Math.random()) // Randomize fallback
            .slice(0, 4 - similarProducts.length);
        similarProducts = [...similarProducts, ...others];
    } else {
        similarProducts = similarProducts.slice(0, 4);
    }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
      <ProductSchema product={product} />
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: "Gallery", item: "/gallery" },
          { name: product.name, item: `/gallery/${slug}` }
        ]}
      />
      <ProductDetailClient
        product={product}
        similarProducts={similarProducts}
        pageData={pageData}
      />
      <Footer />
    </main>
  );
}
