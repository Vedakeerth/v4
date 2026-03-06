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
  return `₹${numericPrice.toLocaleString("en-IN")}`;
}
