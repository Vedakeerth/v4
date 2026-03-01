"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Chrome } from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

export default function SecureLoginPage() {
    const router = useRouter();
    const { status } = useSession();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/secure-management-portal/dashboard");
        }
    }, [status, router]);

    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setIsLoading(false);
            } else {
                router.push("/secure-management-portal/dashboard");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-block mb-4">
                            <h1 className="text-3xl font-bold text-white tracking-widest">VAELINSA</h1>
                        </Link>
                        <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
                        <p className="text-slate-400 text-sm">Secure Management Portal</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                required
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInput}
                                placeholder="name@company.com"
                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <input
                                required
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInput}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest mt-8 font-bold">
                            Authorized personnel only
                        </p>
                    </form>

                    <div className="mt-10 text-center pt-6 border-t border-slate-800">
                        <Link href="/" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                            ← Back to main website
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
