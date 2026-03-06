import { adminDb } from './firebaseAdmin';

export interface Comment {
    id: string;
    author: string;
    text: string;
    date: string;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    likes?: number;
    comments?: Comment[];
    hashtags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    createdAt?: string;
}

export async function getBlogs(): Promise<BlogPost[]> {
    if (typeof window === 'undefined') {
        try {
            const snapshot = await adminDb.collection('blogs').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({
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
