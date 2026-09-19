import React from "react";
import Link from "next/link";
import { Wrench, Clock, Mail, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Maintenance | VAELINSA",
  description: "We're currently performing scheduled maintenance. We'll be back shortly.",
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 z-50" />

      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Animated icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
            <div className="relative p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
              <Wrench className="h-14 w-14 text-cyan-500 animate-[spin_4s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
          <Clock className="h-3.5 w-3.5" />
          Scheduled Maintenance
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-6 leading-none">
          We&apos;ll Be{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Back Soon
          </span>
        </h1>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-4 max-w-xl mx-auto">
          We're currently performing scheduled maintenance to improve your experience.
          Our engineers are working hard to get everything back up and running.
        </p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mb-10">
          Estimated downtime: <span className="font-semibold text-slate-700 dark:text-slate-300">2–4 hours</span>
        </p>

        {/* Divider */}
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-10 opacity-50" />

        {/* Contact */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <a
            href="mailto:support@vaelinsa.com"
            className="inline-flex items-center gap-2 h-12 px-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-500 font-semibold rounded-full transition-all text-sm"
          >
            <Mail className="h-4 w-4" />
            support@vaelinsa.com
          </a>
          <a
            href="https://wa.me/918903595542"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-6 bg-green-500 hover:bg-green-400 text-white font-bold rounded-full transition-all text-sm"
          >
            WhatsApp Us
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Status checklist */}
        <div className="inline-flex flex-col gap-3 text-left bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-w-[260px]">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Maintenance Status</p>
          {[
            { label: "Database Optimization", done: true },
            { label: "Server Configuration", done: true },
            { label: "Performance Tuning", done: false },
            { label: "Final Testing & QA", done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${item.done ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]" : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse"}`} />
              <span className={`text-sm font-medium ${item.done ? "text-slate-500 line-through" : "text-slate-700 dark:text-slate-300"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Back link */}
        <p className="mt-8 text-sm text-slate-500">
          Already done?{" "}
          <Link href="/" className="text-cyan-500 hover:text-cyan-400 font-semibold transition-colors">
            Try the homepage →
          </Link>
        </p>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </main>
  );
}
