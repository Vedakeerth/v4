"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import BackgroundGrid from "@/components/BackgroundGrid";
import CustomCursor from "@/components/CustomCursor";
import ScrollToTop from "@/components/ScrollToTop";
import Preloader from "@/components/Preloader";
import NewsTicker from "@/components/NewsTicker";
import { cn } from "@/lib/utils";

interface MainFrontendUIProps {
    children: React.ReactNode;
    navLinks?: any;
    ctaData?: any;
}

export default function MainFrontendUI({ children, navLinks, ctaData }: MainFrontendUIProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Aggressive detection for admin and secure portal routes
    const isPathMatch = (path: string) => {
        if (!pathname) return false;
        const normalizedPath = pathname.toLowerCase();
        return normalizedPath.includes("/admin") || 
               normalizedPath.includes("/secure-management-portal") || 
               normalizedPath.includes("/secure-admin");
    };

    const isAdminPage = isPathMatch(pathname || "");
    const isCheckout = pathname === "/checkout";

    // If it's an admin page, return ONLY the children to prevent double scrolling and UI leakage
    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <>
            {!isCheckout && <NewsTicker />}
            <Preloader />
            <Navbar />
            <CartDrawer />
            <BackgroundGrid />
            <CustomCursor />
            <div className={cn(
                "transition-all duration-300",
                isCheckout ? "pt-0" : "pt-[30px]"
            )}>
                {children}
            </div>
            <ScrollToTop />
        </>
    );
}
