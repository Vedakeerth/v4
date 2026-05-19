import React from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Target, Award, Users, ShieldCheck, Compass, Shield } from "lucide-react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('About', '/about', {
    title: "About Us | VAELINSA 3D Printing & Engineering India",
    description: "Learn about VAELINSA - Coimbatore's premier industrial 3D printing and rapid prototyping lab turning complex CAD concepts into physical engineering realities.",
  });
}

export default function AboutPage() {
  const pillars = [
    {
      icon: Target,
      title: "Precision Engineering",
      description: "Operating state-of-the-art FDM and high-resolution SLA resin printers holding industrial tolerances for functional assemblies."
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "We perform multi-point mechanical inspections on every print, ensuring infill density, surface finish, and thread fits match specifications."
    },
    {
      icon: Users,
      title: "Expert CAD Advisory",
      description: "Our in-house mechanical engineers optimize your raw designs for additive manufacturing (DFAM), reducing weight and print costs."
    },
    {
      icon: ShieldCheck,
      title: "Express Secure Logistics",
      description: "Every part is shock-wrapped and shipped in heavy-duty cardboard boxes to deliver physical prototypes safely across India."
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-20">
      {/* Hero Header */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-slate-200 dark:border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.04),transparent_50%)]" />
        <div className="dynamic-container relative z-10 text-center px-4">
          <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest border border-cyan-500/20 mb-6 inline-block">
            Who We Are
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight max-w-4xl mx-auto leading-tight mb-8">
            Pioneering the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Additive Manufacturing</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            VAELINSA is an India-based advanced rapid prototyping and product development company transforming raw CAD concepts into physical engineering components.
          </p>
        </div>
      </section>

      {/* Our Mission & Journey */}
      <section className="py-20 md:py-28 relative">
        <div className="dynamic-container px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-cyan-500 font-bold uppercase tracking-widest text-xs mb-3 block">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                From Coimbatore to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">All of India</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Established with a vision to democratize advanced additive manufacturing, VAELINSA began as a specialized CAD development group in Coimbatore, Tamil Nadu. Today, we stand as one of India's premier online 3D printing hubs serving hardware startups, mechanical designers, medical laboratories, and heavy industries nationwide.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                By combining highly-optimized parameter profiles, state-of-the-art printers, and instant cloud-quote calculators, we bypass the slow timelines of traditional machining, delivering high-tolerance parts in days, not weeks.
              </p>
              <div className="flex gap-4">
                <Link href="/quote">
                  <button className="h-14 px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    Get AI Quote
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
            
            {/* Mission Visual Card */}
            <div className="relative p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/10 blur-3xl rounded-full" />
              <Shield className="h-12 w-12 text-cyan-500 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Quality Assurance</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Our team stands apart by enforcing multi-point mechanical inspection on every manufactured component to ensure extreme quality control.
              </p>
              <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">24-Hour Prototyping Turnaround</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Advanced High-Performance Engineering Polymers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Strict Quality Inspections (Thread Fits & Tolerances)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03),transparent_70%)]" />
        <div className="dynamic-container px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Vision Card */}
            <div className="relative p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/10 blur-2xl rounded-full opacity-60" />
              <div>
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Compass className="h-7 w-7" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Our Vision</h3>
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-medium">
                  To become a leading industrial 3D printing and engineering innovation company in India, transforming ideas into real-world products through cutting-edge additive manufacturing, CAD design, and next-generation prototyping technologies.
                </p>
              </div>
              <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">National Leadership</span>
              </div>
            </div>

            {/* Mission Card */}
            <div className="relative p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/10 blur-2xl rounded-full opacity-60" />
              <div>
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Our Mission</h3>
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-medium">
                  VAELINSA exists to bridge creativity and manufacturing by making industrial-grade 3D printing, engineering design, and rapid prototyping accessible to everyone.
                </p>
              </div>
              <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Bridging Innovation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/20 border-t border-b border-slate-200 dark:border-slate-900 relative">
        <div className="dynamic-container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
              Why Engineers Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">VAELINSA</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base">
              We stand apart by prioritizing industrial quality control and engineering advisory services alongside custom prints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:border-cyan-500/30 transition-all group">
                  <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl w-fit mb-6 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{pillar.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
