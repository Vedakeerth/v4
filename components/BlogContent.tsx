"use client";

import React from "react";
import Image from "next/image";

interface BlogContentProps {
    content: string;
}

// Helper to parse inline markdown (bold, italic)
const parseInlineContent = (text: string) => {
    if (!text) return null;

    // Regex for bold (**text**) and italic (*text*)
    // We split by these patterns keeping the delimiters
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

export default function BlogContent({ content }: BlogContentProps) {
    if (!content) return null;

    return (
        <article className="prose prose-invert prose-cyan lg:prose-xl max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-slate-400 prose-p:leading-[1.8] prose-p:text-lg prose-strong:text-white prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-blockquote:border-l-cyan-500 prose-blockquote:bg-slate-900/50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-img:rounded-3xl prose-img:border prose-img:border-slate-800 shadow-2xl shadow-cyan-900/5">
            {content.split('\n\n').map((para, i) => {
                // Handling Headings
                if (para.startsWith('###')) {
                    const headingText = para.replace(/^###\s*/, '').trim();
                    return <h3 key={i} className="text-3xl font-black text-white mt-16 mb-8 uppercase tracking-tighter border-l-4 border-cyan-500 pl-6">{parseInlineContent(headingText)}</h3>;
                }
                if (para.startsWith('####')) {
                    const headingText = para.replace(/^####\s*/, '').trim();
                    return <h4 key={i} className="text-2xl font-black text-white mt-12 mb-6 uppercase tracking-tight">{parseInlineContent(headingText)}</h4>;
                }

                // Handling Lists
                if (para.startsWith('1.') || para.startsWith('- ')) {
                    const lines = para.split('\n');
                    const isOrdered = lines[0].trim().startsWith('1.');
                    return (
                        <ul key={i} className="space-y-6 my-10 bg-slate-900/30 p-10 rounded-3xl border border-slate-900">
                            {lines.map((li, j) => {
                                const lineContent = isOrdered ? li.split('.').slice(1).join('.').trim() : li.replace(/^[*-]\s*/, '').trim();
                                const marker = isOrdered ? li.split('.')[0] + '.' : '•';
                                return (
                                    <li key={j} className="text-slate-400 flex gap-4 text-lg">
                                        <span className="text-cyan-500 font-black flex-shrink-0">{marker}</span>
                                        <span>{parseInlineContent(lineContent)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    );
                }

                // Basic image support: ![alt](url)
                const imgMatch = para.match(/!\[(.*?)\]\((.*?)\)/);
                if (imgMatch) {
                    return (
                        <div key={i} className="my-12 group cursor-zoom-in">
                            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                                <Image
                                    src={imgMatch[2]}
                                    alt={imgMatch[1] || "Blog image"}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    unoptimized={imgMatch[2].startsWith('http')}
                                />
                            </div>
                            {imgMatch[1] && <span className="block text-center text-xs text-slate-600 mt-4 font-bold uppercase tracking-widest">{imgMatch[1]}</span>}
                        </div>
                    );
                }

                return <p key={i} className="mb-8 whitespace-pre-wrap">{parseInlineContent(para)}</p>;
            })}
        </article>
    );
}
