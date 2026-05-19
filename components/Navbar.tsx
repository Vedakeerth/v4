'use client';

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

import { getSettings, type SiteSettings } from "@/lib/settings";

export default function Navbar() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const pathname = usePathname();
    const isHomePage = pathname === '/' || pathname === '/index.html' || pathname === '';
    const [isVisible, setIsVisible] = useState(!isHomePage);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const { setIsCartOpen, cartCount } = useCart();

    useEffect(() => {
        setMounted(true);
        getSettings().then(setSettings);
    }, []);

    const databaseLinks = settings?.navbarLinks?.filter(l => l.isActive !== false);
    let navLinks = databaseLinks || [
        { name: "Services", href: "/services" },
        { name: "Blog", href: "/blog" },
        { name: "Gallery", href: "/gallery" },
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Track Order", href: "/track-order" },
    ];

    if (databaseLinks && !databaseLinks.some(l => l.href === "/about")) {
        const contactIndex = navLinks.findIndex(l => l.href === "/contact");
        if (contactIndex !== -1) {
            navLinks = [
                ...navLinks.slice(0, contactIndex),
                { name: "About Us", href: "/about" },
                ...navLinks.slice(contactIndex)
            ];
        } else {
            navLinks = [...navLinks, { name: "About Us", href: "/about" }];
        }
    }

    const targetOrder = ["/services", "/gallery", "/about", "/blog", "/contact", "/track-order"];
    const getLinkOrder = (href: string) => {
        const normalized = href === "/features" || href === "/products" ? "/gallery" : href;
        const index = targetOrder.indexOf(normalized);
        return index !== -1 ? index : 999;
    };
    navLinks = [...navLinks].sort((a, b) => getLinkOrder(a.href) - getLinkOrder(b.href));

    const ctaData = { text: "Get Quote", href: "/quote" };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isHomePage) {
            setIsVisible(true);
            return;
        }

        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > 50) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHomePage]);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isMenuOpen && !target.closest('.navbar-container')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isMenuOpen]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className={cn(
                        "navbar-container fixed left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 backdrop-blur-md shadow-2xl transition-all duration-300",
                        pathname === '/checkout' ? "top-0" : "top-[30px]"
                    )}
                >
                    <div className="dynamic-container h-20 flex items-center">
                        {/* Logo - Flex-1 to push nav to center */}
                        <div className="flex-1">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="relative h-10 w-auto aspect-[3/1]">
                                    <Image
                                        src={resolvedTheme === 'dark' ? "/images/logo.png" : "/images/logo-v2.png"}
                                        alt="VAELINSA Logo"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Navigation - Centered */}
                        <nav className="hidden md:flex items-center gap-8 px-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href === "/features" ? "/gallery" : link.href}
                                    className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                                >
                                    {link.name === "Features" ? "Gallery" : link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* CTA & Actions - Flex-1 to push nav to center */}
                        <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
                            <ThemeToggle />
                            <Link href={ctaData.href} className="hidden sm:block">
                                <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-6 rounded-full text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95">
                                    {ctaData.text}
                                </button>
                            </Link>

                            {!pathname.startsWith('/admin') && (
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="p-2 relative text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <AnimatePresence>
                                        {cartCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center"
                                            >
                                                {cartCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            )}

                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-cyan-400 transition-colors"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
                            >
                                <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href === "/features" ? "/gallery" : link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-400 transition-colors py-2"
                                        >
                                            {link.name === "Features" ? "Gallery" : link.name}
                                        </Link>
                                    ))}
                                    <Link href={ctaData.href} onClick={() => setIsMenuOpen(false)} className="mt-4">
                                        <button className="w-full bg-cyan-500 text-slate-950 font-bold py-3 rounded-xl transition-colors">
                                            {ctaData.text}
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.header>
            )}
        </AnimatePresence>
    );
}


