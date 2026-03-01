import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#06b6d4", // cyan-500
                    foreground: "#000000",
                },
                secondary: {
                    DEFAULT: "#6366f1", // indigo-500
                    foreground: "#ffffff",
                },
                muted: {
                    DEFAULT: "#1e293b", // slate-800
                    foreground: "#94a3b8", // slate-400
                },
                accent: {
                    DEFAULT: "#0f172a", // slate-900
                    foreground: "#38bdf8", // sky-400
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
