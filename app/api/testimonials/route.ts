import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    rating: number;
    text: string;
    image?: string;
    createdAt?: string;
}

// GET all testimonials
export async function GET() {
    try {
        const snapshot = await adminDb.collection('testimonials').orderBy('createdAt', 'desc').get();
        const testimonials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json({ success: true, testimonials });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

// POST - Add new testimonial (requires auth)
export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const newTestimonial = {
            ...body,
            rating: Math.min(5, Math.max(1, parseInt(body.rating?.toString()) || 5)),
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminDb.collection('testimonials').add(newTestimonial);

        return NextResponse.json({
            success: true,
            testimonial: { id: docRef.id, ...newTestimonial },
            message: 'Testimonial added successfully'
        });
    } catch (error) {
        console.error('Error adding testimonial:', error);
        return NextResponse.json({ success: false, message: 'Failed to add testimonial' }, { status: 500 });
    }
}
