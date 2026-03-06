import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Portal | VAELINSA",
  description: "Secure management portal",
  icons: {
    icon: [
      { url: "/images/favicon-wing.png", media: "(prefers-color-scheme: dark)" },
      { url: "/images/favicon-wing-1.png", media: "(prefers-color-scheme: light)" },
    ],
  },
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
