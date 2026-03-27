"use client";

import { useAdminAuth } from "@/lib/adminAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      } else if (pathname === "/admin/login") {
        router.push("/admin/dashboard");
      }
    }
  }, [user, isAdmin, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white animate-pulse">Verifying Admin Access...</div>
      </div>
    );
  }

  // Allow children to render if user is admin OR if we're on the login page
  if (isAdmin || pathname === "/admin/login") {
    return <>{children}</>;
  }

  return null;
}
