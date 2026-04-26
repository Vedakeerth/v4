import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const docSnap = await adminDb.collection('settings').doc('quote').get();
        if (docSnap.exists) {
            return NextResponse.json({ success: true, data: docSnap.data() });
        }
        return NextResponse.json({ success: true, data: null });
    } catch (error) {
        console.error('Error fetching quote settings from admin:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
