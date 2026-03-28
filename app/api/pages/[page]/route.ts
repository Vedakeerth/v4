import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: any
) {
    const { page } = await params;
    try {
        const doc = await adminDb.collection('pages').doc(page).get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: "Page content not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, content: doc.data() });
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        return NextResponse.json({ success: false, message: "Error fetching page content" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: any
) {
    const { page } = await params;
    try {
        const authenticated = await isAuthenticated();
        const body = await request.json();

        await adminDb.collection('pages').doc(page).set({
            ...body,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({ success: true, message: "Page content updated" });
    } catch (error) {
        console.error(`Error updating page ${page}:`, error);
        return NextResponse.json({ success: false, message: "Error saving page content" }, { status: 500 });
    }
}
