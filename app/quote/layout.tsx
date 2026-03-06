import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 3D Printing Quote Calculator",
  description: "Get an AI 3D printing quote by uploading your STL file. Calculate costs based on material, quality, and quantity. Fast, accurate pricing for FDM, SLA, and SLS printing.",
  keywords: ["3D printing quote", "STL file quote", "3D printing cost calculator", "AI quote", "3D printing price", "custom quote"],
  openGraph: {
    title: "AI 3D Printing Quote | VAELINSA",
    description: "Get an AI 3D printing quote by uploading your STL file. Calculate costs based on material and quality.",
    type: "website",
  },
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
