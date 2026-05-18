import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface ColorSetting {
    name: string;
    multiplier: number;
    isAvailable: boolean;
    useCustomPrice?: boolean;
    customPrice?: number;
}

export interface DiscountTier {
    threshold: number;
    percentage: number;
}

export interface QuoteSettings {
    labourCost: number;
    materials: {
        [key: string]: {
            costPerKg: number;
            density: number;
            multiplier: number;
        }
    };
    colors: {
        [hex: string]: ColorSetting;
    };
    infillPatternMultipliers: {
        [pattern: string]: number;
    };
    discountTiers?: DiscountTier[];
}

export const DEFAULT_QUOTE_SETTINGS: QuoteSettings = {
    labourCost: 25,
    materials: {
        'PLA': { density: 1.24, costPerKg: 6750, multiplier: 1.0 },
        'ABS': { density: 1.04, costPerKg: 7000, multiplier: 1.0 },
        'PETG': { density: 1.27, costPerKg: 6850, multiplier: 1.0 },
        'TPU': { density: 1.21, costPerKg: 7500, multiplier: 1.0 },
    },
    colors: {
        '#2563eb': { name: 'Blue', multiplier: 1.0, isAvailable: true, useCustomPrice: true, customPrice: 2000 },
        '#ef4444': { name: 'Red', multiplier: 1.0, isAvailable: true, useCustomPrice: true, customPrice: 2000 },
        '#22c55e': { name: 'Green', multiplier: 1.0, isAvailable: true, useCustomPrice: true, customPrice: 2000 },
        '#eab308': { name: 'Yellow', multiplier: 1.0, isAvailable: true, useCustomPrice: true, customPrice: 2000 },
        '#ffffff': { name: 'White', multiplier: 1.0, isAvailable: true, useCustomPrice: true, customPrice: 2000 },
        '#000000': { name: 'Black', multiplier: 1.0, isAvailable: true, useCustomPrice: true, customPrice: 2000 },
    },
    infillPatternMultipliers: {
        'Line': 1.0,
        'Grid': 1.1,
        'Gyroid': 1.25,
        'Cubic': 1.15,
    },
    discountTiers: [
        { threshold: 1500, percentage: 5 },
        { threshold: 2500, percentage: 10 },
        { threshold: 3500, percentage: 20 },
    ]
};

export async function getQuoteSettings(): Promise<QuoteSettings> {
    try {
        const response = await fetch('/api/settings/quote');
        const json = await response.json();
        if (json.success && json.data) {
            return { ...DEFAULT_QUOTE_SETTINGS, ...json.data } as QuoteSettings;
        }
        return DEFAULT_QUOTE_SETTINGS;
    } catch (error) {
        console.error('Error fetching quote settings via API:', error);
        return DEFAULT_QUOTE_SETTINGS;
    }
}

export async function saveQuoteSettings(settings: QuoteSettings) {
    const docRef = doc(db, 'settings', 'quote');
    await setDoc(docRef, settings);
}
