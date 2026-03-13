import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { BlogPost } from '@/types';
export type { BlogPost, Comment } from '@/types';

export async function getBlogs(): Promise<BlogPost[]> {
    if (typeof window === 'undefined') {
        const { getAdminDb } = await import('./firebaseAdmin');
        const adminDb = await getAdminDb();
        try {
            const snapshot = await adminDb.collection('blogs').orderBy('createdAt', 'desc').get();
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
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | undefined> {
    const blogs = await getBlogs();
    return blogs.find(b => b.slug === slug);
}
