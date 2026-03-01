import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave';
}

export function Skeleton({ 
    className, 
    variant = 'rectangular', 
    width, 
    height,
    animation = 'pulse'
}: SkeletonProps) {
    const baseClasses = cn(
        animation === 'pulse' ? "bg-slate-800 animate-pulse" : "animate-shimmer",
        variant === 'text' && "rounded h-4",
        variant === 'circular' && "rounded-full",
        variant === 'rectangular' && "rounded",
        variant === 'rounded' && "rounded-lg",
        className
    );

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return <div className={baseClasses} style={style} />;
}

// Pre-built skeleton components
export function ProductCardSkeleton() {
    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
            <Skeleton variant="rectangular" height={256} className="w-full" />
            <div className="p-6 space-y-4">
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="60%" height={16} />
                <div className="flex items-center justify-between pt-2">
                    <Skeleton variant="text" width={80} height={24} />
                    <Skeleton variant="rounded" width={120} height={36} />
                </div>
            </div>
        </div>
    );
}

export function GallerySkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function ImageSkeleton({ className }: { className?: string }) {
    return <Skeleton variant="rounded" className={cn("w-full h-full", className)} />;
}

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton 
                    key={i} 
                    variant="text" 
                    width={i === lines - 1 ? "80%" : "100%"} 
                />
            ))}
        </div>
    );
}

export function ButtonSkeleton({ className }: { className?: string }) {
    return <Skeleton variant="rounded" width={120} height={40} className={className} />;
}
