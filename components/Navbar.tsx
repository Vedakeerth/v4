'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface NavbarProps {
    navLinks?: { name: string; href: string }[];
    ctaData?: { text: string; href: string };
}

export default function Navbar({
    navLinks = [
        { name: "Catalog", href: "/catalog" },
        { name: "Services", href: "/services" },
        { name: "Gallery", href: "/gallery" },
        { name: "Projects", href: "/projects" },
        { name: "Features", href: "/features" },
        { name: "Blog", href: "/blog" },
        { name: "Track Order", href: "/track-order" },
        { name: "Contact", href: "/contact" },
    ],
    ctaData = { text: "Get Quote", href: "/quote" }
}: NavbarProps) {
    const pathname = usePathname();
    const isHomePage = pathname === '/' || pathname === '/index.html' || pathname === '';
    const [isVisible, setIsVisible] = useState(!isHomePage);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { setIsCartOpen, cartCount } = useCart();

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
                        "fixed left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md shadow-2xl transition-all duration-300",
                        pathname === '/checkout' ? "top-0" : "top-[30px]"
                    )}
                >
                    <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative h-10 w-auto aspect-[3/1]">
                                <Image
                                    src="/images/logo.png"
                                    alt="VAELINSA Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* CTA & Actions */}
                        <div className="flex items-center gap-2 md:gap-4">
                            <Link href={ctaData.href} className="hidden sm:block">
                                <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-6 rounded-full text-sm transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                                    {ctaData.text}
                                </button>
                            </Link>

                            {!pathname.startsWith('/admin') && (
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="p-2 relative text-slate-300 hover:text-white transition-colors"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    <AnimatePresence>
                                        {cartCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center"
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
                                className="md:hidden p-2 text-slate-300 hover:text-cyan-400 transition-colors"
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
                                className="md:hidden border-t border-slate-800 bg-slate-950 overflow-hidden"
                            >
                                <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="text-lg font-medium text-slate-300 hover:text-cyan-400 transition-colors py-2"
                                        >
                                            {link.name}
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


