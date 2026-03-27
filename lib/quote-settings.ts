import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface QuoteSettings {
    labourCost: number;
    materials: {
        [key: string]: {
            costPerKg: number;
            density: number;
            multiplier: number;
        }
    };
    colorMultipliers: {
        [hex: string]: number;
    };
    infillPatternMultipliers: {
        [pattern: string]: number;
    };
}

export const DEFAULT_QUOTE_SETTINGS: QuoteSettings = {
    labourCost: 25,
    materials: {
        'PLA': { density: 1.24, costPerKg: 1800, multiplier: 1.0 },
        'ABS': { density: 1.04, costPerKg: 2000, multiplier: 1.2 },
        'PETG': { density: 1.27, costPerKg: 1900, multiplier: 1.1 },
        'TPU': { density: 1.21, costPerKg: 3000, multiplier: 1.5 },
    },
    colorMultipliers: {
        '#2563eb': 1.0, // Blue
        '#ef4444': 1.0, // Red
        '#22c55e': 1.0, // Green
        '#eab308': 1.0, // Yellow
        '#ffffff': 1.0, // White
        '#000000': 1.0, // Black
    },
    infillPatternMultipliers: {
        'Line': 1.0,
        'Grid': 1.1,
        'Gyroid': 1.25,
        'Cubic': 1.15,
    }
};

export async function getQuoteSettings(): Promise<QuoteSettings> {
    try {
        const docRef = doc(db, 'settings', 'quote');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...DEFAULT_QUOTE_SETTINGS, ...docSnap.data() } as QuoteSettings;
        }
        return DEFAULT_QUOTE_SETTINGS;
    } catch (error) {
        console.error('Error fetching quote settings:', error);
        return DEFAULT_QUOTE_SETTINGS;
    }
}

export async function saveQuoteSettings(settings: QuoteSettings) {
    const docRef = doc(db, 'settings', 'quote');
    await setDoc(docRef, settings);
}
