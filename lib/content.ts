import { unstable_cache } from 'next/cache';

export const getPageContent = (page: string) => unstable_cache(
    async (page: string) => {
        if (typeof window === 'undefined') {
            const { adminDb } = await import('./firebaseAdmin');
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
        }
        return null;
    },
    [`page-content-${page}`],
    { revalidate: 3600, tags: [`content-${page}`] }
)(page);
