import React from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import DecryptText from "@/components/DecryptText";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
        <div className="p-4 bg-cyan-500/10 rounded-full mb-8">
          <AlertTriangle className="h-12 w-12 text-cyan-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
          <DecryptText text="404 - Page Not Found" scrambleFrames={8} frameMs={35} startDelay={2000} />
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex gap-4">
          <Link href="/">
            <button className="h-14 px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              Back to Home
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/contact">
            <button className="h-14 px-8 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-900 font-bold uppercase tracking-widest rounded-full transition-all">
              Contact Us
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
