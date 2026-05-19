import React from "react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";
import KeywordLandingPage from "@/components/KeywordLandingPage";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('Rapid-Prototyping-Services', '/rapid-prototyping-services', {
    title: "Rapid Prototyping Services India | Quick Turnaround 3D Printing | VAELINSA",
    description: "Accelerate your R&D cycles with quick turnaround rapid prototyping services in India. 24-hour express 3D printing for mechanical parts and electronic enclosures.",
    keywords: "rapid prototyping services india, quick turnaround 3d printing, functional prototypes, concept models design validation"
  });
}

export default function RapidPrototypingServicesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: "Rapid Prototyping Services", item: "/rapid-prototyping-services" }
        ]}
      />
      <KeywordLandingPage
        keyword="rapid prototyping services"
        title="Professional Rapid Prototyping Services in India"
        subtitle="Accelerate your product development cycles. Get functional physical prototypes in your hands in under 24 to 48 hours."
        description="VAELINSA's rapid prototyping service provides designers, engineers, startups, and R&D divisions with an agile path to materialize, test, and iterate product concepts. We eliminate expensive machine overhead and lead times, giving you premium FDM, SLA, and multi-component print options on demand."
        features={[
          {
            title: "24-Hour Turnaround",
            desc: "Need it yesterday? Choose our express production queue to print and ship functional prototypes within 24 hours.",
            icon: "zap"
          },
          {
            title: "Design Validation",
            desc: "Verify form, fit, clearance, and mechanical function before locking in mass injection molding budgets.",
            icon: "compass"
          },
          {
            title: "Multi-Material Options",
            desc: "Test prototypes in rigid plastics, highly flexible TPU elastomers, clear resins, or high-detail jewelry molds.",
            icon: "printer"
          }
        ]}
        bullets={[
          "Express 24-hour turnaround option",
          "Form and fit-clearance assembly checking",
          "Low cost iterations starting under ₹200",
          "Broad material range to match end-product traits",
          "Secure upload and strictly enforced NDA policies",
          "Comprehensive Design for Additive Manufacturing feedback"
        ]}
        paragraphs={[
          "In modern engineering, the speed of iteration is the ultimate competitive advantage. Our prototyping lab helps you bypass machining bottlenecks and discover design flaws instantly via tangible, tactile physical testing.",
          "Our engineering specialists actively review your design files for draft angles, minimum walls, and overhangs, advising on adjustments to optimize print quality and reduce cost. Start iterating today!"
        ]}
      />
    </>
  );
}
