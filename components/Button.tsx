import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'whatsapp';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale";

    const variants = {
        primary: "bg-cyan-500 text-white hover:bg-cyan-400 hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 focus:ring-cyan-400",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 focus:ring-slate-400",
        outline: "bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white hover:scale-105 active:scale-95 focus:ring-cyan-400",
        ghost: "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400",
        success: "bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 focus:ring-emerald-400",
        whatsapp: "bg-[#25D366] text-white hover:bg-[#20bd5a] hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 focus:ring-green-400",
    };

    const sizes = {
        sm: "h-9 px-4 text-xs rounded-lg",
        md: "h-12 px-6 text-sm rounded-xl",
        lg: "h-14 px-8 text-base rounded-xl",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </button>
    );
}
