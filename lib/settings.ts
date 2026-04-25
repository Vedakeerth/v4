
export interface SiteSettings {
    showTestimonials: boolean;
    showBlog: boolean;
    showCatalogs: boolean;
    showProjects: boolean;
    showMachinery: boolean;
    machineryDelay: number;
    heroTitle: string;
    heroSubtitle: string;
    // Products Page Settings
    showProjectsOnProducts: boolean;
    showProductsOnProducts: boolean;
    // Contact Info
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    footerAboutText: string;
    // Navbar & Footer Links
    navbarLinks: { name: string; href: string }[];
    footerLinks: { name: string; href: string }[];
    footerServiceLinks: { name: string; href: string }[];
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
    showProjectsOnProducts: false,
    showProductsOnProducts: true,
    contactEmail: "support@vaelinsa.com",
    contactPhone: "+91 XXXXXXXXXX",
    contactAddress: "Your Address Here",
    footerAboutText: "Premium additive manufacturing and design services for the modern engineer.",
    navbarLinks: [
        { name: "Service", href: "/services" },
        { name: "Products", href: "/products" },
        { name: "Blogs", href: "/blog" },
        { name: "Gallery", href: "/gallery" },
        { name: "Contact", href: "/contact" },
        { name: "Tracking Product", href: "/track-order" },
    ],
    footerLinks: [
        { name: "Product Catalog", href: "/catalog" },
        { name: "Track Your Order", href: "/track-order" },
        { name: "Blog & Updates", href: "/blog" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Return & Refund Policy", href: "/refunds" },
    ],
    footerServiceLinks: [
        { name: "FDM Printing", href: "/services#fdm" },
        { name: "SLA Resin", href: "/services#sla" },
        { name: "Product Design", href: "/services#design" },
        { name: "Rapid Prototyping", href: "/services#prototyping" },
    ]
};

export async function getSettings(): Promise<SiteSettings> {
    if (typeof window === 'undefined') {
        const { getAdminDb } = await import('./firebaseAdmin');
        const adminDb = await getAdminDb();
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
        const { getAdminDb } = await import('./firebaseAdmin');
        const adminDb = await getAdminDb();
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
