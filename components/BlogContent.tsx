"use client";

import React from "react";

interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    if (!content) return null;

    return (
        <article 
            className="prose prose-invert prose-cyan lg:prose-xl max-w-none prose-headings:font-extrabold prose-headings:uppercase prose-headings:tracking-tight prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg prose-strong:text-white prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-blockquote:border-l-cyan-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-img:rounded-3xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800 shadow-2xl shadow-cyan-900/5"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}
