"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, LayoutGrid, Package, MessageSquare, BookOpen, Globe, Share2, Settings, Briefcase, FileText, Ticket, ShoppingBag, Megaphone, ChevronLeft, ChevronRight, ChevronDown, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

// Import Tabs
import ProductsTab from "@/components/admin-dashboard-tabs/ProductsTab";
import TestimonialsTab from "@/components/admin-dashboard-tabs/TestimonialsTab";
import BlogsTab from "@/components/admin-dashboard-tabs/BlogsTab";
import SEOTab from "@/components/admin-dashboard-tabs/SEOTab";
import SocialsTab from "@/components/admin-dashboard-tabs/SocialsTab";
import ProjectsTab from "@/components/admin-dashboard-tabs/ProjectsTab";
import SettingsTab from "@/components/admin-dashboard-tabs/SettingsTab";
import IndustriesTab from "@/components/admin-dashboard-tabs/IndustriesTab";
import FeaturesTab from "@/components/admin-dashboard-tabs/FeaturesTab";
import CouponsTab from "@/components/admin-dashboard-tabs/CouponsTab";
import OrdersManagement from "@/components/admin-dashboard-tabs/OrdersManagement";
import UsersTab from "@/components/admin-dashboard-tabs/UsersTab";
import AnnouncementsTab from "@/components/admin-dashboard-tabs/AnnouncementsTab";
import CategoriesTab from "@/components/admin-dashboard-tabs/CategoriesTab";
import QuoteSettingsTab from "@/components/admin-dashboard-tabs/QuoteSettingsTab";
import HomeTab from "@/components/admin-dashboard-tabs/HomeTab";
import OfflineQuoteTab from "@/components/admin-dashboard-tabs/OfflineQuoteTab";
import EditQuoteTab from "@/components/admin-dashboard-tabs/EditQuoteTab";

import { getAdminEmails } from "@/lib/adminConfig";
import { ThemeToggle } from "@/components/ThemeToggle";
import NavigationManager from "@/components/admin/NavigationManager";

export default function SecureAdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Valid tabs type
    type TabType = "home" | "products" | "projects" | "testimonials" | "blogs" | "seo" | "socials" | "settings" | "features" | "industries" | "coupons" | "orders" | "users" | "announcements" | "categories" | "quote-settings" | "navigation" | "offline-quote";

    const [activeTab, setActiveTab] = useState<TabType>("home");
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
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white gap-4">
                <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Verifying Admin Access...</p>
            </div>
        );
    }

    const tabs = [
        { id: "home", label: "Home", icon: Home },
        { id: "orders", label: "Orders", icon: ShoppingBag },
        { id: "categories", label: "Collections", icon: LayoutGrid },
        { id: "products", label: "Catalog", icon: Package },
        { id: "projects", label: "Projects", icon: Briefcase },
        { id: "features", label: "Products", icon: LayoutGrid },
        { id: "industries", label: "Industries", icon: Briefcase },
        { id: "testimonials", label: "Testimonials", icon: MessageSquare },
        { id: "blogs", label: "Blog", icon: FileText },
        { id: "seo", label: "SEO", icon: Globe },
        { id: "socials", label: "Socials", icon: Share2 },
        { id: "coupons", label: "Coupons", icon: Ticket },
        { id: "users", label: "User Management", icon: LayoutGrid },
        { id: "quote-settings", label: "Quote Pricing", icon: Settings },
        { id: "offline-quote", label: "Offline Quote", icon: FileText },
        { id: "navigation", label: "Navigation", icon: LayoutGrid },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <main className="admin-page-body min-h-screen bg-slate-50 dark:bg-slate-950 px-0 pt-4 pb-0 sm:pt-8 sm:pb-0 transition-colors duration-500 relative overflow-visible">
            {/* Background Mesh Gradient */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full mx-auto px-3 sm:px-6 relative z-10">
                <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-200 dark:border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Settings className="text-white animate-spin-slow" size={24} />
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Central <span className="text-cyan-500">Command</span></h1>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-500">Sequence Authorized: <span className="text-slate-900 dark:text-white italic bg-slate-200 dark:bg-white/5 px-4 py-1.5 rounded-full ml-2 shadow-inner border border-slate-300/30 dark:border-white/5">{user.email}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button onClick={handleLogout} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-4 font-black text-red-500 text-[11px] uppercase tracking-widest transition-all hover:bg-red-500/10 hover:scale-105 active:scale-95 sm:w-auto shadow-xl shadow-red-500/5">
                            <LogOut size={18} /> Terminate Session
                        </button>
                    </div>
                </div>

                <div className="hidden lg:flex items-center mb-8 border-b border-slate-200 dark:border-white/5 pb-2 bg-slate-50 dark:bg-slate-900/40 p-1 rounded-t-2xl relative group">
                    <button 
                        onClick={() => scrollTabs("left")} 
                        className="absolute left-0 z-20 h-full px-2 flex items-center justify-center bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 text-slate-400 hover:text-cyan-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div ref={tabsContainerRef} className="flex flex-nowrap items-center gap-2 px-8 overflow-x-auto scrollbar-hide scroll-smooth w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-6 py-4 font-black text-[12px] uppercase tracking-[0.15em] transition-all relative flex items-center gap-3 rounded-2xl backdrop-blur-xl whitespace-nowrap shrink-0 outline-none focus:outline-none ${activeTab === tab.id
                                    ? "text-cyan-500 dark:text-cyan-400 bg-white dark:bg-slate-900 border-2 border-cyan-500/40 shadow-[0_20px_50px_-15px_rgba(6,182,212,0.15)] scale-105 z-10"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border-2 border-transparent hover:bg-white/50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10"
                                    }`}
                            >
                                <tab.icon size={16} className="shrink-0" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => scrollTabs("right")} 
                        className="absolute right-0 z-20 h-full px-2 flex items-center justify-center bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 text-slate-400 hover:text-cyan-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Mobile Tab Select */}
                <div className="mb-6 lg:hidden sm:mb-8 relative group">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as TabType)}
                        className="w-full appearance-none rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white shadow-xl focus:border-cyan-500/50 focus:outline-none focus:ring-8 focus:ring-cyan-500/5 transition-all cursor-pointer backdrop-blur-md"
                    >
                        {tabs.map(tab => (
                            <option key={tab.id} value={tab.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-black py-4">
                                {tab.label.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-cyan-500 transition-colors" />
                </div>

                {/* Content Area */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/30 p-4 sm:p-6 shadow-2xl shadow-slate-900/5 backdrop-blur-sm transition-colors overflow-visible"
                >
                    <div className="w-full mx-auto">
                        {activeTab === "home" && <HomeTab />}
                        {activeTab === "products" && <ProductsTab />}
                        {activeTab === "projects" && <ProjectsTab />}
                        {activeTab === "features" && <FeaturesTab />}
                        {activeTab === "industries" && <IndustriesTab />}
                        {activeTab === "testimonials" && <TestimonialsTab />}
                        {activeTab === "blogs" && <BlogsTab />}
                        {activeTab === "seo" && <SEOTab />}
                        {activeTab === "socials" && <SocialsTab />}
                        {activeTab === "settings" && <SettingsTab />}
                        {activeTab === "coupons" && <CouponsTab />}
                        {activeTab === "orders" && <OrdersManagement />}
                        {activeTab === "categories" && <CategoriesTab />}
                        { activeTab === "quote-settings" && <QuoteSettingsTab /> }
                        { activeTab === "offline-quote" && <OfflineQuoteTab /> }
                        { activeTab === "navigation" && <NavigationManager /> }
                        { activeTab === "users" && <UsersTab /> }
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
