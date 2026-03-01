"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { motion } from "framer-motion";

// Testimonial type
type Testimonial = {
    id: number;
    name: string;
    role: string;
    company: string;
    rating: number;
    text: string;
};

interface TestimonialsProps {
    header: { title: string; description: string };
    testimonials: Testimonial[];
}

export default function Testimonials({ header, testimonials: initialTestimonials }: TestimonialsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Data provided via props
    }, []);



    // Auto-scroll functionality with increased speed
    useEffect(() => {
        if (isLoading || isPaused) return;

        const startAutoScroll = () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }

            autoScrollIntervalRef.current = setInterval(() => {
                if (scrollContainerRef.current && !isPaused) {
                    const container = scrollContainerRef.current;
                    const { scrollLeft, scrollWidth, clientWidth } = container;
                    const scrollAmount = 1.2; // Reduced speed (1.2px per frame)

                    // Check if we've reached the end
                    if (scrollLeft >= scrollWidth - clientWidth - 1) {
                        // Reset to beginning for infinite loop
                        container.scrollTo({
                            left: 0,
                            behavior: 'auto'
                        });
                    } else {
                        // Continue scrolling
                        container.scrollBy({
                            left: scrollAmount,
                            behavior: 'auto'
                        });
                    }
                }
            }, 16); // Update every 16ms (~60fps) for smooth scrolling
        };

        startAutoScroll();

        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }
        };
    }, [isLoading, isPaused]);


    return (
        <section className="py-24 bg-slate-900 border-t border-slate-800 relative">
            <div className="container mx-auto px-4 relative">
                <div className="text-center mb-16">
                    {isLoading ? (
                        <>
                            <Skeleton variant="text" width="50%" height={32} className="mx-auto mb-4" />
                            <Skeleton variant="text" width="70%" height={20} className="mx-auto mb-4" />
                            <Skeleton variant="rounded" width={80} height={4} className="mx-auto" />
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {header.title}
                            </h2>
                            <p className="text-slate-400 max-w-xl mx-auto mb-4">
                                {header.description}
                            </p>
                            <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full" />
                        </motion.div>
                    )}
                </div>

                {/* Horizontal Scroll Container */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Gradient fade effects on edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2 -mx-2"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {isLoading ? (
                            <>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-shrink-0 w-[350px] p-6 bg-slate-800/50 border border-slate-700 rounded-xl"
                                    >
                                        <Skeleton variant="rounded" width={40} height={40} className="mb-4" />
                                        <Skeleton variant="text" width="60%" height={20} className="mb-2" />
                                        <Skeleton variant="text" width="80%" height={16} className="mb-4" />
                                        <Skeleton variant="text" width="100%" height={16} className="mb-1" />
                                        <Skeleton variant="text" width="90%" height={16} className="mb-1" />
                                        <Skeleton variant="text" width="85%" height={16} />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {/* Duplicate testimonials for seamless infinite scroll */}
                                {[...testimonials, ...testimonials].map((testimonial, index) => (
                                    <div
                                        key={`${testimonial.id}-${index}`}
                                        className="flex-shrink-0 w-[350px] group relative p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

                                        <div className="relative z-10">
                                            {/* Quote Icon */}
                                            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                                <Quote className="h-8 w-8 text-blue-400/50 group-hover:text-blue-400 transition-colors duration-300" />
                                            </div>

                                            {/* Testimonial Text */}
                                            <p className="text-slate-300 text-sm leading-relaxed mb-4 group-hover:text-slate-200 transition-colors duration-300">
                                                &ldquo;{testimonial.text}&rdquo;
                                            </p>



                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mb-6">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 transition-all duration-300 ${i < testimonial.rating
                                                            ? "text-yellow-400 fill-yellow-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                                            : "text-slate-600"
                                                            }`}
                                                        style={{
                                                            transitionDelay: `${i * 0.05}s`,
                                                        }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Author Info */}
                                            <div className="border-t border-slate-700 pt-4 group-hover:border-blue-500/30 transition-colors duration-300">
                                                <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors duration-300">
                                                    {testimonial.name}
                                                </h4>
                                                <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors duration-300">
                                                    {testimonial.role}
                                                </p>
                                                <p className="text-blue-400 text-xs mt-1 group-hover:text-blue-300 group-hover:underline transition-all duration-300">
                                                    {testimonial.company}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
