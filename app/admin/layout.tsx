import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | VAELINSA",
  description: "Admin dashboard for managing gallery products",
  icons: {
    icon: [
      { url: "/images/favicon-wing.png", media: "(prefers-color-scheme: dark)" },
      { url: "/images/favicon-wing-1.png", media: "(prefers-color-scheme: light)" },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
