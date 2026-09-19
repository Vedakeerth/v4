"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminEmails } from "@/lib/adminConfig";
import { ThemeToggle } from "@/components/ThemeToggle";
import OverviewTab from "@/components/admin-dashboard-tabs/OverviewTab";
import HomeTab from "@/components/admin-dashboard-tabs/HomeTab";
import ProductsTab from "@/components/admin-dashboard-tabs/ProductsTab";
import ProjectsTab from "@/components/admin-dashboard-tabs/ProjectsTab";
import FeaturesTab from "@/components/admin-dashboard-tabs/FeaturesTab";
import IndustriesTab from "@/components/admin-dashboard-tabs/IndustriesTab";
import TestimonialsTab from "@/components/admin-dashboard-tabs/TestimonialsTab";
import BlogsTab from "@/components/admin-dashboard-tabs/BlogsTab";
import SEOTab from "@/components/admin-dashboard-tabs/SEOTab";
import SocialsTab from "@/components/admin-dashboard-tabs/SocialsTab";
import SettingsTab from "@/components/admin-dashboard-tabs/SettingsTab";
import CouponsTab from "@/components/admin-dashboard-tabs/CouponsTab";
import OrdersManagement from "@/components/admin-dashboard-tabs/OrdersManagement";
import CategoriesTab from "@/components/admin-dashboard-tabs/CategoriesTab";
import QuoteSettingsTab from "@/components/admin-dashboard-tabs/QuoteSettingsTab";
import NavigationManager from "@/components/admin/NavigationManager";
import UsersTab from "@/components/admin-dashboard-tabs/UsersTab";

export default function SecureAdminPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const activeTab = searchParams?.get("tab") || "overview";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                router.push("/secure-management-portal/login");
            } else {
                const adminEmails = getAdminEmails();
                if (!firebaseUser.email?.toLowerCase() || !adminEmails.includes(firebaseUser.email.toLowerCase())) {
                    console.error("Access Denied: Restricted to admin only.");
                    await firebaseSignOut(auth);
                    await signOut({ redirect: false });
                    router.push("/secure-management-portal/login?error=AccessDenied");
                } else {
                    setUser(firebaseUser);
                    setLoading(false);
                }
            }
        });
        return unsubscribe;
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

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 h-screen overflow-y-auto relative">
                <div className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Settings className="text-white" size={16} />
                            </div>
                            <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Central Command</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-slate-500">
                                {user?.email}
                            </span>
                            <ThemeToggle />
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 font-black text-red-500 text-[10px] uppercase tracking-widest transition-all hover:bg-red-500/10 active:scale-95"
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:p-6">
                    <AdminContent activeTab={activeTab} />
                </div>
            </main>
        </div>
    );
}

function AdminContent({ activeTab }: { activeTab: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/30 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm text-[15px]"
        >
            <div className="w-full mx-auto">
                {activeTab === "overview" && <OverviewTab />}
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
                {activeTab === "quote-settings" && <QuoteSettingsTab />}
                {activeTab === "navigation" && <NavigationManager />}
                {activeTab === "users" && <UsersTab />}
            </div>
        </motion.div>
    );
}
