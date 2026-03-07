import { adminDb } from './firebaseAdmin';

export interface SiteSettings {
    showTestimonials: boolean;
    showBlog: boolean;
    showCatalogs: boolean;
    showProjects: boolean;
    showMachinery: boolean;
    machineryDelay: number;
    heroTitle: string;
    heroSubtitle: string;
    // Features Page Settings
    showProjectsOnFeatures: boolean;
    showProductsOnFeatures: boolean;
}

const defaultSettings: SiteSettings = {
    showTestimonials: true,
    showBlog: true,
    showCatalogs: true,
    showProjects: true,
    showMachinery: true,
    machineryDelay: 0,
    heroTitle: "Future of 3D Printing",
    heroSubtitle: "Innovating the world one layer at a time.",
    showProjectsOnFeatures: false,
    showProductsOnFeatures: true
};

export async function getSettings(): Promise<SiteSettings> {
    if (typeof window === 'undefined') {
        const { adminDb } = await import('./firebaseAdmin');
        try {
            const doc = await adminDb.collection('config').doc('settings').get();
            if (!doc.exists) return defaultSettings;
            return { ...defaultSettings, ...doc.data() } as SiteSettings;
        } catch (error) {
            console.error('Error fetching settings from Firestore:', error);
            return defaultSettings;
        }
    } else {
        // On client, fetch from API
        const res = await fetch('/api/settings');
        const data = await res.json();
        return data.settings || defaultSettings;
    }
}

export async function saveSettings(settings: SiteSettings) {
    if (typeof window === 'undefined') {
        const { adminDb } = await import('./firebaseAdmin');
        await adminDb.collection('config').doc('settings').set({
            ...settings,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } else {
        await fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    }
}
