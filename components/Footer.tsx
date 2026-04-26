"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Instagram, Facebook, Linkedin, Twitter, Youtube, Share2 } from "lucide-react";
import { getSocials, type SocialLink } from "@/lib/socials";
import { useTheme } from "next-themes";

import { getSettings, type SiteSettings } from "@/lib/settings";

const ICON_MAP: Record<string, any> = {
    Instagram,
    Facebook,
    Linkedin,
    Twitter,
    Youtube
};

export default function Footer() {
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [socials, setSocials] = useState<SocialLink[]>([]);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
        getSettings().then(setSettings);
        getSocials().then(setSocials);
    }, []);

    const aboutText = settings?.footerAboutText || "Premium additive manufacturing and design services for the modern engineer.";
    const serviceLinks = settings?.footerServiceLinks || [
        { name: "FDM Printing", href: "/services#fdm" },
        { name: "SLA Resin", href: "/services#sla" },
        { name: "Product Design", href: "/services#design" },
        { name: "Rapid Prototyping", href: "/services#prototyping" },
    ];
    const quickLinks = settings?.footerLinks || [
        { name: "Product Catalog", href: "/catalog" },
        { name: "Track Your Order", href: "/track-order" },
        { name: "Blog & Updates", href: "/blog" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Return & Refund Policy", href: "/refunds" },
    ];
    const contactEmail = settings?.contactEmail || "support@vaelinsa.com";

    if (!mounted) {
        return (
            <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-4 md:py-8">
                <div className="dynamic-container">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-4 md:mb-8">
                        <div className="col-span-1 md:col-span-1">
                            <div className="mb-4">
                                <Image
                                    src="/images/logo-v2.png"
                                    alt="VAELINSA Logo"
                                    width={120}
                                    height={40}
                                    className="h-10 w-auto"
                                />
                            </div>
                            <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed">
                                {aboutText}
                            </p>
                        </div>
                        <div /> <div /> <div />
                    </div>
                </div>
            </footer>
        );
    }

    const logoSrc = resolvedTheme === 'dark' ? "/images/logo.png" : "/images/logo-v2.png";

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-4 md:py-8">
            <div className="dynamic-container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-4 md:mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="mb-4">
                            <Image
                                src={logoSrc}
                                alt="VAELINSA Logo"
                                width={120}
                                height={40}
                                className="h-10 w-auto"
                            />
                        </div>
                        <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed">
                            {aboutText}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Services</h4>
                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-400">
                            {serviceLinks.map((link, idx) => (
                                <li key={idx} className="hover:text-cyan-400 cursor-pointer">
                                    <Link href={link.href}>{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-400">
                            {quickLinks.map((link, idx) => (
                                <li key={idx} className="hover:text-cyan-400 transition-colors">
                                    <Link href={link.href}>{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-cyan-500" />
                                <a href={`mailto:${contactEmail}`} className="text-slate-700 dark:text-slate-400 hover:text-cyan-400 transition-colors">{contactEmail}</a>
                            </li>
                            {settings?.contactPhone && (
                                <li className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-cyan-500" />
                                    <span className="text-slate-700 dark:text-slate-400">{settings.contactPhone}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                        {socials.map((social) => {
                            const Icon = ICON_MAP[social.icon] || Share2;
                            return (
                                <a
                                    key={social.id}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-600 hover:text-cyan-400 transition-colors"
                                    title={social.name}
                                >
                                    <Icon size={18} />
                                </a>
                            );
                        })}
                    </div>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-slate-700 dark:text-slate-300 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-700 dark:text-slate-300 transition-colors">Terms of Service</Link>
                        <Link href="/refunds" className="hover:text-slate-700 dark:text-slate-300 transition-colors">Return & Refund Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
