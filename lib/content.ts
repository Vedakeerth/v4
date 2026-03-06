import { adminDb } from './firebaseAdmin';

export async function getPageContent(page: string) {
    if (typeof window === 'undefined') {
        try {
            const doc = await adminDb.collection('pages').doc(page).get();
            if (!doc.exists) {
                console.warn(`Content for page "${page}" not found in Firestore.`);
                return null;
            }
            return doc.data();
        } catch (error) {
            console.error(`Error loading content for ${page} from Firestore:`, error);
            return null;
        }
    } else {
        // On client, fetch from API
        const res = await fetch(`/api/content/${page}`);
        const data = await res.json();
        return data || null;
    }
}
