import React from "react";
import WhyChooseUs from "@/components/WhyChooseUs";
import Products from "@/components/Products";
import ProjectsSection from "@/components/ProjectsSection";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Why Choose VAELINSA - Engineering Precision & Quality",
  description: "Built for engineers, by engineers. Discover why VAELINSA is the trusted choice for precision 3D printing, fast turnaround, quality assurance, and scalable production.",
  keywords: ["engineering precision", "quality assurance", "fast turnaround", "scalable production", "3D printing quality", "precision manufacturing"],
  openGraph: {
    title: "Why Choose VAELINSA | Engineering Precision",
    description: "Built for engineers, by engineers. Discover why VAELINSA is the trusted choice for precision 3D printing.",
    type: "website",
  },
};

import { getPageContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import { getProjects } from "@/lib/projects";
import { getSettings } from "@/lib/settings";

export default async function ProductsPage() {
  const whyChooseUsContent = await getPageContent('why-choose-us');
  const products = await getProducts();
  const projects = await getProjects();
  const settings = await getSettings();

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-20">
      <WhyChooseUs content={whyChooseUsContent} />

      {settings.showProjectsOnProducts && (
        <ProjectsSection projects={projects} />
      )}

      {settings.showProductsOnProducts && (
        <Products products={products} />
      )}

      <Footer />
    </main>
  );
}
