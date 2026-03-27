import { unstable_cache } from 'next/cache';

export const getTestimonials = unstable_cache(
    async (limitCount: number = 10): Promise<Testimonial[]> => {
        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            try {
                const snapshot = await adminDb.collection('testimonials')
                    .orderBy('createdAt', 'desc')
                    .limit(limitCount)
                    .get();
                return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                    id: doc.id,
                    ...doc.data()
                } as Testimonial));
            } catch (error) {
                console.error('Error fetching testimonials from Firestore:', error);
                return [];
            }
        } else {
            const res = await fetch('/api/testimonials');
            const data = await res.json();
            return data.testimonials || [];
        }
    },
    ['testimonials-list'],
    { revalidate: 3600, tags: ['testimonials'] }
);
