import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "VAELINSA Privacy Policy - Learn how we collect, use, and protect your personal information when using our 3D printing services.",
  openGraph: {
    title: "Privacy Policy | VAELINSA",
    description: "Learn how we collect, use, and protect your personal information.",
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
