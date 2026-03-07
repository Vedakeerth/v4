import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { Testimonial } from '@/types';
export type { Testimonial } from '@/types';

export async function getTestimonials(): Promise<Testimonial[]> {
    if (typeof window === 'undefined') {
        const { adminDb } = await import('./firebaseAdmin');
        try {
            const snapshot = await adminDb.collection('testimonials').orderBy('createdAt', 'desc').get();
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
}
