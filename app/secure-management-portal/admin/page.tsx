"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutGrid, Package, MessageSquare, BookOpen, Globe, Share2, Settings, Briefcase, FileText, Ticket, ShoppingBag, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
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

const ADMIN_EMAIL = "vaelinsa@gmail.com";

export default function SecureAdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Valid tabs type
    type TabType = "products" | "projects" | "testimonials" | "catalogs" | "blogs" | "seo" | "socials" | "settings" | "features" | "industries" | "coupons" | "orders" | "users" | "announcements" | "categories";

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
            } else if (firebaseUser.email?.toLowerCase() !== ADMIN_EMAIL) {
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
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <main className="min-h-screen bg-slate-950 pt-8 pb-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight underline decoration-cyan-500 decoration-4 underline-offset-8">Admin Portal</h1>
                        <p className="text-slate-400 mt-2 font-medium">Welcome back, <span className="text-white font-bold">{user.email}</span></p>
                    </div>
                    <button onClick={handleLogout} className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all flex items-center gap-2 font-bold shadow-lg shadow-red-500/5">
                        <LogOut size={18} /> Logout Session
                    </button>
                </div>

                {/* Desktop Tabs */}
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
                <div className="lg:hidden mb-8">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as TabType)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white font-bold focus:outline-none focus:border-cyan-500 shadow-xl"
                    >
                        {tabs.map(tab => (
                            <option key={tab.id} value={tab.id}>{tab.label}</option>
                        ))}
                    </select>
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 bg-slate-900/20 rounded-2xl p-4 border border-white/5">
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
                    {activeTab === "users" && <UsersTab />}
                </div>
            </div>
        </main>
    );
}
