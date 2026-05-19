"use client";

import React, { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "What 3D printing technologies do you offer?",
    answer: "We specialize in FDM (Fused Deposition Modeling) for high-strength functional parts using PLA, PETG, ABS, and Carbon Fiber composites, as well as SLA (Stereolithography / Resin) printing for ultra-high-resolution prototypes, miniatures, and detailed engineering models."
  },
  {
    question: "How do I get an instant price quotation?",
    answer: "You can upload your 3D models (STL, OBJ, or STEP formats) directly to our instant AI Quote Calculator. Our engine instantly analyzes your model volume, dimensions, and structural characteristics, calculating a precise price based on your choice of material and infill options."
  },
  {
    question: "What is your typical production lead time?",
    answer: "Standard production lead time for 3D printed parts is 2 to 4 business days. For express or rapid prototyping requests, we offer 24-hour turnaround options. Bulk orders or complex product design services will have customized delivery timelines provided upon booking."
  },
  {
    question: "What engineering materials are available?",
    answer: "For FDM, we support standard plastics (PLA, PETG), high-durability polymers (ABS, ASA, Nylon), flexible elastomers (TPU), and advanced composite materials like Carbon Fiber-reinforced PLA/PETG. For SLA resin, we offer standard, tough/impact-resistant, and high-temperature resins."
  },
  {
    question: "Do you provide domestic shipping across India?",
    answer: "Yes, we ship safely and securely to all cities and PIN codes across India. All parts are securely wrapped, cushioned with anti-static and shock-absorbing bubble wrap, and packed in heavy-duty cardboard boxes to ensure safe arrival."
  },
  {
    question: "Can you help me design or modify my CAD files?",
    answer: "Absolutely! Our team of mechanical engineers provides full CAD design, solid modeling, reverse engineering, and Design for Additive Manufacturing (DFAM) optimization to turn your napkin sketches or raw concepts into production-ready physical parts."
  }
];

export default function FAQSection({ faqs = defaultFAQs }: { faqs?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqsList, setFaqsList] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await fetch("/api/faqs");
        const data = await res.json();
        if (data.success && data.faqs && data.faqs.length > 0) {
          setFaqsList(data.faqs);
        } else {
          setFaqsList(faqs);
        }
      } catch (err) {
        console.error("Error loading FAQs from API:", err);
        setFaqsList(faqs);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, [faqs]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Structured Data for Google FAQPage Rich Snippet
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqsList.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden border-t border-slate-200 dark:border-slate-900">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.03),transparent_50%)]" />

      {/* JSON-LD Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="dynamic-container relative z-10 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8 text-cyan-500 animate-pulse" />
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Questions</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
              Everything you need to know about our 3D printing services, materials, design, and order tracking.
            </p>
            <div className="h-1.5 w-20 bg-cyan-500 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {faqsList.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "border rounded-2xl transition-all duration-300 overflow-hidden",
                    isOpen
                      ? "bg-slate-50 dark:bg-slate-900/60 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.05)]"
                      : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pr-4 group-hover:text-cyan-400 transition-colors">
                      {faq.question}
                    </span>
                    <span className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-300",
                      isOpen
                        ? "bg-cyan-500 text-slate-950 scale-100 rotate-180"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}>
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>

                  <div
                    className={cn(
                      "transition-all duration-300 ease-in-out overflow-hidden",
                      isOpen ? "max-h-96 opacity-100 border-t border-slate-200 dark:border-slate-800/80" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="p-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
