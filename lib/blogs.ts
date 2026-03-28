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
    { revalidate: 3600, tags: ['blogs'] }
);

export const getBlogBySlug = (slug: string) => unstable_cache(
    async (): Promise<BlogPost | undefined> => {
        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            const snapshot = await adminDb.collection('blogs').where('slug', '==', slug).limit(1).get();
            if (snapshot.empty) return undefined;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as BlogPost;
        } else {
            const blogs = await getBlogs();
            return blogs.find(b => b.slug === slug);
        }
    },
    [`blog-${slug}`],
    { revalidate: 3600, tags: [`blog-${slug}`] }
)();
