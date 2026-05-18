import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { Product } from '@/types';
import { unstable_cache } from 'next/cache';
export function generateProductCode(category: string): string {
    const words = (category || 'Uncategorized').split(' ').filter(w => w.length > 0);
    let prefix = "";
    if (words.length >= 2) {
        prefix = (words[0][0] + (words[1] ? words[1][0] : '')).toUpperCase();
    } else if (words.length === 1) {
        prefix = words[0].substring(0, 2).toUpperCase();
    } else {
        prefix = "PR";
    }
    // Limit prefix to 3 chars max for shortness
    prefix = prefix.slice(0, 3);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
}

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
                // Workaround: Fetch recent products and filter in memory to avoid "Missing Index" error
                // This uses the default single-field index on 'createdAt'.
                const snapshot = await adminDb.collection('products')
                    .orderBy('createdAt', 'desc')
                    .limit(50) 
                    .get();
                
                products = snapshot.docs
                    .map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                        id: doc.id,
                        ...doc.data()
                    } as Product))
                    .filter((p: Product) => p.isPopular === true)
                    .slice(0, limitCount);

            } catch (error) {
                console.error('Error fetching popular products (memory-filter workaround):', error);
                // The fallback below will handle returning latest products if memory filter yielded 0
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
