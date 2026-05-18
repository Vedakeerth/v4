import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parsePrice(price: string | number | undefined): number {
  if (price === undefined) return 0;
  if (typeof price === "number") return price;
  return parseFloat(price.replace(/[^0-9.-]+/g, "")) || 0;
}

export function formatINR(price: string | number): string {
  const numericPrice = typeof price === "number" ? price : parsePrice(price);
  return `₹${numericPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/-`;
}

export function validatePhone(phone: string): boolean {
  const re = /^(?:\+91|0)?[6-9]\d{9}$/;
  return re.test(phone.replace(/\s/g, ""));
}

export function getColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    '#000000': 'Black',
    '#ffffff': 'White',
    '#ef4444': 'Red',
    '#22c55e': 'Green',
    '#2563eb': 'Blue',
    '#eab308': 'Yellow',
    '#64748b': 'Slate',
    '#94a3b8': 'Slate Light',
    '#334155': 'Navy',
    '#0f172a': 'Deep Navy',
    '#f8fafc': 'Cloud',
    '#f1f5f9': 'Mist',
    '#e2e8f0': 'Gravel',
    '#cbd5e1': 'Stone',
    '#475569': 'Coal',
    '#1e293b': 'Shadow',
    '#facc15': 'Electric Yellow',
    '#fbbf24': 'Amber',
    '#f59e0b': 'Orange',
    '#ea580c': 'Flame',
    '#dc2626': 'Crimson',
    '#b91c1c': 'Ruby',
    '#991b1b': 'Maroon',
    '#16a34a': 'Emerald',
    '#15803d': 'Forest',
    '#166534': 'Moss',
    '#2dd4bf': 'Teal',
    '#0d9488': 'Ocean',
    '#06b6d4': 'Cyan',
    '#0891b2': 'Pacific',
    '#1d4ed8': 'Indigo',
    '#8b5cf6': 'Violet',
    '#7c3aed': 'Purple',
    '#a855f7': 'Lavender',
    '#d946ef': 'Magenta',
    '#c026d3': 'Orchid',
    '#db2777': 'Pink',
    '#be185d': 'Rose'
  };

  return colorMap[hex.toLowerCase()] || hex;
}
