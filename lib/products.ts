import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { Product } from '@/types';
import { unstable_cache } from 'next/cache';
export type { Product } from '@/types';

export const getProducts = unstable_cache(
    async (): Promise<Product[]> => {
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
        }
        return [];
    },
    ['products-list'],
    { revalidate: 3600, tags: ['products'] }
);

export const getPopularProducts = unstable_cache(
    async (limitCount: number = 3): Promise<Product[]> => {
        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            try {
                const snapshot = await adminDb.collection('products')
                    .where('isPopular', '==', true)
                    .orderBy('createdAt', 'desc')
                    .limit(limitCount)
                    .get();
                return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                    id: doc.id,
                    ...doc.data()
                } as Product));
            } catch (error) {
                console.error('Error fetching popular products:', error);
                return [];
            }
        }
        return [];
    },
    ['popular-products'],
    { revalidate: 3600, tags: ['products', 'popular'] }
);

export const getProductById = (id: string) => unstable_cache(
    async (): Promise<Product | undefined> => {
        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            const doc = await adminDb.collection('products').doc(id).get();
            if (!doc.exists) return undefined;
            return { id: doc.id, ...doc.data() } as Product;
        }
        return undefined;
    },
    [`product-${id}`],
    { revalidate: 3600, tags: [`product-${id}`] }
)();
