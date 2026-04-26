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
    { revalidate: 10, tags: ['products'] }
);

export const getPopularProducts = unstable_cache(
    async (limitCount: number = 3): Promise<Product[]> => {
        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            let products: Product[] = [];
            try {
                const snapshot = await adminDb.collection('products')
                    .where('isPopular', '==', true)
                    .orderBy('createdAt', 'desc')
                    .limit(limitCount)
                    .get();
                
                products = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                    id: doc.id,
                    ...doc.data()
                } as Product));
            } catch (error) {
                console.error('Error fetching popular products (likely missing index):', error);
                // Continue to fallback
            }

            // Fallback: If no popular products (or query failed), return the latest X products
            if (products.length === 0) {
                try {
                    const fallbackSnapshot = await adminDb.collection('products')
                        .orderBy('createdAt', 'desc')
                        .limit(limitCount)
                        .get();
                    products = fallbackSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                        id: doc.id,
                        ...doc.data()
                    } as Product));
                } catch (fallbackError) {
                    console.error('Error in popular products fallback:', fallbackError);
                }
            }
            return products;
        }
        return [];
    },
    ['popular-products-v2'],
    { revalidate: 10, tags: ['products', 'popular'] }
);

export const getProductBySeoSlug = (seoSlug: string) => unstable_cache(
    async (): Promise<Product | undefined> => {
        const { extractIdFromSlug } = await import('./seo-utils');
        const hashId = extractIdFromSlug(seoSlug);
        if (!hashId) return undefined;

        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            
            // 1. Try finding by direct ID match (most reliable)
            try {
                const doc = await adminDb.collection('products').doc(hashId).get();
                if (doc.exists) return { id: doc.id, ...doc.data() } as Product;
            } catch (e) { /* ignore */ }

            // 2. Try finding by 'hash' field match
            const snapshot = await adminDb.collection('products').where('hash', '==', hashId).limit(1).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() } as Product;
            }

            // 3. Last resort: Fetch all and find if ID ends with hashId
            // This is for cases like "custom-fixture-6" where '6' is the suffix
            const allSnapshot = await adminDb.collection('products').get();
            const found = allSnapshot.docs.find((doc: any) => doc.id.endsWith(hashId));
            if (found) return { id: found.id, ...found.data() } as Product;

            return undefined;
        } else {
            const products = await getProducts();
            return products.find(p => p.id === hashId || p.id.endsWith(hashId));
        }
    },
    [`product-seo-${seoSlug}`],
    { revalidate: 10, tags: [`product-${seoSlug}`] }
)();

export const getProductById = (id: string) => getProductBySeoSlug(id);
