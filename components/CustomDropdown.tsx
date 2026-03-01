"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption {
    value: string;
    label: string | React.ReactNode;
}

interface CustomDropdownProps {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
    icon?: React.ReactNode;
}

export default function CustomDropdown({
    value,
    options,
    onChange,
    label,
    className,
    placeholder = "Select an option",
    icon
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            {label && (
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-slate-950 border rounded-xl py-2.5 px-4 text-sm text-white flex items-center justify-between transition-all font-medium group",
                    isOpen
                        ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                )}
            >
                <div className="flex items-center gap-3 truncate">
                    {icon && <div className="text-slate-500 group-hover:text-cyan-400 transition-colors">{icon}</div>}
                    <span className="truncate">
                        {activeOption ? activeOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "h-4 w-4 text-slate-500 transition-all duration-300 shrink-0",
                    isOpen && "rotate-180 text-cyan-400"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-2 p-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] max-h-64 overflow-y-auto custom-scrollbar"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group/item",
                                    value === option.value
                                        ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_4px_12px_rgba(6,182,212,0.3)]"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                                {value === option.value && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="w-1.5 h-1.5 rounded-full bg-slate-950"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
