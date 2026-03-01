import React from "react";
import Industries from "@/components/Industries";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries We Serve - Medical, Industrial, Startups & R&D",
  description: "VAELINSA serves diverse industries including Medical & Dental, Industrial Jigs, Startups & MVP, and R&D Labs. Custom 3D printing solutions for your industry.",
  keywords: ["medical 3D printing", "dental 3D printing", "industrial jigs", "startup prototyping", "R&D 3D printing", "industry solutions"],
  openGraph: {
    title: "Industries We Serve | VAELINSA",
    description: "VAELINSA serves diverse industries including Medical & Dental, Industrial Jigs, Startups & MVP, and R&D Labs.",
    type: "website",
  },
};

import { getPageContent } from "@/lib/content";

export default async function IndustriesPage() {
  const industriesContent = await getPageContent('industries');

  return (
    <main className="min-h-screen bg-slate-950 pt-24">
      <Industries content={industriesContent} />
      <Footer />
    </main>
  );
}
