"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem("cookie-consent", "all");
        setIsVisible(false);
    };

    const handleAcceptNecessary = () => {
        localStorage.setItem("cookie-consent", "necessary");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-slate-900 border-t border-slate-700/60 px-4 py-4 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Text */}
                    <div className="flex items-start gap-3 flex-1">
                        <Cookie className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-slate-300 text-sm leading-relaxed">
                            We use cookies to improve your experience. By continuing, you agree to our{" "}
                            <a href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</a>.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 shrink-0 w-full sm:w-auto">
                        <button
                            onClick={handleAcceptNecessary}
                            className="flex-1 sm:flex-none px-5 py-2 border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-semibold transition-all text-xs uppercase tracking-wider"
                        >
                            Necessary Only
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            className="flex-1 sm:flex-none px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all text-xs uppercase tracking-wider"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
