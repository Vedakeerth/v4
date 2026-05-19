"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Cpu, Zap, Printer, Compass } from "lucide-react";

interface KeywordLandingPageProps {
  keyword: string;
  title: string;
  subtitle: string;
  description: string;
  features: { title: string; desc: string; icon: "printer" | "cpu" | "zap" | "compass" }[];
  bullets: string[];
  paragraphs: string[];
  ctaText?: string;
  ctaLink?: string;
}

export default function KeywordLandingPage({
  keyword,
  title,
  subtitle,
  description,
  features,
  bullets,
  paragraphs,
  ctaText = "Get an Instant Quote",
  ctaLink = "/quote"
}: KeywordLandingPageProps) {
  
  const ICON_MAP = {
    printer: Printer,
    cpu: Cpu,
    zap: Zap,
    compass: Compass
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-slate-200 dark:border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)]" />
        
        <div className="dynamic-container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest border border-cyan-500/20 mb-6 inline-block">
              {keyword}
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-8 leading-tight">
              {title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
              {subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={ctaLink}>
                <button className="inline-flex h-14 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 text-sm font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  {ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="/gallery">
                <button className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 px-8 text-sm font-black uppercase tracking-widest transition-all duration-200">
                  View Gallery
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="dynamic-container px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            
            {/* Paragraphs and Detailed Info */}
            <div className="lg:col-span-2 space-y-8 text-slate-700 dark:text-slate-300">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Advanced Solutions For Your Engineering Needs
              </h2>
              <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-400">
                {description}
              </p>
              {paragraphs.map((p, idx) => (
                <p key={idx} className="text-base sm:text-lg leading-relaxed">
                  {p}
                </p>
              ))}

              <div className="pt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-6">
                  Why VAELINSA Stands Out
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Specs / Side Cards */}
            <div className="lg:col-span-1 space-y-6">
              {features.map((feat, idx) => {
                const IconComponent = ICON_MAP[feat.icon] || Printer;
                return (
                  <div key={idx} className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl group hover:border-cyan-500/50 transition-all duration-300">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                      {feat.title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-900/10 to-blue-900/10 dark:from-cyan-950/20 dark:to-blue-950/20 border-t border-slate-200 dark:border-slate-900 relative overflow-hidden">
        <div className="dynamic-container text-center px-4 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
            Ready to Bring Your Design to Life?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto mb-10">
            Upload your STL models to our digital manufacturing portal for instant price verification, material choice, and express logistics.
          </p>
          <Link href="/quote">
            <button className="inline-flex h-14 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-12 text-sm font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              Calculate Print Cost Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
