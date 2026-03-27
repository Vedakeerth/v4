import Image from "next/image";
import Link from "next/link";
import { Mail, Instagram, Facebook, Linkedin, Twitter, Youtube, Share2 } from "lucide-react";
import { getSocials } from "@/lib/socials";

const ICON_MAP: Record<string, any> = {
    Instagram,
    Facebook,
    Linkedin,
    Twitter,
    Youtube
};

export default function Footer() {
    const socials = getSocials();
    return (
        <footer className="bg-slate-950 border-t border-slate-900 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="mb-4">
                            <Image
                                src="/images/logo.png"
                                alt="VAELINSA Logo"
                                width={120}
                                height={40}
                                className="h-10 w-auto"
                            />
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Premium additive manufacturing and design services for the modern engineer.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Services</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="hover:text-cyan-400 cursor-pointer">FDM Printing</li>
                            <li className="hover:text-cyan-400 cursor-pointer">SLA Resin</li>
                            <li className="hover:text-cyan-400 cursor-pointer">Product Design</li>
                            <li className="hover:text-cyan-400 cursor-pointer">Rapid Prototyping</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="hover:text-cyan-400">
                                <Link href="/catalog">Product Catalog</Link>
                            </li>
                            <li className="hover:text-cyan-400">
                                <Link href="/track-order">Track My Order</Link>
                            </li>
                            <li className="hover:text-cyan-400">
                                <Link href="/blog">Blog & Updates</Link>
                            </li>
                            <li className="hover:text-cyan-400">About Us</li>
                            <li className="hover:text-cyan-400">FAQ</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-cyan-500" />
                                <a href="mailto:support@vaelinsa.com" className="text-slate-400 hover:text-cyan-400 transition-colors">support@vaelinsa.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                        {socials.map((social) => {
                            const Icon = ICON_MAP[social.icon] || Share2;
                            return (
                                <a
                                    key={social.id}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-500 hover:text-cyan-400 transition-colors"
                                    title={social.name}
                                >
                                    <Icon size={18} />
                                </a>
                            );
                        })}
                    </div>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
                        <Link href="/refunds" className="hover:text-slate-400 transition-colors">Refunds & Cancellations</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
