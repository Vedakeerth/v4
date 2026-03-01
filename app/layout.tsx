import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import CustomCursor from "@/components/CustomCursor";
import BackgroundGrid from "@/components/BackgroundGrid";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import FaviconSwitcher from "@/components/FaviconSwitcher";
import Preloader from "@/components/Preloader";
import { OrganizationSchema, LocalBusinessSchema, ServiceSchema, WebSiteSchema } from "@/components/StructuredData";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { getPageContent } from "@/lib/content";
import { Providers } from "@/components/Providers";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  // ... metadata content
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navContent = await getPageContent('navigation');
  const navLinks = navContent?.navLinks;
  const ctaData = navContent?.cta;

  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={cn(inter.variable, "font-sans bg-background text-foreground min-h-screen")}>
        <Providers>
          <CartProvider>
            <Preloader />
            <FaviconSwitcher />
            <OrganizationSchema />
            <LocalBusinessSchema />
            <ServiceSchema />
            <WebSiteSchema />
            <Navbar navLinks={navLinks} ctaData={ctaData} />
            <CartDrawer />
            <BackgroundGrid />
            <CustomCursor />
            {children}
            <ScrollToTop />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
