import React from "react";
import dynamic from "next/dynamic";
import { Metadata } from 'next';

// Components
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import RightClickPreventer from "@/components/RightClickPreventer";

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

const Services = dynamic(() => import("@/components/Services"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-slate-900/10" />,
});
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"));
const Industries = dynamic(() => import("@/components/Industries"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const CTA = dynamic(() => import("@/components/CTA"));
const PopularParts = dynamic(() => import("@/components/PopularParts"));
const ProjectsSection = dynamic(() => import("@/components/ProjectsSection"));
const BlogSection = dynamic(() => import("@/components/BlogSection"));

export default async function Home() {
  const settings = await getSettings();

  // Data Fetching
  const [homeData, servicesContent, industriesContent, whyChooseUsContent, testimonialsContent, allProducts, allTestimonials, allProjects, allBlogs] = await Promise.all([
    getPageContent('home'),
    getPageContent('services'),
    getPageContent('industries'),
    getPageContent('why-choose-us'),
    getPageContent('testimonials'),
    getProducts(),
    getTestimonials(),
    getProjects(),
    getBlogs()
  ]);

  const popularParts = allProducts.filter(p => p.isPopular).slice(0, 3);

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
