import type { Metadata } from 'next';
import { PageSEO, SEOData } from '@/types';
export type { PageSEO, SEOData } from '@/types';

export async function getSEOData(): Promise<SEOData> {
    if (typeof window === 'undefined') {
        const { adminDb } = await import('./firebaseAdmin');
        try {
            const doc = await adminDb.collection('config').doc('seo').get();
            return (doc.data() as SEOData) || {};
        } catch (error) {
            console.error('Error fetching SEO data from Firestore:', error);
            return {};
        }
    } else {
        const res = await fetch('/api/seo');
        const data = await res.json();
        return data.seoData || {};
    }
}

export async function saveSEOData(data: SEOData) {
    if (typeof window === 'undefined') {
        const { adminDb } = await import('./firebaseAdmin');
        await adminDb.collection('config').doc('seo').set({
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } else {
        await fetch('/api/seo', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

export async function getPageMetadata(pageName: string): Promise<Metadata> {
    const seoData = await getSEOData();
    const pageSEO = seoData[pageName] || seoData['Home'] || {
        title: "VAELINSA | 3D Printing & Engineering Solutions",
        description: "Cutting edge technology for 3D printing, AI quotation, and engineering solutions.",
        keywords: "3d printing, cutting edge technology, AI quotation"
    };

    return {
        title: pageSEO.title,
        description: pageSEO.description,
        keywords: pageSEO.keywords,
    };
}
