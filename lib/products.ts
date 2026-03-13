import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { Product } from '@/types';
export type { Product } from '@/types';

export async function getProducts(): Promise<Product[]> {
    if (typeof window === 'undefined') {
        const { getAdminDb } = await import('./firebaseAdmin');
        const adminDb = await getAdminDb();
        try {
            const snapshot = await adminDb.collection('products').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                id: doc.id,
                ...doc.data()
            } as Product));
        } catch (error) {
            console.error('Error fetching products from Firestore:', error);
            return [];
        }
    } else {
        const res = await fetch('/api/products');
        const data = await res.json();
        return data.products || [];
    }
}

export async function getProductById(id: string): Promise<Product | undefined> {
    if (typeof window === 'undefined') {
        const { getAdminDb } = await import('./firebaseAdmin');
        const adminDb = await getAdminDb();
        const doc = await adminDb.collection('products').doc(id).get();
        if (!doc.exists) return undefined;
        return { id: doc.id, ...doc.data() } as Product;
    } else {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        return data.product;
    }
}
