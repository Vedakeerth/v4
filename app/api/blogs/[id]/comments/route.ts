import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
    req: Request,
    { params }: any
) {
    try {
        const { id } = await params;
        const { author, text } = await req.json();

        if (!author || !text) {
            return NextResponse.json({ success: false, message: 'Author and text are required' }, { status: 400 });
        }

        const blogRef = adminDb.collection('blogs').doc(id);
        const doc = await blogRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        const newComment = {
            id: `comment-${Date.now()}`,
            author,
            text,
            date: new Date().toISOString()
        };

        await blogRef.update({
            comments: FieldValue.arrayUnion(newComment)
        });

        return NextResponse.json({ success: true, comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ success: false, message: 'Failed to add comment' }, { status: 500 });
    }
}
