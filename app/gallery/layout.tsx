import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parts Gallery - 3D Printed Products",
  description: "Browse our collection of precision-engineered 3D printed parts and components. All items are manufactured using advanced 3D printing technology. Order custom parts via WhatsApp.",
  keywords: ["3D printed parts", "custom parts", "3D printing products", "engineering parts", "prototype parts", "VAELINSA gallery"],
  openGraph: {
    title: "Parts Gallery | VAELINSA",
    description: "Browse our collection of precision-engineered 3D printed parts and components.",
    type: "website",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
