import React from "react";
import dynamic from "next/dynamic";
import { Metadata } from 'next';

// Components
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyChooseUs from "@/components/WhyChooseUs";
import Industries from "@/components/Industries";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PopularParts from "@/components/PopularParts";
import RightClickPreventer from "@/components/RightClickPreventer";
import ProjectsSection from "@/components/ProjectsSection";
import BlogSection from "@/components/BlogSection";

// Data
import { getPageContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import { getTestimonials } from "@/lib/testimonials";
import { getSEOData } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getProjects } from "@/lib/projects";
import { getBlogs } from "@/lib/blogs";

export const revalidate = 0; // Ensure dynamic rendering for real-time updates

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSEOData();
  const seo = seoData.home;
  return {
    title: seo?.title || "VAELINSA",
    description: seo?.description,
    keywords: seo?.keywords,
  };
}

const ProductShowcase = dynamic(() => import("@/components/ProductShowcase"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-slate-900/50" />,
});

export default async function Home() {
  const settings = await getSettings();

  // Data Fetching
  const homeData = await getPageContent('home');
  const servicesContent = await getPageContent('services');
  const industriesContent = await getPageContent('industries');
  const whyChooseUsContent = await getPageContent('why-choose-us');
  const testimonialsContent = await getPageContent('testimonials');

  const allProducts = await getProducts();
  const popularParts = allProducts.filter(p => p.isPopular).slice(0, 3);
  const allTestimonials = await getTestimonials();
  const allProjects = await getProjects();
  const allBlogs = await getBlogs();

  return (
    <main className="min-h-screen bg-slate-950 selection:bg-blue-500/30 selection:text-blue-100 flex flex-col">
      <RightClickPreventer />

      {/* Hero with dynamic settings if applicable */}
      <Hero content={{ ...homeData?.hero, title: settings.heroTitle || homeData?.hero?.title, subtitle: settings.heroSubtitle || homeData?.hero?.subtitle }} />

      <Services content={servicesContent} />

      <PopularParts
        header={homeData?.popularParts}
        parts={popularParts}
      />

      <WhyChooseUs content={whyChooseUsContent} />

      {/* Projects Section - Controlled by Settings */}
      {settings.showProjects && (
        <ProjectsSection projects={allProjects} />
      )}

      {settings.showMachinery && (
        <ProductShowcase
          header={homeData?.productShowcase}
          categories={homeData?.productShowcase?.categories}
          products={allProducts}
          delay={settings.machineryDelay}
        />
      )}

      <Industries content={industriesContent} />

      {/* Testimonials - Controlled by Settings */}
      {settings.showTestimonials && (
        <Testimonials
          header={testimonialsContent?.header}
          testimonials={allTestimonials}
        />
      )}

      {/* Blog Section - Controlled by Settings */}
      {settings.showBlog && (
        <BlogSection blogs={allBlogs} />
      )}

      <CTA content={homeData?.ctaSection} />
      <Footer />
    </main>
  );
}
