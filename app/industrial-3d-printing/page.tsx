import React from "react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";
import KeywordLandingPage from "@/components/KeywordLandingPage";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('Industrial-3D-Printing', '/industrial-3d-printing', {
    title: "Industrial 3D Printing & Batch Manufacturing | VAELINSA",
    description: "Get high-durability, end-use functional components and small batch additive manufacturing. Professional FDM, SLS, and Carbon Fiber prints in India.",
    keywords: "industrial 3d printing, batch manufacturing india, end use functional prototypes, SLS nylon printing, carbon fiber 3d printing"
  });
}

export default function Industrial3DPrintingPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: "Industrial 3D Printing", item: "/industrial-3d-printing" }
        ]}
      />
      <KeywordLandingPage
        keyword="industrial 3d printing"
        title="Industrial 3D Printing & Additive Manufacturing Services"
        subtitle="Scale your production with functional, mechanical, and aerospace-grade additive manufacturing. Professional materials and certified quality."
        description="VAELINSA's industrial 3D printing division is dedicated to engineering functional end-use parts, structural jigs, high-durability fixtures, and tooling. We utilize state-of-the-art print arrays running advanced polymer composites (Nylon, Carbon Fiber, ASA, Polycarbonate) to provide robust alternatives to injection molding for small-batch runs."
        features={[
          {
            title: "Functional Assemblies",
            desc: "Develop strong, durable structural frames, mounting brackets, and machine parts optimized for load-bearing applications.",
            icon: "cpu"
          },
          {
            title: "High-Performance Materials",
            desc: "Print with aerospace-grade Carbon Fiber, flame-retardant filaments, high-temperature polymers, and chemical-resistant ASA.",
            icon: "printer"
          },
          {
            title: "Small-Batch Scale",
            desc: "Bridge the gap between design validation and high-volume injection molding with cost-effective production runs from 10 to 1,000+ units.",
            icon: "compass"
          }
        ]}
        bullets={[
          "Tensile strength matching injection-molded plastics",
          "Advanced composite filaments (PETG-CF, Nylon-CF)",
          "Chemical, UV, and high-temperature resistance capabilities",
          "Comprehensive mechanical stress and printability testing",
          "Post-processing, sanding, inserts, and mechanical detailing",
          "Detailed quality inspection records"
        ]}
        paragraphs={[
          "In today's fast-moving industrial landscapes, waiting weeks for traditional tooling can completely stall product releases. Our rapid batch additive solutions cut timelines from months to days, drastically reducing production overhead.",
          "We offer fully customizable structural parameters including infill geometry, shell thicknesses, and composite layers, tailored specifically to handle your project's physical and thermal requirements."
        ]}
      />
    </>
  );
}
