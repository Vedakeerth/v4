import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { BlogPost } from '@/types';
import { unstable_cache } from 'next/cache';

export const getBlogs = unstable_cache(
    async (limitCount: number = 5): Promise<BlogPost[]> => {
        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            try {
                const snapshot = await adminDb.collection('blogs')
                    .orderBy('createdAt', 'desc')
                    .limit(limitCount)
                    .get();
                return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                    id: doc.id,
                    ...doc.data()
                } as BlogPost));
            } catch (error) {
                console.error('Error fetching blogs from Firestore:', error);
                return [];
            }
        } else {
            const res = await fetch('/api/blogs');
            const data = await res.json();
            return data.blogs || [];
        }
    },
    ['blogs-list'],
    { revalidate: false, tags: ['blogs'] }
);

export const getBlogBySeoSlug = (seoSlug: string) => unstable_cache(
    async (): Promise<BlogPost | undefined> => {
        const { extractIdFromSlug } = await import('./seo-utils');
        const hashId = extractIdFromSlug(seoSlug);
        if (!hashId) return undefined;

        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            
            // First try fetching by ID (if hashId was the actual doc ID or slice)
            // But requirement says "decode to get original ID"
            // For now, assume it's the doc ID slice or stored 'hash'
            const snapshot = await adminDb.collection('blogs').where('hash', '==', hashId).limit(1).get();
            if (snapshot.empty) {
                // Fallback to searching by document ID if hashId matches length
                if (hashId.length >= 20) {
                    const doc = await adminDb.collection('blogs').doc(hashId).get();
                    if (doc.exists) return { id: doc.id, ...doc.data() } as BlogPost;
                }
                return undefined;
            }
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as BlogPost;
        } else {
            const blogs = await getBlogs();
            return blogs.find(b => b.id.endsWith(hashId));
        }
    },
    [`blog-seo-${seoSlug}`],
    { revalidate: false, tags: [`blog-${seoSlug}`] }
)();

export const getBlogBySlug = (slug: string) => getBlogBySeoSlug(slug);
