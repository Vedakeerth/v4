import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getBlogs } from "@/lib/blogs";
import { createSeoSlug } from "@/lib/seo-utils";
import Image from "next/image";
import Link from "next/link";
import { Clock, User, Calendar, ArrowRight } from "lucide-react";

export const metadata = {
    title: 'Blog - VAELINSA | Insights into 3D Printing & Robotics',
    description: 'Expert insights, tutorials, and latest news from the world of 3D printing and advanced manufacturing.',
};

export const revalidate = 0;

export default async function BlogPage() {
    const blogs = await getBlogs();

    return (
        <main className="min-h-screen bg-slate-950 pt-20 text-white">

            <div className="container mx-auto px-4 pt-12 pb-24">
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-8xl font-extrabold text-white mb-6 uppercase tracking-tight leading-none">
                        Vaelinsa <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">Insights</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
                        Deep dives into the future of manufacturing, robotics kits, and precision engineering.
                    </p>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-12 opacity-50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <Link key={blog.id} href={`/blog/${createSeoSlug(blog.title, blog.id)}`} className="group h-full">
                            <article className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-900/20 flex flex-col h-full active:scale-[0.98]">
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={blog.image}
                                        alt={blog.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-cyan-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                                            {blog.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 mb-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {blog.date}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {blog.readTime}
                                        </div>
                                    </div>

                                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors leading-tight tracking-tight">
                                        {blog.title}
                                    </h2>

                                    <p className="text-slate-400 text-sm/relaxed mb-6 line-clamp-3">
                                        {blog.excerpt}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-cyan-500 font-extrabold text-xs">
                                                {blog.author.charAt(0)}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-400">{blog.author}</span>
                                        </div>
                                        <div className="text-cyan-500/50 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all duration-300">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}
