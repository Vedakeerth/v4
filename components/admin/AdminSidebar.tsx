"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingBag,
  LayoutGrid,
  Package,
  Briefcase,
  MessageSquare,
  FileText,
  Globe,
  Share2,
  Ticket,
  Settings,
  Users,
  Megaphone,
  Calculator,
  Map,
  X,
  Menu,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  group: string;
  tab: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/secure-management-portal/admin?tab=overview", icon: Home, group: "Overview", tab: "overview" },
  { label: "Home Page", href: "/secure-management-portal/admin?tab=home", icon: LayoutGrid, group: "Content", tab: "home" },
  { label: "Orders", href: "/secure-management-portal/admin?tab=orders", icon: ShoppingBag, group: "Content", tab: "orders" },
  { label: "Products", href: "/secure-management-portal/admin?tab=products", icon: Package, group: "Content", tab: "products" },
  { label: "Categories", href: "/secure-management-portal/admin?tab=categories", icon: LayoutGrid, group: "Content", tab: "categories" },
  { label: "Projects", href: "/secure-management-portal/admin?tab=projects", icon: Briefcase, group: "Content", tab: "projects" },
  { label: "Gallery", href: "/secure-management-portal/admin?tab=features", icon: Share2, group: "Content", tab: "features" },
  { label: "Blog", href: "/secure-management-portal/admin?tab=blogs", icon: FileText, group: "Content", tab: "blogs" },
  { label: "Testimonials", href: "/secure-management-portal/admin?tab=testimonials", icon: MessageSquare, group: "Content", tab: "testimonials" },
  { label: "Industries", href: "/secure-management-portal/admin?tab=industries", icon: Megaphone, group: "Content", tab: "industries" },
  { label: "SEO", href: "/secure-management-portal/admin?tab=seo", icon: Globe, group: "Settings", tab: "seo" },
  { label: "Socials", href: "/secure-management-portal/admin?tab=socials", icon: Share2, group: "Settings", tab: "socials" },
  { label: "Coupons", href: "/secure-management-portal/admin?tab=coupons", icon: Ticket, group: "Settings", tab: "coupons" },
  { label: "Quote Pricing", href: "/secure-management-portal/admin?tab=quote-settings", icon: Calculator, group: "Settings", tab: "quote-settings" },
  { label: "Navigation", href: "/secure-management-portal/admin?tab=navigation", icon: Map, group: "Settings", tab: "navigation" },
  { label: "Users", href: "/secure-management-portal/admin?tab=users", icon: Users, group: "Settings", tab: "users" },
  { label: "Settings", href: "/secure-management-portal/admin?tab=settings", icon: Settings, group: "Settings", tab: "settings" },
];

const groups = ["Overview", "Content", "Settings"];

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: NavItem) => {
    if (pathname !== "/secure-management-portal/admin") return false;
    return searchParams?.get("tab") === item.tab;
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900 text-white shadow-lg"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 w-64 h-full bg-slate-950 border-r border-slate-800 overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Settings className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-tight">VAELINSA</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Admin</p>
                </div>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="p-3 space-y-6">
              {groups.map((group) => (
                <div key={group}>
                  <div className="px-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-700">
                      {group}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {navItems
                      .filter((item) => item.group === group)
                      .map((item) => {
                        const active = isActive(item);
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                              active
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "text-slate-400 hover:bg-slate-900 hover:text-white"
                            )}
                          >
                            <item.icon size={18} className={cn("shrink-0", active ? "text-cyan-500" : "opacity-60")} />
                            {item.label}
                          </Link>
                        );
                      })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 h-screen sticky top-0">
        {/* Fixed logo header */}
        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Settings className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">VAELINSA</h1>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Admin Portal</p>
            </div>
          </Link>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {groups.map((group) => (
            <div key={group}>
              <div className="px-3 mb-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {group}
                </span>
              </div>
              <div className="space-y-0.5">
                {navItems
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-bold transition-all duration-200",
                          active
                            ? "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <item.icon size={18} className={cn("shrink-0", active ? "text-cyan-500" : "opacity-60")} />
                        {item.label}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
