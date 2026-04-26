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
            
            // Search in 'products' by 'hash' field
            const snapshot = await adminDb.collection('products').where('hash', '==', hashId).limit(1).get();
            if (snapshot.empty) {
                // Fallback to searching by document ID if hashId matches length
                if (hashId.length >= 20) {
                    const doc = await adminDb.collection('products').doc(hashId).get();
                    if (doc.exists) return { id: doc.id, ...doc.data() } as Product;
                }
                return undefined;
            }
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Product;
        } else {
            const products = await getProducts();
            return products.find(p => p.id.endsWith(hashId));
        }
    },
    [`product-seo-${seoSlug}`],
    { revalidate: 10, tags: [`product-${seoSlug}`] }
)();

export const getProductById = (id: string) => getProductBySeoSlug(id);
