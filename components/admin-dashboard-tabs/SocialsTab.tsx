"use client";

import React, { useState, useEffect } from "react";
import { Share2, Save } from "lucide-react";
import { type SocialLink } from "@/lib/socials";

export default function SocialsTab() {
    const [socials, setSocials] = useState<SocialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSocials();
    }, []);

    const fetchSocials = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/socials");
            const data = await res.json();
            if (data.success) setSocials(data.socials);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("/api/socials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(socials),
            });
            if (res.ok) alert("Social links saved!");
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div className="text-white">Loading social links...</div>;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
                <Share2 className="text-cyan-400" size={24} />
                <h2 className="text-xl font-bold text-white">Social Media Profiles</h2>
            </div>
            <div className="space-y-4">
                {socials.map((link, idx) => (
                    <div key={link.id} className="flex gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800 items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-500">
                            <Share2 size={20} />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <input
                                value={link.name}
                                readOnly
                                className="bg-transparent border-none text-white font-bold text-sm outline-none"
                            />
                            <input
                                value={link.url}
                                onChange={(e) => {
                                    const next = [...socials];
                                    next[idx].url = e.target.value;
                                    setSocials(next);
                                }}
                                placeholder="https://..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:border-cyan-500/50 outline-none"
                            />
                        </div>
                    </div>
                ))}
                <button
                    onClick={handleSave}
                    className="w-full py-4 mt-6 bg-cyan-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                    <Save size={20} />
                    Update Social Links
                </button>
            </div>
        </div>
    );
}
