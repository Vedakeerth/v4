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
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const settingsFile = path.join(process.cwd(), 'data', 'settings.json');
            const fileContents = await fs.readFile(settingsFile, 'utf8');
            return JSON.parse(fileContents);
        } catch (error) {
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
        const fs = await import('fs/promises');
        const path = await import('path');
        const settingsFile = path.join(process.cwd(), 'data', 'settings.json');
        await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
    }
}
