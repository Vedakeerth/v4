import type { Metadata, Viewport } from "next";
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
import CookieConsent from "@/components/CookieConsent";
import MainFrontendUI from "@/components/MainFrontendUI";
import { SpeedInsights } from "@vercel/speed-insights/next"


import { getSEOData, getPageMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata('Home');
  return {
    ...metadata,
    icons: {
      icon: "/images/favicon-wing.png",
      shortcut: "/images/favicon-wing.png",
      apple: "/images/favicon-wing.png",
    },
  };
}

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
            <FaviconSwitcher />
            <OrganizationSchema />
            <LocalBusinessSchema />
            <ServiceSchema />
            <WebSiteSchema />
            <MainFrontendUI navLinks={navLinks} ctaData={ctaData}>
              {children}
            </MainFrontendUI>
            <CookieConsent />
            <SpeedInsights />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
