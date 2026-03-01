"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutGrid, Package, MessageSquare, BookOpen, Globe, Share2, Settings, Briefcase, FileText, Ticket, ShoppingBag } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

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

export default function SecureDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();

    // Valid tabs type
    type TabType = "products" | "projects" | "testimonials" | "catalogs" | "blogs" | "seo" | "socials" | "settings" | "features" | "industries" | "coupons" | "orders" | "users";

    const [activeTab, setActiveTab] = useState<TabType>("products");

    // Auth Check
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/secure-management-portal/login");
        }
    }, [status, router]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/secure-management-portal/login" });
    };

    if (status === "loading" || !session) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Verifying Access...</div>;
    }

    const isAdmin = (session.user as any)?.role === "SUPER_ADMIN";

    const tabs = [
        { id: "orders", label: "Orders", icon: ShoppingBag },
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
        ...(isAdmin ? [{ id: "users", label: "User Management", icon: LayoutGrid }] : []),
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Management Portal</h1>
                        <p className="text-slate-400">Welcome, {session.user?.name || session.user?.email} ({session.user?.role || 'User'})</p>
                    </div>
                    <button onClick={handleLogout} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all flex items-center gap-2 font-semibold">
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden lg:flex gap-2 mb-8 border-b border-slate-800/50 pb-1 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`px-6 py-4 font-bold capitalize transition-all relative whitespace-nowrap flex items-center gap-2 rounded-t-xl hover:bg-slate-900/50 ${activeTab === tab.id
                                ? "text-cyan-400 bg-slate-900 border-b-2 border-cyan-400"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Mobile Tab Select */}
                <div className="lg:hidden mb-8">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as TabType)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    >
                        {tabs.map(tab => (
                            <option key={tab.id} value={tab.id}>{tab.label}</option>
                        ))}
                    </select>
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    {activeTab === "users" && isAdmin && <UsersTab />}
                </div>
            </div>
        </main>
    );
}
