"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getAdminEmails } from "@/lib/adminConfig";

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const adminEmails = getAdminEmails();
                if (user.email && adminEmails.includes(user.email.toLowerCase())) {
                    router.push("/admin/dashboard");
                }
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const adminEmails = getAdminEmails();

            if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
                setError("Access Denied: You do not have admin permissions.");
                await firebaseSignOut(auth);
                setIsLoading(false);
                return;
            }

            router.push("/admin/dashboard");
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Authentication failed.");
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">Admin Portal</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Sign in with authorized Google account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-4 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white font-black rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-800 shadow-xl uppercase tracking-widest text-xs"
                >
                    {isLoading ? (
                        <div className="h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <div className="mt-10 text-center pt-6 border-t border-slate-200 dark:border-slate-800">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors">
                        ← Back to main website
                    </Link>
                </div>
            </div>
        </main>
    );
}
