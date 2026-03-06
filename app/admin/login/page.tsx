"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/secure-management-portal/login");
    }, [router]);

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-white animate-pulse">Redirecting to Secure Portal...</div>
        </main>
    );
}
