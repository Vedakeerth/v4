import { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin';

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    rating: number;
    text: string;
    image?: string;
    createdAt?: string;
}

export async function getTestimonials(): Promise<Testimonial[]> {
    if (typeof window === 'undefined') {
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
