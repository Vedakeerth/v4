import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | VAELINSA",
  description: "Admin dashboard for managing gallery products",
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
