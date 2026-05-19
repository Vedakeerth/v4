import React from "react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";
import KeywordLandingPage from "@/components/KeywordLandingPage";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('3D-Printing-Coimbatore', '/3d-printing-coimbatore', {
    title: "3D Printing Services in Coimbatore | Rapid Prototyping Hub | VAELINSA",
    description: "Get premium industrial FDM, SLA, and custom 3D printing in Coimbatore, Tamil Nadu. Fast local deliveries, CAD engineering, and functional prototype design.",
    keywords: "3d printing coimbatore, 3d printing services in coimbatore, rapid prototyping coimbatore, local 3d printing lab tamil nadu"
  });
}

export default function ThreeDPrintingCoimbatorePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: "3D Printing Coimbatore", item: "/3d-printing-coimbatore" }
        ]}
      />
      <KeywordLandingPage
        keyword="3d printing coimbatore"
        title="Industrial 3D Printing & Design Services in Coimbatore"
        subtitle="Coimbatore's premium rapid prototyping lab. High-precision FDM, resin printing, and CAD modeling tailored for industrial manufacturing."
        description="VAELINSA is proud to support Coimbatore's engineering community, dynamic hardware startups, and textile-agricultural industrial hubs. We deliver rapid, reliable, and highly detailed 3D printed models, functional components, replacement gears, and industrial fixtures locally with express delivery."
        features={[
          {
            title: "Local Rapid Delivery",
            desc: "Benefit from quick shipping and pickup services across Coimbatore (Thudiyalur, Gandhipuram, Guindy, Peelamedu, etc.).",
            icon: "zap"
          },
          {
            title: "Engineering Solutions",
            desc: "We specialize in custom gears, brackets, custom electronic enclosures, and textile machinery components.",
            icon: "cpu"
          },
          {
            title: "Cost-Effective Prints",
            desc: "Premium grade prints at highly competitive local pricing, offering students and manufacturers unmatched prototyping value.",
            icon: "printer"
          }
        ]}
        bullets={[
          "Express shipping across Coimbatore",
          "Dedicated FDM filament arrays (PLA, PETG, ABS)",
          "High-detail SLA jewelry and dental resins",
          "Reverse engineering of broken machine parts",
          "Custom mechanical assemblies design support",
          "Flexible, low-cost student prototyping options"
        ]}
        paragraphs={[
          "As Coimbatore continues to thrive as an engineering and manufacturing powerhouse, having access to an agile, industrial-grade rapid prototyping service is essential.",
          "We offer direct support for mechanical assemblies, reverse engineering, and low-volume production runs. Upload your files online or contact our local engineering representatives to kickstart your next project!"
        ]}
      />
    </>
  );
}
