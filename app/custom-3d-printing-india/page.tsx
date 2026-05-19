import React from "react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";
import KeywordLandingPage from "@/components/KeywordLandingPage";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('Custom-3D-Printing-India', '/custom-3d-printing-india', {
    title: "Custom 3D Printing Services India | Online Additive Manufacturing | VAELINSA",
    description: "Get high-precision custom 3D printing services online in India. FDM and SLA resins starting at low prices. Upload STL/OBJ for an instant AI quotation.",
    keywords: "custom 3d printing india, online 3d printing service, cheap 3d printing india, FDM SLA resin prints india, VAELINSA 3d labs"
  });
}

export default function Custom3DPrintingIndiaPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: "Custom 3D Printing India", item: "/custom-3d-printing-india" }
        ]}
      />
      <KeywordLandingPage
        keyword="custom 3d printing india"
        title="Premium Online Custom 3D Printing Services in India"
        subtitle="Turn your digital designs and 3D models into functional physical components. Industrial quality, high precision, and fast delivery nationwide."
        description="VAELINSA is India's leading online custom 3D printing service bureau, bringing together cutting-edge industrial additive manufacturing technologies (FDM, SLA, SLS) and a team of expert engineers. We enable creators, students, and industrial enterprises to upload CAD files, receive dynamic pricing estimates, and order custom components with absolute simplicity."
        features={[
          {
            title: "FDM & SLA Printing",
            desc: "Choose between tough FDM filaments for structural parts or SLA resins for ultra-high-resolution detail.",
            icon: "printer"
          },
          {
            title: "Nationwide Shipping",
            desc: "Fast, reliable, and secure logistics delivering your custom prints safely across India, including Chennai, Mumbai, Bangalore, and Delhi.",
            icon: "zap"
          },
          {
            title: "Material Variety",
            desc: "Print in PLA, PETG, ABS, TPU, Carbon Fiber, standard resins, or flexible biocompatible engineering materials.",
            icon: "cpu"
          }
        ]}
        bullets={[
          "Instant dynamic AI pricing",
          "Dimensional tolerances down to ±0.1mm",
          "No minimum order quantity (MOQ)",
          "100% confidential CAD design file protection",
          "7-day manufacturing defect warranty",
          "Expert engineering consultation"
        ]}
        paragraphs={[
          "Whether you need a single custom aesthetic prototype for a college design project or small-batch custom enclosures for electronics manufacturing, our laboratory is optimized to deliver consistent print quality on demand.",
          "Our automated file verification process guarantees printability before production begins, eliminating manufacturing errors and saving critical project time. Get started by uploading your files today!"
        ]}
      />
    </>
  );
}
