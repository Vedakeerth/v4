import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Portal | VAELINSA",
  description: "Secure management portal",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function SecurePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
