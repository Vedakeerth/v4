"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword } from "firebase/auth";

const ADMIN_EMAIL = "vaelinsa@gmail.com";

function LoginContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState("");

    // Firebase Auth State Listener for persistence and auto-redirect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                if (firebaseUser.email?.toLowerCase() === ADMIN_EMAIL) {
                    router.push("/secure-management-portal/admin");
                } else {
                    // Logged in but not admin - stay here and show error if it was a recent attempt
                    // Note: handleGoogleSignIn will handle the signout for new attempts
                }
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setFormError("");
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
                setFormError("Access Denied: You do not have admin permissions.");
                await signOut({ redirect: false });
                await firebaseSignOut(auth);
                setIsGoogleLoading(false);
                return;
            }

            // Get ID Token for NextAuth synchronization
            const idToken = await user.getIdToken();
            await signIn("firebase", {
                idToken,
                redirect: false,
                callbackUrl: "/secure-management-portal/admin"
            });

            window.location.href = "/secure-management-portal/admin";
        } catch (err: any) {
            console.error("Login error:", err);
            setFormError(err.message || "Authentication failed.");
            setIsGoogleLoading(false);
        }
    };

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError("");

        try {
            // Firebase Sign In with Email/Password
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;

            if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
                setFormError("Access Denied: Unauthorized account.");
                await signOut({ redirect: false });
                await firebaseSignOut(auth);
                setIsLoading(false);
                return;
            }

            // Sync with NextAuth
            const idToken = await user.getIdToken();
            await signIn("firebase", {
                idToken,
                redirect: false,
                callbackUrl: "/secure-management-portal/admin"
            });

            window.location.href = "/secure-management-portal/admin";
        } catch (err: any) {
            setFormError(err.code === "auth/invalid-credential" ? "Invalid email or password" : err.message);
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

                    {(error || formError) && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase tracking-wider">Access Error</span>
                                <span className="text-sm">
                                    {formError || (error === "AccessDenied"
                                        ? "Unauthorized: This Google account does not have admin permissions."
                                        : "Authentication failed. Please check your credentials or try again later.")}
                                </span>
                                {(isGoogleLoading || isLoading) && (
                                    <Link href="/secure-management-portal/dashboard" className="text-[10px] underline hover:text-white mt-1">
                                        Click here if not redirected automatically
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleCredentialsSignIn} className="space-y-4 mb-8">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                                placeholder="admin@vaelinsa.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest text-xs mt-2"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Login with Password"
                            )}
                        </button>
                    </form>

                    <div className="relative flex items-center gap-4 mb-8">
                        <div className="flex-1 border-t border-slate-800"></div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-900 px-2 relative -top-[1px]">OR</span>
                        <div className="flex-1 border-t border-slate-800"></div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full py-4 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest text-xs"
                    >
                        {isGoogleLoading ? (
                            <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest mt-8 font-bold">
                        Authorized personnel only
                    </p>

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

export default function SecureLoginPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </main>
        }>
            <LoginContent />
        </Suspense>
    );
}
