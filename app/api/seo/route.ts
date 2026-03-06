import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export interface SEOData {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    twitterHandle?: string;
    [key: string]: any;
}

export async function GET() {
    try {
        const doc = await adminDb.collection('config').doc('seo').get();
        if (!doc.exists) {
            return NextResponse.json({ success: true, seoData: {} });
        }
        return NextResponse.json({ success: true, seoData: doc.data() });
    } catch (error) {
        console.error('Error fetching SEO data:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch SEO data' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body: SEOData = await req.json();
        await adminDb.collection('config').doc('seo').set({
            ...body,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({ success: true, message: 'SEO data updated successfully' });
    } catch (error) {
        console.error('Error updating SEO data:', error);
        return NextResponse.json({ success: false, message: 'Failed to update SEO data' }, { status: 500 });
    }
}
