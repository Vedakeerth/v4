import React from "react";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Printing Services - FDM, SLA, SLS & Product Design",
  description: "Comprehensive 3D printing services including FDM, SLA, SLS printing, product design, and rapid prototyping. Engineering-grade additive manufacturing for industrial applications.",
  keywords: ["FDM printing", "SLA printing", "SLS printing", "product design", "rapid prototyping", "3D printing services", "additive manufacturing"],
  openGraph: {
    title: "3D Printing Services | VAELINSA",
    description: "Comprehensive 3D printing services including FDM, SLA, SLS printing, product design, and rapid prototyping.",
    type: "website",
  },
};

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
