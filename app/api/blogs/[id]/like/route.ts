import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
    req: Request,
    { params }: any
) {
    try {
        const { id } = await params;
        const { increment } = await req.json();

        const blogRef = adminDb.collection('blogs').doc(id);
        const doc = await blogRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        await blogRef.update({
            likes: FieldValue.increment(increment ? 1 : -1)
        });

        const updatedDoc = await blogRef.get();
        const finalLikes = updatedDoc.data()?.likes || 0;

        return NextResponse.json({ success: true, likes: Math.max(0, finalLikes) });
    } catch (error) {
        console.error('Error updating likes:', error);
        return NextResponse.json({ success: false, message: 'Failed to update likes' }, { status: 500 });
    }
}
