"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import BackgroundGrid from "@/components/BackgroundGrid";
import CustomCursor from "@/components/CustomCursor";
import ScrollToTop from "@/components/ScrollToTop";
import Preloader from "@/components/Preloader";
import AnnouncementBar from "@/components/AnnouncementBar";

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
            {children}
            <ScrollToTop />
        </>
    );
}
