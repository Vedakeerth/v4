"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutGrid, Package, MessageSquare, BookOpen, Globe, Share2, Settings, Briefcase, FileText, Ticket, ShoppingBag, Megaphone, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

// Import Tabs
import ProductsTab from "@/components/admin-dashboard-tabs/ProductsTab";
import TestimonialsTab from "@/components/admin-dashboard-tabs/TestimonialsTab";
import CatalogsTab from "@/components/admin-dashboard-tabs/CatalogsTab";
import BlogsTab from "@/components/admin-dashboard-tabs/BlogsTab";
import SEOTab from "@/components/admin-dashboard-tabs/SEOTab";
import SocialsTab from "@/components/admin-dashboard-tabs/SocialsTab";
import ProjectsTab from "@/components/admin-dashboard-tabs/ProjectsTab";
import SettingsTab from "@/components/admin-dashboard-tabs/SettingsTab";
import IndustriesTab from "@/components/admin-dashboard-tabs/IndustriesTab";
import FeaturesTab from "@/components/admin-dashboard-tabs/FeaturesTab";
import CouponsTab from "@/components/admin-dashboard-tabs/CouponsTab";
import OrdersTab from "@/components/admin-dashboard-tabs/OrdersTab";
import UsersTab from "@/components/admin-dashboard-tabs/UsersTab";
import AnnouncementsTab from "@/components/admin-dashboard-tabs/AnnouncementsTab";
import CategoriesTab from "@/components/admin-dashboard-tabs/CategoriesTab";
import QuoteSettingsTab from "@/components/admin-dashboard-tabs/QuoteSettingsTab";

import { getAdminEmails } from "@/lib/adminConfig";

export default function SecureAdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Valid tabs type
    type TabType = "products" | "projects" | "testimonials" | "catalogs" | "blogs" | "seo" | "socials" | "settings" | "features" | "industries" | "coupons" | "orders" | "users" | "announcements" | "categories" | "quote-settings";

    const [activeTab, setActiveTab] = useState<TabType>("orders");
    const tabsContainerRef = React.useRef<HTMLDivElement>(null);

    const scrollTabs = (direction: "left" | "right") => {
        if (tabsContainerRef.current) {
            const scrollAmount = 200;
            tabsContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    // Firebase Auth State Listener for strict protection
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                // Not logged in to Firebase
                router.push("/secure-management-portal/login");
            } else {
                const adminEmails = getAdminEmails();
                if (!firebaseUser.email?.toLowerCase() || !adminEmails.includes(firebaseUser.email.toLowerCase())) {
                    // Logged in but not the admin
                    console.error("Access Denied: Restricted to admin only.");
                    await firebaseSignOut(auth);
                    await signOut({ redirect: false });
                    router.push("/secure-management-portal/login?error=AccessDenied");
                } else {
                    // Authorized
                    setUser(firebaseUser);
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await firebaseSignOut(auth);
        await signOut({ callbackUrl: "/secure-management-portal/login" });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
                <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Verifying Admin Access...</p>
            </div>
        );
    }

    const tabs = [
        { id: "orders", label: "Orders", icon: ShoppingBag },
        { id: "categories", label: "Categories", icon: LayoutGrid },
        { id: "products", label: "Products", icon: Package },
        { id: "projects", label: "Projects", icon: Briefcase },
        { id: "features", label: "Features", icon: LayoutGrid },
        { id: "industries", label: "Industries", icon: Briefcase },
        { id: "testimonials", label: "Testimonials", icon: MessageSquare },
        { id: "blogs", label: "Blog", icon: FileText },
        { id: "catalogs", label: "Catalogs", icon: BookOpen },
        { id: "seo", label: "SEO", icon: Globe },
        { id: "socials", label: "Socials", icon: Share2 },
        { id: "coupons", label: "Coupons", icon: Ticket },
        { id: "announcements", label: "News", icon: Megaphone },
        { id: "users", label: "User Management", icon: LayoutGrid },
        { id: "quote-settings", label: "Quote Pricing", icon: Settings },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <main className="min-h-screen bg-slate-950 px-0 pt-4 pb-8 sm:pt-8 sm:pb-12">
            <div className="container mx-auto px-3 sm:px-4">
                <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white underline decoration-cyan-500 decoration-4 underline-offset-8 sm:text-4xl">Admin Portal</h1>
                        <p className="mt-4 break-all text-[10px] font-black uppercase tracking-widest text-slate-500 sm:text-sm">Sequence Authorized: <span className="text-white italic">{user.email}</span></p>
                    </div>
                    <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-500 shadow-lg shadow-red-500/5 transition-all hover:bg-red-500/20 sm:w-auto">
                        <LogOut size={18} /> Logout Session
                    </button>
                </div>

                <div className="hidden lg:flex items-center gap-2 mb-8 border-b border-white/5 pb-1 relative group bg-slate-900/40 p-1 rounded-t-2xl">
                    <button
                        onClick={() => scrollTabs("left")}
                        className="absolute -left-6 z-10 p-2 bg-slate-950 border border-slate-800 rounded-full text-cyan-500 hover:text-cyan-400 hover:scale-110 transition-all shadow-xl flex items-center justify-center"
                    >
                        <ChevronLeft size={20} className="stroke-[3px]" />
                    </button>

                    <div
                        ref={tabsContainerRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth no-scrollbar px-2"
                        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-6 py-4 font-bold capitalize transition-all relative whitespace-nowrap flex items-center gap-2 rounded-t-xl hover:bg-slate-800/50 ${activeTab === tab.id
                                    ? "text-cyan-400 bg-slate-950/50 border-b-2 border-cyan-400 shadow-[inset_0_-10px_20px_-10px_rgba(34,211,238,0.1)]"
                                    : "text-slate-500 hover:text-slate-300"
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => scrollTabs("right")}
                        className="absolute -right-6 z-10 p-2 bg-slate-950 border border-slate-800 rounded-full text-cyan-500 hover:text-cyan-400 hover:scale-110 transition-all shadow-xl flex items-center justify-center"
                    >
                        <ChevronRight size={20} className="stroke-[3px]" />
                    </button>
                </div>

                {/* Mobile Tab Select */}
                <div className="mb-6 lg:hidden sm:mb-8 relative group">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as TabType)}
                        className="w-full appearance-none rounded-2xl border-2 border-slate-800 bg-slate-900/50 px-6 py-4 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-xl focus:border-cyan-500/50 focus:outline-none focus:ring-8 focus:ring-cyan-500/5 transition-all cursor-pointer backdrop-blur-md"
                    >
                        {tabs.map(tab => (
                            <option key={tab.id} value={tab.id} className="bg-slate-950 text-white font-black py-4">
                                {tab.label.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-cyan-500 transition-colors" />
                </div>

                {/* Content Area */}
                <div className="animate-in slide-in-from-bottom-4 fade-in zoom-in-95 rounded-2xl border border-white/5 bg-slate-900/20 p-3 duration-700 sm:p-4">
                    {activeTab === "products" && <ProductsTab />}
                    {activeTab === "projects" && <ProjectsTab />}
                    {activeTab === "features" && <FeaturesTab />}
                    {activeTab === "industries" && <IndustriesTab />}
                    {activeTab === "testimonials" && <TestimonialsTab />}
                    {activeTab === "catalogs" && <CatalogsTab />}
                    {activeTab === "blogs" && <BlogsTab />}
                    {activeTab === "seo" && <SEOTab />}
                    {activeTab === "socials" && <SocialsTab />}
                    {activeTab === "settings" && <SettingsTab />}
                    {activeTab === "coupons" && <CouponsTab />}
                    {activeTab === "orders" && <OrdersTab />}
                    {activeTab === "announcements" && <AnnouncementsTab />}
                    {activeTab === "categories" && <CategoriesTab />}
                    {activeTab === "quote-settings" && <QuoteSettingsTab />}
                    {activeTab === "users" && <UsersTab />}
                </div>
            </div>
        </main>
    );
}
