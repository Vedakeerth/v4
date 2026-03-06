import React from "react";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

import { getPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('Services');
}

import { getPageContent } from "@/lib/content";

export default async function ServicesPage() {
  const servicesContent = await getPageContent('services');

  return (
    <main className="min-h-screen bg-slate-950 pt-24">
      <Services content={servicesContent} />
      <Footer />
    </main>
  );
}
