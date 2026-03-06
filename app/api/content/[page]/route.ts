import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ page: string }> }
) {
    const { page } = await params;
    try {
        const doc = await adminDb.collection('pages').doc(page).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json(doc.data());
    } catch (error) {
        console.error(`Error reading page ${page}:`, error);
        return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
    }
}
