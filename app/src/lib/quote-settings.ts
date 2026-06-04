// Minimal stub for Quote Settings
import type { QuoteSettings as QS } from "@/types";
export const DEFAULT_QUOTE_SETTINGS: QS = {
    labourCost: 25,
    materials: {},
    colors: {},
    PatternMultipliers: {}
} as any;
export function getQuoteSettings(): Promise<QS> { return Promise.resolve(DEFAULT_QUOTE_SETTINGS); }
export function saveQuoteSettings(_: QS): Promise<void> { return Promise.resolve(); }
export type QuoteSettings = QS;
