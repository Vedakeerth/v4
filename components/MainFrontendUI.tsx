"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import BackgroundGrid from "@/components/BackgroundGrid";
import CustomCursor from "@/components/CustomCursor";
import ScrollToTop from "@/components/ScrollToTop";
import Preloader from "@/components/Preloader";
import AnnouncementBar from "@/components/AnnouncementBar";
import { cn } from "@/lib/utils";

interface MainFrontendUIProps {
    children: React.ReactNode;
    navLinks?: any;
    ctaData?: any;
}

export default function MainFrontendUI({ children, navLinks, ctaData }: MainFrontendUIProps) {
    const pathname = usePathname();

    // Check if current path is an admin page or secure portal
    const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/secure-management-portal");

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <>
            <AnnouncementBar />
            <Preloader />
            <Navbar navLinks={navLinks} ctaData={ctaData} />
            <CartDrawer />
            <BackgroundGrid />
            <CustomCursor />
            <div className={cn(
                "transition-all duration-300",
                isAdminPage ? "pt-0" : (pathname === "/" || pathname === "/gallery" || pathname === "/services" || pathname === "/features" || pathname === "/blog" || pathname === "/contact" || pathname === "/index.html" || pathname === "" ? "pt-[120px]" : "pt-0")
            )}>
                {children}
            </div>
            <ScrollToTop />
        </>
    );
}
