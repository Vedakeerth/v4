import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

import { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    slug: string;
    author: string;
    date: string;
    category: string;
    image: string;
    tags?: string[];
    createdAt?: string;
}

// GET all blogs
export async function GET() {
    try {
        const snapshot = await adminDb.collection('blogs').orderBy('createdAt', 'desc').get();
        const blogs = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json({ success: true, blogs });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch blogs' }, { status: 500 });
    }
}

// POST - Create new blog (requires auth)
export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const slug = body.slug || body.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

        const newBlog = {
            ...body,
            slug,
            createdAt: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-GB')
        };

        const docRef = await adminDb.collection('blogs').add(newBlog);

        return NextResponse.json({
            success: true,
            blog: { id: docRef.id, ...newBlog },
            message: 'Blog created successfully'
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to create blog' }, { status: 500 });
    }
}
