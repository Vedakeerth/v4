import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "VAELINSA Terms of Service - Read our terms and conditions for using our 3D printing and additive manufacturing services.",
  openGraph: {
    title: "Terms of Service | VAELINSA",
    description: "Read our terms and conditions for using our 3D printing services.",
    type: "website",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
