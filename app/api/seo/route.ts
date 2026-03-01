import { NextResponse } from 'next/server';
import { getSEOData, saveSEOData, SEOData } from '@/lib/seo';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    try {
        const seoData = getSEOData();
        return NextResponse.json({ success: true, seoData });
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
        const currentData = getSEOData();
        const updatedData = { ...currentData, ...body };

        saveSEOData(updatedData);

        return NextResponse.json({ success: true, message: 'SEO data updated successfully' });
    } catch (error) {
        console.error('Error updating SEO data:', error);
        return NextResponse.json({ success: false, message: 'Failed to update SEO data' }, { status: 500 });
    }
}
