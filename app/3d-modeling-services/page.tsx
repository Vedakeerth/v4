import React from "react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";
import KeywordLandingPage from "@/components/KeywordLandingPage";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('3D-Modeling-Services', '/3d-modeling-services', {
    title: "Professional 3D Modeling Services | CAD Engineering & Design | VAELINSA",
    description: "Get expert custom 3D modeling and CAD design services in India. Reverse engineering, product design, and 3D printing optimization by certified engineers.",
    keywords: "3d modeling services, custom cad design, mechanical design engineering, reverse engineering, solidworks modeling india"
  });
}

export default function ThreeDModelingServicesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: "3D Modeling Services", item: "/3d-modeling-services" }
        ]}
      />
      <KeywordLandingPage
        keyword="3d modeling services"
        title="Professional 3D Modeling & CAD Design Services"
        subtitle="Transform your ideas, napkin sketches, or physical objects into industry-standard, manufacture-ready 3D CAD files."
        description="VAELINSA's design engineering team specializes in professional 3D CAD modeling, product styling, reverse engineering, and Design for Additive Manufacturing (DFAM) optimization. We work with certified SolidWorks and Fusion 360 designers to provide clean, parametric, and editable 3D models tailored to injection molding, CNC machining, or 3D printing."
        features={[
          {
            title: "Parametric Modeling",
            desc: "Get fully editable, dimensionally accurate SolidWorks/STEP files ready for modification or direct manufacturing.",
            icon: "cpu"
          },
          {
            title: "Reverse Engineering",
            desc: "Convert physical components or broken machine gears into digital CAD models for replication, using precision calipers and scanners.",
            icon: "compass"
          },
          {
            title: "DFAM Optimization",
            desc: "We adjust draft angles, wall thicknesses, and structural features specifically to optimize print quality and minimize filament consumption.",
            icon: "printer"
          }
        ]}
        bullets={[
          "Parametric SolidWorks, Fusion 360, and STEP exports",
          "Reverse engineering of broken or discontinued parts",
          "Exploded assembly diagrams and structural checks",
          "Optimization for FDM, SLA, and injection molding",
          "Full confidentiality and NDA protected workflow",
          "Unlimited adjustments during active iteration runs"
        ]}
        paragraphs={[
          "Having a great product idea is only the first step. Translating that concept into a clean, functionally sound CAD model requires precision, domain knowledge, and specialized tools. Our team acts as your dedicated CAD office on demand.",
          "We analyze tolerance clearances, material shrinkage variables, and structural stress points to ensure that your final physical prints behave precisely as intended under physical load. Contact us with your design requirements!"
        ]}
      />
    </>
  );
}
