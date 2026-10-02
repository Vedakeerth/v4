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

        const blogs = await getBlogs();
        return blogs.find(b => b.id && String(b.id).endsWith(hashId));
    },
    [`blog-seo-${seoSlug}`],
    { revalidate: false, tags: [`blog-${seoSlug}`] }
)();

export const getBlogBySlug = (slug: string) => getBlogBySeoSlug(slug);
