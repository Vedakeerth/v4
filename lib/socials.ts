import socialsData from '../data/socials.json';

export interface SocialLink {
    id: string;
    name: string;
    url: string;
    icon: string;
}

export async function getSocials(): Promise<SocialLink[]> {
    if (typeof window === 'undefined') {
        const { getAdminDb } = await import('./firebaseAdmin');
        const adminDb = await getAdminDb();
        try {
            const doc = await adminDb.collection('config').doc('socials').get();
            if (doc.exists) {
                const data = doc.data();
                if (data?.links) return data.links as SocialLink[];
            }
        } catch (error) {
            console.error('Error fetching socials from Firestore:', error);
        }
    }
    // Fallback to local data
    return socialsData as SocialLink[];
}

export async function saveSocials(socials: SocialLink[]) {
    if (typeof window === 'undefined') {
        const { getAdminDb } = await import('./firebaseAdmin');
        const adminDb = await getAdminDb();
        await adminDb.collection('config').doc('socials').set({
            links: socials,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    }
}
