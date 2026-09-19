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
import { notFound } from "next/navigation";

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
        notFound();
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
